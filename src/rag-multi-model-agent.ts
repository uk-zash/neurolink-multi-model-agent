import { NeuroLink } from '@juspay/neurolink';
import { DocumentManager } from './document-manager.js';
import { EmbeddingService } from './embedding-service.js';
import { RAGRetriever } from './rag-retriever.js';
import { WebSearch } from './web-search.js';
import { RAGConfig, WebSearchResult } from './types.js';

interface EvaluationModel {
  provider: string;
  model: string;
  name: string;
}

interface Evaluation {
  evaluatorName: string;
  model: string;
  provider: string;
  evaluation: string;
  timestamp: string;
  error?: boolean;
}

interface ProcessResult {
  success: boolean;
  userQuery: string;
  documentContext?: any;
  queryEnhancement?: any;
  webSearchResults?: WebSearchResult;
  initialResponse?: string;
  evaluations?: Evaluation[];
  finalResult?: any;
  duration?: string;
  metadata?: any;
  error?: string;
}

export class RAGMultiModelAgent {
  private primaryProvider: string;
  private primaryModel: string;
  private evaluationModels: EvaluationModel[];
  private aggregatorProvider: string;
  private aggregatorModel: string;
  private documentManager: DocumentManager;
  private embeddingService: EmbeddingService;
  private ragRetriever: RAGRetriever;
  private webSearch: WebSearch;
  private neurolink: NeuroLink;
  private topK: number;

  constructor(config: RAGConfig = { documentsPath: './documents' }) {
    const freeModel = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash-lite';
    
    this.primaryProvider = config.provider || 'google-ai';
    this.primaryModel = config.model || freeModel;
    
    this.evaluationModels = [
      { provider: 'google-ai', model: freeModel, name: 'Evaluator-1' },
      { provider: 'google-ai', model: freeModel, name: 'Evaluator-2' },
      { provider: 'google-ai', model: freeModel, name: 'Evaluator-3' }
    ];
    
    this.aggregatorProvider = 'google-ai';
    this.aggregatorModel = freeModel;
    
    this.documentManager = new DocumentManager(config.documentsPath);
    this.embeddingService = new EmbeddingService({
      provider: 'google-ai',
      model: process.env.GOOGLE_EMBEDDING_MODEL || 'text-embedding-004'
    });
    this.ragRetriever = new RAGRetriever(this.documentManager, this.embeddingService);
    this.webSearch = new WebSearch();
    
    this.neurolink = new NeuroLink({
      enableAnalytics: true,
      enableEvaluation: false
    });
    
    this.topK = 3;
  }

  async initialize(): Promise<void> {
    console.log('\n' + '█'.repeat(80));
    console.log('🚀 INITIALIZING RAG MULTI-MODEL AGENT');
    console.log('█'.repeat(80));
    
    await this.documentManager.loadAllDocuments();
    await this.ragRetriever.indexDocuments();
    
    console.log('✅ Agent ready to process queries\n');
  }

  async retrieveDocumentContext(userQuery: string) {
    console.log('\n📚 Step 1: Retrieving relevant information from documents...');
    
    const chunks = await this.ragRetriever.retrieve(userQuery, this.topK);
    
    if (chunks.length === 0) {
      console.log('⚠️  No relevant document chunks found.');
      return {
        context: '',
        chunks: [],
        sources: []
      };
    }
    
    const context = this.ragRetriever.formatContext(chunks);
    const sources = [...new Set(chunks.map(c => c.source))];
    
    console.log(`✅ Retrieved context from ${sources.length} source(s)`);
    console.log('-'.repeat(80));
    console.log(context.substring(0, 500) + '...');
    console.log('-'.repeat(80));
    
    return { context, chunks, sources };
  }

  async enhanceQuery(userQuery: string, documentContext: string) {
    console.log('\n🔧 Step 2: Enhancing query with document context...');
    
    if (!documentContext || documentContext.length === 0) {
      console.log('⚠️  No document context available. Using original query.');
      return { original: userQuery, enhanced: userQuery };
    }
    
    const enhanced = await this.webSearch.enhanceQuery(userQuery, documentContext);
    return { original: userQuery, enhanced };
  }

  async performWebSearch(enhancedQuery: string): Promise<WebSearchResult> {
    console.log('\n🌐 Step 3: Searching the web...');
    
    // Always perform web search for supplementary information
    return this.webSearch.search(enhancedQuery, 3);
  }

