const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Embedding Service
 * Uses Google AI API directly to generate embeddings for text
 */
class EmbeddingService {
  constructor(config = {}) {
    this.provider = config.provider || 'google-ai';
    this.model = config.model || process.env.GOOGLE_EMBEDDING_MODEL || 'text-embedding-004';
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.embeddingCache = new Map();
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text) {
    // Check cache first
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text);
    }

    try {
      // Use Google AI API directly for embeddings
      const embeddingModel = this.genAI.getGenerativeModel({ model: this.model });
      const result = await embeddingModel.embedContent(text);
      
      const embedding = result.embedding.values;
      
      // Cache the result
      this.embeddingCache.set(text, embedding);
      
      return embedding;
    } catch (error) {
      console.error('❌ Error generating embedding:', error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateEmbeddings(texts) {
    const embeddings = [];
    
    for (const text of texts) {
      try {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      } catch (error) {
        console.error(`⚠️  Error embedding text: ${error.message}`);
        embeddings.push(null);
      }
    }
    
    return embeddings;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2) return 0;
    if (embedding1.length !== embedding2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Clear the embedding cache
   */
  clearCache() {
    this.embeddingCache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize() {
    return this.embeddingCache.size;
  }
}

module.exports = EmbeddingService;
