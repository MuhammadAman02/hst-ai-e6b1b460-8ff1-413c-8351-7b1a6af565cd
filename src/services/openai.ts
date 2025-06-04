interface Message {
  role: 'user' | 'assistant';
  content: string;
}

class OpenAIService {
  private apiKey: string = '';

  constructor() {
    // Load API key from localStorage on initialization
    this.loadApiKey();
    console.log('OpenAI service initialized');
  }

  private loadApiKey() {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      this.apiKey = storedKey;
      console.log('API key loaded from localStorage');
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    console.log('API key set in service');
  }

  getApiKey(): string {
    return this.apiKey;
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async sendMessage(message: string, history: any[] = []): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set your API key in settings.');
    }

    console.log('Sending message to OpenAI:', message);
    console.log('Message history length:', history.length);

    // Convert history to OpenAI format
    const messages: Message[] = [
      {
        role: 'user',
        content: 'You are a helpful AI assistant. Please provide helpful, accurate, and friendly responses.'
      },
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your API key permissions.');
        } else {
          throw new Error(`OpenAI API error: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('OpenAI response received:', data);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
}

export const openAIService = new OpenAIService();