import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage, handleAgentEvent } from '../store/slices/conversationSlice';

export const useAgentStream = () => {
    const dispatch = useDispatch();
    const [isStreaming, setIsStreaming] = useState(false);

    const processStream = async (response) => {
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6);
                    if (dataStr === '[DONE]') break;

                    try {
                        const data = JSON.parse(dataStr);

                        if (data.error) {
                            console.error("Stream error:", data.error);
                            dispatch(handleAgentEvent({ type: 'error', content: data.error }));
                        } else {
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
                    } catch (e) {
                        console.error("Error parsing SSE data", e);
                    }
                }
            }
        }
    };

    const streamMessage = useCallback(async (sessionId, content, agentId) => {
        if (!sessionId || !content) return;

        setIsStreaming(true);

        // 1. Optimistically add User Message
        const userMsg = {
            role: 'user',
            content: content,
            created_at: new Date().toISOString()
        };
        dispatch(addMessage(userMsg));

        try {
            // 2. Make the API request
            const response = await fetch(`http://localhost:8000/api/conversations/${sessionId}/messages`, {
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

            await processStream(response);

        } catch (error) {
            console.error("Streaming failed:", error);
            dispatch(handleAgentEvent({ type: 'error', content: error.message }));
        } finally {
            setIsStreaming(false);
        }

    }, [dispatch]);

    const resumeStream = useCallback(async (sessionId, approvedToolCalls) => {
        if (!sessionId) return;
        setIsStreaming(true);

        try {
            const response = await fetch(`http://localhost:8000/api/conversations/${sessionId}/resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    approved_tool_calls: approvedToolCalls
                })
            });

            await processStream(response);

        } catch (error) {
            console.error("Resume failed:", error);
            dispatch(handleAgentEvent({ type: 'error', content: error.message }));
        } finally {
            setIsStreaming(false);
        }
    }, [dispatch]);

    return {
        streamMessage,
        resumeStream,
        isStreaming
    };
};
