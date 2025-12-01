import { GoogleGenerativeAI } from '@google/generative-ai';

interface EmbeddingConfig {
  provider?: string;
  model?: string;
}

export class EmbeddingService {
  private provider: string;
  private model: string;
  private genAI: GoogleGenerativeAI;
  private embeddingCache: Map<string, number[]>;

  constructor(config: EmbeddingConfig = {}) {
    this.provider = config.provider || 'google-ai';
    this.model = config.model || process.env.GOOGLE_EMBEDDING_MODEL || 'text-embedding-004';
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || '');
    this.embeddingCache = new Map();
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await model.embedContent(text);
      const embedding = result.embedding.values;
      
      // Cache the result
      this.embeddingCache.set(text, embedding);
      
      return embedding;
    } catch (error) {
      const err = error as Error;
      console.error('Error generating embedding:', err.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    for (const text of texts) {
      try {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      } catch (error) {
        const err = error as Error;
        console.error(`Error generating embedding for text: ${err.message}`);
        embeddings.push([]);
      }
    }
    
    return embeddings;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(embeddingA: number[], embeddingB: number[]): number {
    if (embeddingA.length !== embeddingB.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < embeddingA.length; i++) {
      dotProduct += embeddingA[i] * embeddingB[i];
      normA += embeddingA[i] * embeddingA[i];
      normB += embeddingB[i] * embeddingB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Clear the embedding cache
   */
  clearCache(): void {
    this.embeddingCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.embeddingCache.size,
      provider: this.provider,
      model: this.model
    };
  }
}
