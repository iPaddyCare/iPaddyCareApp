/**
 * RAG (Retrieval-Augmented Generation) Service
 * Offline solution retrieval based on detected disease/pest
 * 
 * This service loads disease/pest data from JSON and provides
 * solutions based on the detected disease name.
 */

// Load disease data - using require for React Native compatibility
const diseaseData = require('../../rag-data/pest-disease-solutions.json');

class RAGService {
  constructor() {
    this.diseaseDatabase = null;
    this.initialized = false;
  }

  /**
   * Initialize the RAG service by loading disease data
   */
  async initialize() {
    try {
      // Load disease data from JSON file
      this.diseaseDatabase = diseaseData;
      this.initialized = true;
      console.log('RAG Service initialized with', this.diseaseDatabase.length, 'diseases');
      return true;
    } catch (error) {
      console.error('Failed to initialize RAG Service:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Search for disease/pest by name (fuzzy matching)
   * @param {string} diseaseName - Name of the detected disease
   * @returns {Object|null} - Disease data with solutions
   */
  searchDisease(diseaseName) {
    if (!this.initialized) {
      console.warn('RAG Service not initialized');
      return null;
    }

    // Normalize search term: lowercase and trim
    const normalizedSearch = diseaseName.toLowerCase().trim();

    // Priority 1: Exact match on model_var (the actual class label from model)
    let match = this.diseaseDatabase.find(
      disease => disease.model_var && disease.model_var.toLowerCase() === normalizedSearch
    );

    // Priority 2: Exact match on disease name
    if (!match) {
      const normalizedSearchSpace = normalizedSearch.replace(/_/g, ' ');
      match = this.diseaseDatabase.find(
        disease => disease.name.toLowerCase().replace(/_/g, ' ') === normalizedSearchSpace
      );
    }

    // Priority 3: Fuzzy match on name or aliases
    if (!match) {
      const normalizedSearchSpace = normalizedSearch.replace(/_/g, ' ');
      match = this.diseaseDatabase.find(disease => {
        const name = disease.name.toLowerCase().replace(/_/g, ' ');
        const aliases = (disease.aliases || []).map(a => a.toLowerCase().replace(/_/g, ' '));
        
        return name === normalizedSearchSpace ||
               name.includes(normalizedSearchSpace) || 
               normalizedSearchSpace.includes(name) ||
               aliases.some(alias => alias === normalizedSearchSpace || alias.includes(normalizedSearchSpace) || normalizedSearchSpace.includes(alias));
      });
    }

    return match || null;
  }

  /**
   * Get solution for detected disease
   * @param {string} diseaseName - Detected disease name from CNN
   * @returns {Object} - Solution object with treatment steps
   */
  getSolution(diseaseName) {
    // Handle "normal" (healthy crop) specially
    const normalizedName = diseaseName.toLowerCase().trim();
    if (normalizedName === 'normal') {
      return {
        found: true,
        diseaseName: 'Healthy Crop',
        description: 'There is nothing wrong with your crop. No disease or pest detected.',
        severity: 'none',
        solutions: [],
        prevention: [],
        images: []
      };
    }

    // Search for actual diseases
    const disease = this.searchDisease(diseaseName);

    if (!disease) {
      return {
        found: false,
        diseaseName,
        message: 'Disease not found in database. Please consult an agricultural expert.',
        solutions: []
      };
    }

    return {
      found: true,
      diseaseName: disease.name,
      aliases: disease.aliases || [],
      description: disease.description || '',
      severity: disease.severity || 'medium',
      solutions: disease.solutions || [],
      prevention: disease.prevention || [],
      images: disease.images || []
    };
  }

  /**
   * Get all available diseases (for testing/debugging)
   */
  getAllDiseases() {
    return this.diseaseDatabase || [];
  }
}

// Export singleton instance
export default new RAGService();




