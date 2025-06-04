import OpenAI from 'openai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

class OpenAIService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('Initializing OpenAI service, API key present:', !!apiKey);
    
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend API
      });
    }
  }

  async sendMessage(message: string, history: Message[] = []): Promise<string> {
    console.log('OpenAI service: sending message', message);
    
    if (!this.openai) {
      console.error('OpenAI not initialized - missing API key');
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
    }

    try {
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a helpful AI assistant. Provide helpful, accurate, and friendly responses.'
        },
        ...history.slice(-10).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: message
        }
      ];

      console.log('Sending to OpenAI with messages:', messages.length);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      console.log('OpenAI response received:', response.substring(0, 100) + '...');
      
      return response;
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error('Failed to get response from OpenAI');
    }
  }
}

export const openAIService = new OpenAIService();