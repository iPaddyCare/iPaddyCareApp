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
  async loadFromEnv() {
    try {
      // Load from .env file (OpenAI API key)
      if (OPENAI_API_KEY && OPENAI_API_KEY.trim()) {
        this.apiKey = OPENAI_API_KEY.trim();
        this.initialized = true;
        return true;
      }

      console.warn('OPENAI_API_KEY not found in .env file');
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
  }

  /**
   * Clear API key
   */
  async clearApiKey() {
    this.apiKey = null;
    this.initialized = false;
  }

  /**
   * Generate response using OpenAI API
   * @param {string} userQuestion - User's question
   * @param {object} ragContext - Context from RAG (disease info, solutions)
   * @param {string} [language] - 'English' | 'සිංහල' | 'தமிழ்' — controls which RAG
   *                              fields feed the prompt and which language the model
   *                              should reply in. Defaults to English.
   * @returns {string} - Generated response
   */
  async generateResponse(userQuestion, ragContext, language = 'English') {
    if (!this.apiKey) {
      throw new Error('API key not set. Call initialize() or loadFromEnv() first.');
    }

    try {
      const contextPrompt = this.buildContextPrompt(ragContext, language);
      return await this.generateOpenAI(userQuestion, contextPrompt, language);
    } catch (error) {
      console.error('LLM API error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  /**
   * Build context prompt from RAG data, picking localized fields when the user
   * is on Sinhala or Tamil so the model has same-language source material to
   * ground its answer.
   */
  buildContextPrompt(ragContext, language = 'English') {
    if (!ragContext || !ragContext.found) {
      return 'No specific disease information available.';
    }

    const sfx = language === 'සිංහල' ? '_si' : language === 'தமிழ்' ? '_ta' : '';
    const localized = (obj, base) => (sfx && obj?.[base + sfx]) || obj?.[base] || '';

    let prompt = `Disease Information:\n`;
    prompt += `Name: ${localized(ragContext, 'diseaseName')}\n`;
    prompt += `Description: ${localized(ragContext, 'description')}\n`;
    prompt += `Severity: ${ragContext.severity}\n\n`;

    if (ragContext.solutions && ragContext.solutions.length > 0) {
      prompt += `Treatment Solutions:\n`;
      ragContext.solutions.forEach((solution, index) => {
        prompt += `${index + 1}. ${localized(solution, 'title')}: ${localized(solution, 'description')}\n`;
      });
      prompt += `\n`;
    }

    const prevention = (sfx && ragContext[`prevention${sfx}`]) || ragContext.prevention || [];
    if (prevention.length > 0) {
      prompt += `Prevention Tips:\n`;
      prevention.forEach((tip) => {
        prompt += `- ${tip}\n`;
      });
    }

    return prompt;
  }

  /**
   * Generate response using OpenAI API
   */
  async generateOpenAI(userQuestion, contextPrompt, language = 'English') {
    const modelName = 'gpt-3.5-turbo';
    const replyInstruction =
      language === 'සිංහල'
        ? 'Reply in Sinhala (සිංහල). Keep chemical names (e.g. Mancozeb, Tebuconazole) in Latin script. Preserve numerical values and units verbatim.'
        : language === 'தமிழ்'
        ? 'Reply in Tamil (தமிழ்). Keep chemical names (e.g. Mancozeb, Tebuconazole) in Latin script. Preserve numerical values and units verbatim.'
        : 'Reply in English.';

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
              content: `You are a polite and helpful agricultural advisor for paddy crops. Answer questions briefly and clearly based on the provided context. ${replyInstruction}`
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

  /**
   * Infer which diseases / pests a marketplace product treats, picking from a fixed list.
   * Uses OpenAI's JSON mode so we get a parseable structured response, then validates
   * every suggestion against the allowed list to prevent hallucinations.
   *
   * @param {{ productName?: string, activeIngredient?: string, description?: string, category?: string }} product
   * @param {string[]} diseaseOptions - allowed disease names; the model can only return values from this list
   * @returns {Promise<string[]>} array of disease names from diseaseOptions
   */
  async inferDiseaseTagsForProduct(product, diseaseOptions) {
    if (!this.apiKey) {
      throw new Error('API key not set. Call loadFromEnv() first.');
    }
    if (!Array.isArray(diseaseOptions) || diseaseOptions.length === 0) {
      return [];
    }

    const productSummary = [
      `Category: ${product.category || 'unknown'}`,
      `Name: ${product.productName || ''}`,
      `Active Ingredient: ${product.activeIngredient || ''}`,
      `Description: ${product.description || ''}`,
    ].join('\n');

    const systemPrompt =
      'You are an agronomy classifier for paddy/rice products. Given a marketplace product ' +
      '(name, active ingredient, description, category), determine which diseases or pests ' +
      'from the provided list it can effectively treat. Be conservative — only include matches ' +
      'you are confident about based on the active ingredient and product type. ' +
      'Return strict JSON of the form {"diseases": ["Name1", "Name2"]} where every value is ' +
      'copied verbatim from the allowed list. If unsure, return {"diseases": []}.';

    const userPrompt =
      `Product:\n${productSummary}\n\n` +
      `Allowed diseases / pests (return only values from this list, exact spelling):\n` +
      JSON.stringify(diseaseOptions);

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error (${response.status})`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }

    const suggested = Array.isArray(parsed.diseases) ? parsed.diseases : [];
    const allowed = new Set(diseaseOptions);
    const seen = new Set();
    const out = [];
    for (const item of suggested) {
      if (typeof item !== 'string') continue;
      if (!allowed.has(item) || seen.has(item)) continue;
      seen.add(item);
      out.push(item);
    }
    return out;
  }
}

// Export singleton instance
export default new LLMService();
