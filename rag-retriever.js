const DocumentManager = require('./document-manager');
const EmbeddingService = require('./embedding-service');

/**
 * RAG Retriever
 * Retrieves relevant document chunks using vector similarity
 */
class RAGRetriever {
  constructor(config = {}) {
    this.documentManager = new DocumentManager(config.documentsPath);
    this.embeddingService = new EmbeddingService(config.embedding);
    this.indexedChunks = [];
    this.isIndexed = false;
  }

  /**
   * Load and index all documents
   */
  async indexDocuments() {
    console.log('\n🔍 Indexing documents for RAG retrieval...');
    
    // Load all documents
    await this.documentManager.loadAllDocuments();
    
    // Get all chunks
    const chunks = this.documentManager.getAllChunks();
    
    if (chunks.length === 0) {
      console.log('⚠️  No documents found to index');
      return;
    }

    console.log(`📊 Generating embeddings for ${chunks.length} chunks...`);
    
    // Generate embeddings for all chunks
    const embeddings = await this.embeddingService.generateEmbeddings(
      chunks.map(chunk => chunk.text)
    );
    
    // Store chunks with their embeddings
    this.indexedChunks = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index]
    }));
    
    this.isIndexed = true;
    console.log(`✅ Indexed ${this.indexedChunks.length} chunks with embeddings\n`);
  }

  /**
   * Retrieve relevant chunks for a query
   */
  async retrieve(query, topK = 3) {
    if (!this.isIndexed) {
      throw new Error('Documents not indexed. Call indexDocuments() first.');
    }

    console.log(`\n🔎 Retrieving relevant chunks for query: "${query}"`);
    console.log(`📍 Searching among ${this.indexedChunks.length} indexed chunks...`);
    
    // Generate embedding for the query
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);
    
    // Calculate similarity scores for all chunks
    const scoredChunks = this.indexedChunks.map(chunk => ({
      ...chunk,
      similarity: this.embeddingService.cosineSimilarity(
        queryEmbedding,
        chunk.embedding
      )
    }));
    
    // Sort by similarity (highest first) and take top K
    const topChunks = scoredChunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
    
    console.log(`✅ Retrieved ${topChunks.length} most relevant chunks:\n`);
    
    topChunks.forEach((chunk, index) => {
      console.log(`${index + 1}. Source: ${chunk.source} (Similarity: ${(chunk.similarity * 100).toFixed(2)}%)`);
      console.log(`   Preview: ${chunk.text.substring(0, 100)}...`);
      console.log('');
    });
    
    return topChunks;
  }

  /**
   * Retrieve and format context for LLM
   */
  async retrieveContext(query, topK = 3) {
    const relevantChunks = await this.retrieve(query, topK);
    
    // Format chunks into context string
    const context = relevantChunks.map((chunk, index) => {
      return `[Source ${index + 1}: ${chunk.source}]
${chunk.text}`;
    }).join('\n\n');
    
    return {
      context,
      chunks: relevantChunks,
      sources: [...new Set(relevantChunks.map(c => c.source))]
    };
  }

  /**
   * Get all indexed documents
   */
  getDocuments() {
    return this.documentManager.getDocuments();
  }

  /**
   * Check if documents are indexed
   */
  isReady() {
    return this.isIndexed;
  }

  /**
   * Clear index and cache
   */
  clear() {
    this.indexedChunks = [];
    this.isIndexed = false;
    this.documentManager.clearDocuments();
    this.embeddingService.clearCache();
  }
}

module.exports = RAGRetriever;
