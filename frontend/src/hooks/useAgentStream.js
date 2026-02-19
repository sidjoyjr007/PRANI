import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage, updateStreamingMessage } from '../store/slices/conversationSlice';

export const useAgentStream = () => {
    const dispatch = useDispatch();
    const [isStreaming, setIsStreaming] = useState(false);

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

        // 2. Optimistically add Assistant Message (Empty placeholder)
        // logic in reducer handles creating new if last is user
        // But to be safe, let's dispatch an empty assistant message so user sees "Thinking..." or just empty bubble?
        // Actually, updateStreamingMessage creates one if needed.
        // Let's NOT dispatch placeholder yet, let the first chunk create it.
        // OR dispatch one with content="" so the UI shows the "bot" bubble immediately.
        // Let's dispatch placeholder.

        // dispatch(addMessage({
        //     role: 'assistant',
        //     content: '',
        //     created_at: new Date().toISOString()
        // }));
        // Wait, if I do this, updateStreamingMessage will append to it. Correct.

        try {
            // 3. Make the API request
            // We use fetch directly because axios doesn't support streaming easily
            const response = await fetch(`http://localhost:8000/api/conversations/${sessionId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // TODO: Add auth if needed
                },
                body: JSON.stringify({
                    role: 'user',
                    content: content
                    // agent_id is inferred from conversation on backend
                })
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            // 4. Read the stream
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
                                // Dispatch error message?
                            } else if (data.content) {
                                dispatch(updateStreamingMessage({
                                    role: 'assistant',
                                    content: data.content
                                }));
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data", e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error("Streaming failed:", error);
            // Dispatch error feedback?
        } finally {
            setIsStreaming(false);
        }

    }, [dispatch]);

    return {
        streamMessage,
        isStreaming
    };
};