  async generateResponse(
    userQuery: string,
    documentContext: string,
    webSearchResults: WebSearchResult
  ): Promise<string> {
    console.log('\n🤖 Step 4: Generating comprehensive response...');
    console.log(`Provider: ${this.primaryProvider}, Model: ${this.primaryModel}\n`);
    
    const hasDocuments = documentContext && documentContext.length > 0;
    const hasWebResults = webSearchResults && webSearchResults.results && webSearchResults.results.length > 0;
    
    let prompt = '';
    
    if (hasDocuments) {
      // Document-focused response (preferred)
      const webResultsText = hasWebResults ? this.webSearch.formatResults(webSearchResults) : '';
      
      prompt = `You are a specialized AI assistant with access to both uploaded documents and web search results. PRIORITIZE the uploaded document content as your PRIMARY source.

**User Query:**
${userQuery}

**PRIMARY SOURCE - UPLOADED DOCUMENT CONTENT:**
${documentContext}

${hasWebResults ? `**SUPPLEMENTARY SOURCE - Web Search Results (for additional context):**
${webResultsText}` : ''}

**CRITICAL INSTRUCTIONS:**
1. **DOCUMENTS FIRST**: Base your answer PRIMARILY on the uploaded document content - this is your main source of truth
2. **Comprehensive Document Analysis**: Extract and present ALL relevant information from the documents in detail
3. **Web as Supplement**: Use web search results ONLY to:
   - Provide additional recent information not in documents
   - Add broader context that complements the document information
   - Fill small gaps if documents don't fully cover the query
4. **Clear Source Attribution**: 
   - Start with document-based information
   - Clearly label any web information as "Additional context from web search:"
5. **Direct Citations**: Reference specific details from the documents

**Response Structure:**
1. Begin with a comprehensive answer based on uploaded documents
2. Include all relevant details, facts, and information from the documents
3. If web results provide valuable supplementary information, add it at the end with clear labeling
4. Make it crystal clear which information comes from documents vs. web

**Your Response:**`;
    } else if (hasWebResults) {
      // Fallback to web search only
      const webResultsText = this.webSearch.formatResults(webSearchResults);
      
      prompt = `You are a helpful AI assistant. The user uploaded documents, but they don't contain relevant information for this query. Use web search results as a fallback.

**User Query:**
${userQuery}

**Note:** No relevant information found in uploaded documents.

**Web Search Results:**
${webResultsText}

**Instructions:**
- Clearly state that the information comes from web search, not uploaded documents
- Provide a helpful answer based on web results
- Suggest the user upload relevant documents if they have them

**Your Response:**`;
    } else {
      // No context available
      prompt = `You are a helpful AI assistant. 

**User Query:**
${userQuery}

**Note:** No documents have been uploaded and no web search results are available.

**Your Response:**
Please inform the user that no documents have been uploaded yet and suggest they upload relevant documents to get a comprehensive answer based on their data.`;
    }

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
      const err = error as Error;
      console.error('❌ Error generating response:', err.message);
      throw error;
    }
  }

  async evaluateResponse(
    userQuery: string,
    response: string,
    documentContext: string,
    webSearchResults: WebSearchResult
  ): Promise<Evaluation[]> {
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
        
        const evaluation: Evaluation = {
          evaluatorName: evalModel.name,
          model: evalModel.model,
          provider: evalModel.provider,
          evaluation: result.text || result.content || result.response || '',
          timestamp: new Date().toISOString()
        };
        
        console.log(`✅ ${evalModel.name} completed evaluation`);
        return evaluation;
      } catch (error) {
        const err = error as Error;
        console.error(`❌ ${evalModel.name} failed:`, err.message);
        return {
          evaluatorName: evalModel.name,
          model: evalModel.model,
          provider: evalModel.provider,
          evaluation: `Error: ${err.message}`,
          error: true,
          timestamp: new Date().toISOString()
        };
      }
    });
    
    const evaluations = await Promise.all(evaluationPromises);
    
    console.log('\n✅ All evaluations completed!\n');
    
    evaluations.forEach((evaluation, index) => {
      console.log('='.repeat(80));
      console.log(`Evaluation ${index + 1}: ${evaluation.evaluatorName} (${evaluation.model})`);
      console.log('='.repeat(80));
      console.log(evaluation.evaluation);
      console.log('');
    });
    
    return evaluations;
  }

  async aggregateAndFinalize(
    userQuery: string,
    initialResponse: string,
    evaluations: Evaluation[],
    sources: string[]
  ) {
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
      const err = error as Error;
      console.error('❌ Error in aggregation:', err.message);
      throw error;
    }
  }

  async process(userQuery: string): Promise<ProcessResult> {
    console.log('\n' + '█'.repeat(80));
    console.log('🧠 RAG MULTI-MODEL EVALUATION AGENT');
    console.log('█'.repeat(80));
    
    const startTime = Date.now();
    
    try {
      const retrieval = await this.retrieveDocumentContext(userQuery);
      const queryEnhancement = await this.enhanceQuery(userQuery, retrieval.context);
      const webResults = await this.performWebSearch(queryEnhancement.enhanced);
      const response = await this.generateResponse(userQuery, retrieval.context, webResults);
      const evaluations = await this.evaluateResponse(userQuery, response, retrieval.context, webResults);
      
      const allSources = [...retrieval.sources, 'Web Search'];
      const finalResult = await this.aggregateAndFinalize(userQuery, response, evaluations, allSources);
      
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
      const err = error as Error;
      console.error('\n❌ PROCESS FAILED:', err.message);
      return {
        success: false,
        error: err.message,
        userQuery
      };
    }
  }
}
