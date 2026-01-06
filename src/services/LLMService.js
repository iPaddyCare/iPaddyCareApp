
import { GEMINI_API_KEY } from '@env';

class LLMService {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1';
    this.initialized = false;
  }

  /**
   * Load API key from .env file
   */
  async loadFromStorage() {
    try {
      // Load from .env file (Gemini API key)
      if (GEMINI_API_KEY && GEMINI_API_KEY.trim()) {
        this.apiKey = GEMINI_API_KEY.trim();
        this.initialized = true;
        console.log('✅ LLM Service loaded from .env (Gemini)');
        return true;
      }
      
      console.warn('⚠️ GEMINI_API_KEY not found in .env file');
      return false;
    } catch (error) {
      console.error('Failed to load API key:', error);
      return false;
    }
  }

  /**
   * Initialize with API key (manual override if needed)
   * @param {string} apiKey - Your Gemini API key
   */
  async initialize(apiKey) {
    this.apiKey = apiKey;
    this.initialized = true;
    console.log('✅ LLM Service initialized with Gemini');
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
   * Generate response using Gemini API
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
      
      // Generate response using Gemini
      return await this.generateGemini(userQuestion, contextPrompt);
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
   * Generate response using Google Gemini API
   */
  async generateGemini(userQuestion, contextPrompt) {
    const response = await fetch(
      `${this.baseURL}/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert agricultural advisor. Based on this context:\n\n${contextPrompt}\n\nQuestion: ${userQuestion}\n\nProvide a helpful answer:`
            }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
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

