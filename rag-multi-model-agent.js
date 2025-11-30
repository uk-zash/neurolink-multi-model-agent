require('dotenv').config();
const { NeuroLink } = require('@juspay/neurolink');
const RAGRetriever = require('./rag-retriever');
const WebSearchService = require('./web-search');

/**
 * RAG-Enhanced Multi-Model Evaluation Agent
 * 
 * Architecture:
 * 1. Retrieve relevant information from documents (RAG)
 * 2. Enhance query based on document context
 * 3. Search the web with enhanced query
 * 4. Generate response using query + documents + web results
 * 5. Evaluate response with multiple models
 * 6. Aggregate evaluations and produce final response
 */
class RAGMultiModelAgent {
  constructor(config = {}) {
    // Use free tier model from environment
    const freeModel = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash-lite';
    
    // Primary model configuration
    this.primaryProvider = config.primaryProvider || 'google-ai';
    this.primaryModel = config.primaryModel || freeModel;
    
    // Evaluation models (all using free tier)
    this.evaluationModels = config.evaluationModels || [
      { provider: 'google-ai', model: freeModel, name: 'Evaluator-1' },
      { provider: 'google-ai', model: freeModel, name: 'Evaluator-2' },
      { provider: 'google-ai', model: freeModel, name: 'Evaluator-3' }
    ];
    
    // Aggregator model (using free tier)
    this.aggregatorProvider = config.aggregatorProvider || 'google-ai';
    this.aggregatorModel = config.aggregatorModel || freeModel;
    
    // RAG configuration
    this.ragRetriever = new RAGRetriever({
      documentsPath: config.documentsPath || './documents',
      embedding: {
        provider: 'google-ai',
        model: process.env.GOOGLE_EMBEDDING_MODEL || 'text-embedding-004'
      }
    });
    
    // Web search service
    this.webSearch = new WebSearchService({
      provider: this.primaryProvider,
      model: this.primaryModel
    });
    
    // NeuroLink instance
    this.neurolink = new NeuroLink({
      enableAnalytics: true,
      enableEvaluation: false
    });
    
    this.topK = config.topK || 3; // Number of document chunks to retrieve
  }

  /**
   * Initialize the RAG system by indexing documents
   */
  async initialize() {
    console.log('\n' + '█'.repeat(80));
    console.log('🚀 INITIALIZING RAG MULTI-MODEL AGENT');
    console.log('█'.repeat(80));
    
    await this.ragRetriever.indexDocuments();
    
    console.log('✅ Agent ready to process queries\n');
  }

  /**
   * Step 1: Retrieve relevant document context
   */
  async retrieveDocumentContext(userQuery) {
    console.log('\n📚 Step 1: Retrieving relevant information from documents...');
    
    if (!this.ragRetriever.isReady()) {
      console.log('⚠️  No documents indexed. Proceeding without document context.');
      return {
        context: '',
        chunks: [],
        sources: []
      };
    }
    
    const retrieval = await this.ragRetriever.retrieveContext(userQuery, this.topK);
    
    console.log(`✅ Retrieved context from ${retrieval.sources.length} source(s)`);
    console.log('-'.repeat(80));
    console.log(retrieval.context.substring(0, 500) + '...');
    console.log('-'.repeat(80));
    
    return retrieval;
  }

  /**
   * Step 2: Enhance query based on document context
   */
  async enhanceQuery(userQuery, documentContext) {
    console.log('\n🔧 Step 2: Enhancing query with document context...');
    
    if (!documentContext || documentContext.length === 0) {
      console.log('⚠️  No document context available. Using original query.');
      return { original: userQuery, enhanced: userQuery };
    }
    
    const enhancement = await this.webSearch.enhanceQuery(userQuery, documentContext);
    return enhancement;
  }

  /**
   * Step 3: Perform web search
   */
  async performWebSearch(enhancedQuery) {
    console.log('\n🌐 Step 3: Searching the web...');
    
    const searchResults = await this.webSearch.search(enhancedQuery, 3);
    return searchResults;
  }

