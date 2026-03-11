import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage, handleAgentEvent } from '../store/slices/conversationSlice';

export const useAgentStream = (sessionId) => {
    const dispatch = useDispatch();
    const [isStreaming, setIsStreaming] = useState(false);

    const activeSessionRef = useRef(null);
    const abortControllerRef = useRef(null);

    const disconnectStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        activeSessionRef.current = null;
        setIsStreaming(false);
    }, []);

    const connectStream = useCallback(async (targetSessionId) => {
        if (!targetSessionId) return;

        // Already connected or connecting to this session
        if (activeSessionRef.current === targetSessionId) return;

        disconnectStream();
        activeSessionRef.current = targetSessionId;

        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        let isConnected = true;

        try {
            const response = await fetch(`http://localhost:8000/api/conversations/${targetSessionId}/events`, {
                headers: {
                    'Accept': 'text/event-stream'
                },
                credentials: 'include',
                signal: abortController.signal
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            // Connection is open, start reading in the background
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Background reader loop
            (async () => {
                let chunkBuffer = {}; // { type: text }
                let lastDispatch = Date.now();
                const BATCH_INTERVAL = 80; // ms

                const flushBuffer = () => {
                    Object.keys(chunkBuffer).forEach(type => {
                        if (chunkBuffer[type]) {
                            dispatch(handleAgentEvent({ type, content: chunkBuffer[type] }));
                            chunkBuffer[type] = "";
                        }
                    });
                    lastDispatch = Date.now();
                };

                try {
                    while (isConnected && abortControllerRef.current === abortController) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.slice(6).trim();
                                if (!dataStr) continue;

                                try {
                                    const data = JSON.parse(dataStr);

                                    if (data.error) {
                                        console.error("Stream error:", data.error);
                                        dispatch(handleAgentEvent({ type: 'error', content: data.error }));
                                    } else {
                                        if (data.type === 'loop_complete' || data.type === 'error' || data.type === 'approval_required') {
                                            flushBuffer();
                                            setIsStreaming(false);
                                        }

                                        // Batching logic for chunks
                                        if (data.type === 'message_chunk' || data.type === 'thought_chunk') {
                                            chunkBuffer[data.type] = (chunkBuffer[data.type] || "") + data.content;

                                            if (Date.now() - lastDispatch > BATCH_INTERVAL) {
                                                flushBuffer();
                                            }
                                        } else {
                                            // Non-chunk events are dispatched immediately after flushing existing chunks
                                            flushBuffer();
                                            if (data.content && !data.type) {
                                                dispatch(handleAgentEvent({
                                                    type: 'message',
                                                    content: data.content,
                                                    role: data.role || 'assistant'
                                                }));
                                            } else {
                                                dispatch(handleAgentEvent(data));
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.error("Error parsing SSE data", e, dataStr);
                                }
                            }
                        }
                    }
                    flushBuffer(); // Final flush
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error("SSE read failed:", error);
                    }
                } finally {
                    setIsStreaming(false);
                    if (abortControllerRef.current === abortController) {
                        activeSessionRef.current = null;
                    }
                }
            })();

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("SSE connection failed:", error);
                activeSessionRef.current = null;
            }
        }
    }, [dispatch, disconnectStream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => disconnectStream();
    }, [disconnectStream]);

    const streamMessage = useCallback(async (currentSessionId, content, agentId) => {
        if (!currentSessionId || !content) return;

        // Optimistically add User Message
        const userMsg = {
            role: 'user',
            content: content,
            created_at: new Date().toISOString()
        };
        dispatch(addMessage(userMsg));

        try {
            // Make the API request - background processing
            const response = await fetch(`http://localhost:8000/api/conversations/${currentSessionId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    role: 'user',
                    content: content
                })
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            setIsStreaming(true);

        } catch (error) {
            console.error("Sending message failed:", error);
            dispatch(handleAgentEvent({ type: 'error', content: error.message }));
        }

    }, [dispatch]);

    const abortStream = useCallback(async (currentSessionId) => {
        if (!currentSessionId) return;

        // Optimistically set UI to stopped
        setIsStreaming(false);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        dispatch(handleAgentEvent({ type: 'error', content: 'Agent execution aborted by user.' }));

        try {
            const response = await fetch(`http://localhost:8000/api/conversations/${currentSessionId}/abort`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            if (!response.ok) {
                console.error("Failed to abort stream");
            }
        } catch (error) {
            console.error("Abort failed:", error);
        }
    }, [dispatch]);

    const resumeStream = useCallback(async (currentSessionId, approvedToolCalls) => {
        if (!currentSessionId) return;

        try {
            const response = await fetch(`http://localhost:8000/api/conversations/${currentSessionId}/resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    approved_tool_calls: approvedToolCalls
                })
            });

            if (!response.ok) {
                throw new Error("Failed to resume conversation");
            }

            setIsStreaming(true);

        } catch (error) {
            console.error("Resume failed:", error);
            dispatch(handleAgentEvent({ type: 'error', content: error.message }));
        }
    }, [dispatch]);

    return {
        streamMessage,
        resumeStream,
        abortStream,
        connectStream,
        disconnectStream,
        isStreaming,
        setIsStreaming
    };
};
