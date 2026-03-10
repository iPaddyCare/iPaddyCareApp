import { OPENAI_API_KEY } from '@env';

class LLMService {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.openai.com/v1';
    this.initialized = false;
  }

  /**
   * Load API key from .env file
   */
  async loadFromStorage() {
    try {
      // Load from .env file (OpenAI API key)
      if (OPENAI_API_KEY && OPENAI_API_KEY.trim()) {
        this.apiKey = OPENAI_API_KEY.trim();
        this.initialized = true;
        console.log('✅ LLM Service loaded from .env (OpenAI)');
        return true;
      }
      
      console.warn('⚠️ OPENAI_API_KEY not found in .env file');
      return false;
    } catch (error) {
      console.error('Failed to load API key:', error);
      return false;
    }
  }

  /**
   * Initialize with API key (manual override if needed)
   * @param {string} apiKey - Your OpenAI API key
   */
  async initialize(apiKey) {
    this.apiKey = apiKey;
    this.initialized = true;
    console.log('✅ LLM Service initialized with OpenAI');
  }

  /**
   * Clear API key
   */
  async clearApiKey() {
    this.apiKey = null;
    this.initialized = false;
    console.log('✅ API key cleared');
  }

  /**
   * Generate response using OpenAI API
   * @param {string} userQuestion - User's question
   * @param {object} ragContext - Context from RAG (disease info, solutions)
   * @returns {string} - Generated response
   */
  async generateResponse(userQuestion, ragContext) {
    if (!this.apiKey) {
      throw new Error('API key not set. Call initialize() or loadFromStorage() first.');
    }

    try {
      // Build context from RAG data
      const contextPrompt = this.buildContextPrompt(ragContext);
      
      // Generate response using OpenAI
      return await this.generateOpenAI(userQuestion, contextPrompt);
    } catch (error) {
      console.error('LLM API error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Build context prompt from RAG data
   */
  buildContextPrompt(ragContext) {
    if (!ragContext || !ragContext.found) {
      return 'No specific disease information available.';
    }

    let prompt = `Disease Information:\n`;
    prompt += `Name: ${ragContext.diseaseName}\n`;
    prompt += `Description: ${ragContext.description}\n`;
    prompt += `Severity: ${ragContext.severity}\n\n`;
    
    if (ragContext.solutions && ragContext.solutions.length > 0) {
      prompt += `Treatment Solutions:\n`;
      ragContext.solutions.forEach((solution, index) => {
        prompt += `${index + 1}. ${solution.title}: ${solution.description}\n`;
      });
      prompt += `\n`;
    }
    
    if (ragContext.prevention && ragContext.prevention.length > 0) {
      prompt += `Prevention Tips:\n`;
      ragContext.prevention.forEach((tip, index) => {
        prompt += `- ${tip}\n`;
      });
    }

    return prompt;
  }

  /**
   * Generate response using OpenAI API
   */
  async generateOpenAI(userQuestion, contextPrompt) {
    // Use gpt-3.5-turbo (cheaper) or gpt-4 (better quality) depending on your needs
    const modelName = 'gpt-3.5-turbo';
    
    const response = await fetch(
      `${this.baseURL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'system',
              content: 'You are a polite and helpful agricultural advisor for paddy crops. Answer questions briefly and clearly based on the provided context.'
            },
            {
              role: 'user',
              content: `Context:\n${contextPrompt}\n\nQuestion: ${userQuestion}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || 'OpenAI API error';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Check if service is initialized
   */
  isInitialized() {
    return this.initialized && this.apiKey !== null;
  }
}

// Export singleton instance
export default new LLMService();