  /**
   * Step 4: Generate comprehensive response
   */
  async generateResponse(userQuery, documentContext, webSearchResults) {
    console.log('\n🤖 Step 4: Generating comprehensive response...');
    console.log(`Provider: ${this.primaryProvider}, Model: ${this.primaryModel}\n`);
    
    const prompt = `You are a helpful AI assistant. Answer the user's query PRIMARILY using the uploaded document context. Web search results should only supplement information that's missing from the documents.

**User Query:**
${userQuery}

**PRIMARY SOURCE - Uploaded Document Context:**
${documentContext || 'No document context available.'}

**SUPPLEMENTARY SOURCE - Web Search Results (use only if documents don't have the information):**
${webSearchResults.results || 'No web search results available.'}

**CRITICAL INSTRUCTIONS:**
1. **PRIORITIZE DOCUMENTS FIRST**: Base your answer primarily on the uploaded document context
2. **Use web search sparingly**: Only use web search to fill gaps or provide additional recent information not in documents
3. **Clear Source Attribution**: Always indicate when information comes from documents vs. web
4. **Document Authority**: Treat uploaded documents as the primary authoritative source
5. **Comprehensive Answer**: Provide detailed information from the documents first, then supplement with web if needed

**Response Structure:**
- Start with information from uploaded documents
- Clearly mark any supplementary web information as "Additional context from web:"
- Cite sources explicitly

**Your Response:**`;

    try {
      const result = await this.neurolink.generate({
        input: { text: prompt },
        provider: this.primaryProvider,
        model: this.primaryModel
      });
      
      const response = result.text || result.content || result.response || '';
      
      console.log('✅ Response Generated:');
      console.log('-'.repeat(80));
      console.log(response);
      console.log('-'.repeat(80));
      
      return response;
      
    } catch (error) {
      console.error('❌ Error generating response:', error.message);
      throw error;
    }
  }

  /**
   * Step 5: Evaluate response with multiple models
   */
  async evaluateResponse(userQuery, response, documentContext, webSearchResults) {
    console.log('\n🔍 Step 5: Evaluating response with multiple models...\n');
    
    const evaluationPrompt = `You are an expert evaluator. Analyze the following response to a user query. The response was generated using both document context and web search results.

**User Query:** "${userQuery}"

**Response to Evaluate:**
"""
${response}
"""

**Available Context:**
- Document Context: ${documentContext ? 'Yes' : 'No'}
- Web Search Results: ${webSearchResults ? 'Yes' : 'No'}

Evaluate the response on:
1. **Accuracy Score** (0-10): Factual correctness
2. **Relevance Score** (0-10): Alignment with query
3. **Completeness Score** (0-10): Comprehensiveness
4. **Source Integration** (0-10): How well it uses documents and web results
5. **Clarity Score** (0-10): Clear communication
6. **Overall Score** (0-10): Holistic assessment
7. **Key Strengths**: Main strengths
8. **Areas for Improvement**: What could be better
9. **Recommendation**: Accept/Enhance/Rewrite

Provide structured evaluation.`;

    const evaluationPromises = this.evaluationModels.map(async (evalModel) => {
      console.log(`⏳ ${evalModel.name} (${evalModel.model}) is evaluating...`);
      
      try {
        const result = await this.neurolink.generate({
          input: { text: evaluationPrompt },
          provider: evalModel.provider,
          model: evalModel.model
        });
        
        const evaluation = {
          evaluatorName: evalModel.name,
          model: evalModel.model,
          provider: evalModel.provider,
          evaluation: result.text || result.content || result.response || '',
          timestamp: new Date().toISOString()
        };
        
        console.log(`✅ ${evalModel.name} completed evaluation`);
        return evaluation;
        
      } catch (error) {
        console.error(`❌ ${evalModel.name} failed:`, error.message);
        return {
          evaluatorName: evalModel.name,
          model: evalModel.model,
          provider: evalModel.provider,
          evaluation: `Error: ${error.message}`,
          error: true,
          timestamp: new Date().toISOString()
        };
      }
    });
    
    const evaluations = await Promise.all(evaluationPromises);
    
    console.log('\n✅ All evaluations completed!\n');
    
    evaluations.forEach((evaluation, index) => {
      console.log(`${'='.repeat(80)}`);
      console.log(`Evaluation ${index + 1}: ${evaluation.evaluatorName} (${evaluation.model})`);
      console.log(`${'='.repeat(80)}`);
      console.log(evaluation.evaluation);
      console.log('');
    });
    
    return evaluations;
  }

