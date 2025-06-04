import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const sendChatMessage = async (message: string, history: ChatMessage[] = []) => {
  console.log('Sending chat message to OpenAI:', message);
  console.log('Chat history length:', history.length);

  try {
    const messages: ChatMessage[] = [
      {
        role: 'user' as const,
        content: 'You are a helpful AI assistant. Please provide helpful, accurate, and friendly responses.'
      },
      ...history.slice(-10), // Keep last 10 messages for context
      {
        role: 'user' as const,
        content: message
      }
    ];

    console.log('Prepared messages for OpenAI:', messages);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    console.log('OpenAI response:', response);

    return response;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get response from OpenAI');
  }
};