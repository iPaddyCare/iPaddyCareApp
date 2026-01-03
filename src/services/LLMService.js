/**
 * LLM Service - Online API Integration
 * 
 * Uses online API (OpenAI/Gemini/Claude) to generate contextual responses
 * based on RAG context from disease detection
 */

// Load environment variables from .env file
import { GEMINI_API_KEY, OPENAI_API_KEY } from '@env';

// Note: Install @react-native-async-storage/async-storage first
// npm install @react-native-async-storage/async-storage
let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('AsyncStorage not installed. API key will not persist.');
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
}

const API_KEY_STORAGE_KEY = '@iPaddyCare:llm_api_key';
const API_PROVIDER_STORAGE_KEY = '@iPaddyCare:llm_provider';

class LLMService {
  constructor() {
    this.apiKey = null;
    this.apiProvider = 'openai'; // 'openai', 'gemini', 'claude'
    this.baseURL = 'https://api.openai.com/v1';
    this.initialized = false;
  }

  /**
   * Load API key from .env file or storage
   */
  async loadFromStorage() {
    try {
      // First, try to load from .env file (Gemini API key)
      if (GEMINI_API_KEY && GEMINI_API_KEY.trim()) {
        this.apiKey = GEMINI_API_KEY.trim();
        this.apiProvider = 'gemini';
        this.updateBaseURL();
        this.initialized = true;
        console.log('✅ LLM Service loaded from .env (Gemini)');
        return true;
      }
      
      // Try OpenAI from .env
      if (OPENAI_API_KEY && OPENAI_API_KEY.trim()) {
        this.apiKey = OPENAI_API_KEY.trim();
        this.apiProvider = 'openai';
        this.updateBaseURL();
        this.initialized = true;
        console.log('✅ LLM Service loaded from .env (OpenAI)');
        return true;
      }
      
      // Then try AsyncStorage (user-entered key)
      const storedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      const storedProvider = await AsyncStorage.getItem(API_PROVIDER_STORAGE_KEY);
      
      if (storedKey) {
        this.apiKey = storedKey;
        this.apiProvider = storedProvider || 'openai';
        this.updateBaseURL();
        this.initialized = true;
        console.log(`✅ LLM Service loaded from storage (${this.apiProvider})`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load API key:', error);
      return false;
    }
  }

  /**
   * Initialize with API key and save to storage
   * @param {string} apiKey - Your API key
   * @param {string} provider - 'openai', 'gemini', or 'claude'
   */
  async initialize(apiKey, provider = 'openai') {
    this.apiKey = apiKey;
    this.apiProvider = provider;
    this.updateBaseURL();
    
    // Save to storage
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      await AsyncStorage.setItem(API_PROVIDER_STORAGE_KEY, provider);
      this.initialized = true;
      console.log(`✅ LLM Service initialized with ${provider}`);
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw error;
    }
  }

  /**
   * Update base URL based on provider
   */
  updateBaseURL() {
    if (this.apiProvider === 'openai') {
      this.baseURL = 'https://api.openai.com/v1';
    } else if (this.apiProvider === 'gemini') {
      this.baseURL = 'https://generativelanguage.googleapis.com/v1';
    } else if (this.apiProvider === 'claude') {
      this.baseURL = 'https://api.anthropic.com/v1';
    }
  }

  /**
   * Clear API key from storage
   */
  async clearApiKey() {
    try {
      await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
      await AsyncStorage.removeItem(API_PROVIDER_STORAGE_KEY);
      this.apiKey = null;
      this.initialized = false;
      console.log('✅ API key cleared');
    } catch (error) {
      console.error('Failed to clear API key:', error);
    }
  }

  /**
   * Generate response using OpenAI API
   * @param {string} userQuestion - User's question
   * @param {object} ragContext - Context from RAG (disease info, solutions)
   * @returns {string} - Generated response
   */
  async generateResponse(userQuestion, ragContext) {
    if (!this.apiKey) {
      throw new Error('API key not set. Call initialize() first.');
    }

    try {
      // Build context from RAG data
      const contextPrompt = this.buildContextPrompt(ragContext);
      
      // Generate response based on provider
      if (this.apiProvider === 'openai') {
        return await this.generateOpenAI(userQuestion, contextPrompt);
      } else if (this.apiProvider === 'gemini') {
        return await this.generateGemini(userQuestion, contextPrompt);
      } else if (this.apiProvider === 'claude') {
        return await this.generateClaude(userQuestion, contextPrompt);
      }
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
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert agricultural advisor specializing in rice farming and pest/disease management. 
            Provide clear, practical, and actionable advice based on the context provided. 
            Answer in a friendly, helpful manner. If the context doesn't contain the answer, say so honestly.`
          },
          {
            role: 'user',
            content: `Context:\n${contextPrompt}\n\nQuestion: ${userQuestion}\n\nAnswer:`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
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
   * Generate response using Anthropic Claude API
   */
  async generateClaude(userQuestion, contextPrompt) {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `You are an expert agricultural advisor. Based on this context:\n\n${contextPrompt}\n\nQuestion: ${userQuestion}\n\nProvide a helpful answer:`
        }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API error');
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Check if service is initialized
   */
  isInitialized() {
    return this.initialized && this.apiKey !== null;
  }

  /**
   * Get current provider
   */
  getProvider() {
    return this.apiProvider;
  }
}

// Export singleton instance
export default new LLMService();