  /**
   * Step 6: Aggregate evaluations and generate final response
   */
  async aggregateAndFinalize(userQuery, initialResponse, evaluations, sources) {
    console.log('\n🎯 Step 6: Aggregating evaluations and generating final response...\n');
    
    const evaluationsSummary = evaluations
      .filter(e => !e.error)
      .map((e) => `### ${e.evaluatorName} Evaluation:\n${e.evaluation}`)
      .join('\n\n');
    
    const aggregationPrompt = `You are a meta-evaluator synthesizing expert evaluations to produce the best possible final response.

**Original User Query:**
"${userQuery}"

**Initial Response:**
"""
${initialResponse}
"""

**Sources Used:**
${sources.join(', ')}

**Expert Evaluations:**
${evaluationsSummary}

**Your Task:**
1. Analyze all expert evaluations
2. Identify common strengths and weaknesses
3. Decide: Accept/Enhance/Rewrite
4. Generate the FINAL RESPONSE incorporating all feedback

**Output Format:**
- **Decision**: [Accept/Enhance/Rewrite]
- **Reasoning**: Brief explanation
- **Final Response**: Best possible answer (original or improved)
- **Improvements Made**: List any improvements
- **Sources**: Cite sources used`;

    try {
      const result = await this.neurolink.generate({
        input: { text: aggregationPrompt },
        provider: this.aggregatorProvider,
        model: this.aggregatorModel
      });
      
      const finalResponse = result.text || result.content || result.response || '';
      
      console.log('✅ Final Response Generated:');
      console.log('='.repeat(80));
      console.log(finalResponse);
      console.log('='.repeat(80));
      
      return {
        finalResponse,
        metadata: {
          aggregatorModel: this.aggregatorModel,
          aggregatorProvider: this.aggregatorProvider,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('❌ Error in aggregation:', error.message);
      throw error;
    }
  }

  /**
   * Main processing pipeline
   */
  async process(userQuery) {
    console.log('\n' + '█'.repeat(80));
    console.log('🧠 RAG MULTI-MODEL EVALUATION AGENT');
    console.log('█'.repeat(80));
    
    const startTime = Date.now();
    
    try {
      // Step 1: Retrieve document context
      const retrieval = await this.retrieveDocumentContext(userQuery);
      
      // Step 2: Enhance query
      const queryEnhancement = await this.enhanceQuery(userQuery, retrieval.context);
      
      // Step 3: Web search
      const webResults = await this.performWebSearch(queryEnhancement.enhanced);
      
      // Step 4: Generate response
      const response = await this.generateResponse(
        userQuery,
        retrieval.context,
        webResults
      );
      
      // Step 5: Evaluate response
      const evaluations = await this.evaluateResponse(
        userQuery,
        response,
        retrieval.context,
        webResults
      );
      
      // Step 6: Aggregate and finalize
      const allSources = [...retrieval.sources, 'Web Search'];
      const finalResult = await this.aggregateAndFinalize(
        userQuery,
        response,
        evaluations,
        allSources
      );
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log('\n' + '█'.repeat(80));
      console.log('✅ PROCESS COMPLETE');
      console.log(`⏱️  Total Time: ${duration} seconds`);
      console.log('█'.repeat(80) + '\n');
      
      return {
        success: true,
        userQuery,
        documentContext: retrieval,
        queryEnhancement,
        webSearchResults: webResults,
        initialResponse: response,
        evaluations,
        finalResult,
        duration,
        metadata: {
          primaryModel: this.primaryModel,
          evaluationModels: this.evaluationModels.map(m => m.name),
          aggregatorModel: this.aggregatorModel,
          sources: allSources,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('\n❌ PROCESS FAILED:', error.message);
      return {
        success: false,
        error: error.message,
        userQuery
      };
    }
  }
}

module.exports = RAGMultiModelAgent;
