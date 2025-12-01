import { DocumentManager } from './document-manager.js';
import { EmbeddingService } from './embedding-service.js';
import { ChunkWithScore } from './types.js';

export class RAGRetriever {
  private documentManager: DocumentManager;
  private embeddingService: EmbeddingService;
  private chunkEmbeddings: Map<string, number[]>;

  constructor(documentManager: DocumentManager, embeddingService: EmbeddingService) {
    this.documentManager = documentManager;
    this.embeddingService = embeddingService;
    this.chunkEmbeddings = new Map();
  }

  /**
   * Index all document chunks by generating embeddings
   */
  async indexDocuments(): Promise<void> {
    console.log('🔍 Indexing documents for RAG retrieval...\n');
    
    const chunks = this.documentManager.getAllChunks();
    
    if (chunks.length === 0) {
      console.log('⚠️  No documents found to index');
      return;
    }

    console.log(`📊 Generating embeddings for ${chunks.length} chunks...`);
    
    // Generate embeddings for all chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embedding = await this.embeddingService.generateEmbedding(chunk.text);
        this.chunkEmbeddings.set(`${chunk.source}-${chunk.chunkIndex}`, embedding);
        
        if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
          process.stdout.write(`\r✨ Indexed ${i + 1}/${chunks.length} chunks`);
        }
      } catch (error) {
        const err = error as Error;
        console.error(`\n❌ Error indexing chunk ${i}:`, err.message);
      }
    }
    
    console.log(`\n✅ Indexed ${this.chunkEmbeddings.size} chunks\n`);
  }

  /**
   * Retrieve relevant chunks based on query
   */
  async retrieve(query: string, topK = 5): Promise<ChunkWithScore[]> {
    if (this.chunkEmbeddings.size === 0) {
      console.log('⚠️  No indexed chunks available');
      return [];
    }

    // Generate query embedding
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    
    // Calculate similarity scores for all chunks
    const chunks = this.documentManager.getAllChunks();
    const scores: ChunkWithScore[] = [];

    for (const chunk of chunks) {
      const chunkKey = `${chunk.source}-${chunk.chunkIndex}`;
      const chunkEmbedding = this.chunkEmbeddings.get(chunkKey);
      
      if (chunkEmbedding) {
        const similarity = this.embeddingService.cosineSimilarity(
          queryEmbedding,
          chunkEmbedding
        );
        
        scores.push({
          text: chunk.text,
          score: similarity,
          source: chunk.source
        });
      }
    }

    // Sort by similarity and return top K
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
  }

  /**
   * Format retrieved chunks for context
   */
  formatContext(chunks: ChunkWithScore[]): string {
    if (chunks.length === 0) {
      return 'No relevant document context found.';
    }

    let context = 'Relevant document context:\n\n';
    
    chunks.forEach((chunk, index) => {
      context += `[${index + 1}] From ${chunk.source} (Relevance: ${(chunk.score * 100).toFixed(1)}%):\n`;
      context += `${chunk.text}\n\n`;
    });

    return context;
  }

  /**
   * Get retrieval statistics
   */
  getStats() {
    return {
      totalChunks: this.documentManager.getAllChunks().length,
      indexedChunks: this.chunkEmbeddings.size,
      documents: this.documentManager.getDocuments().length
    };
  }

  /**
   * Clear all indexed data
   */
  clear(): void {
    this.chunkEmbeddings.clear();
    this.embeddingService.clearCache();
  }
}
