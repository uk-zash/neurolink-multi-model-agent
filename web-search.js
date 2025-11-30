const { NeuroLink } = require('@juspay/neurolink');
const fetch = require('node-fetch');

/**
 * Web Search Service
 * Uses Tavily API for web searches (optimized for AI/RAG applications)
 */
class WebSearchService {
  constructor(config = {}) {
    this.provider = config.provider || 'google-ai';
    this.model = config.model || process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash-lite';
    this.tavilyApiKey = process.env.TAVILY_API_KEY;
    this.neurolink = new NeuroLink({
      enableAnalytics: false,
      enableEvaluation: false
    });
  }

  /**
   * Perform web search using Tavily API
   */
  async search(query, maxResults = 3) {
    console.log(`\n🌐 Performing web search for: "${query}"`);
    
    if (!this.tavilyApiKey) {
      console.log('⚠️  TAVILY_API_KEY not found. Using AI knowledge fallback...');
      return await this.fallbackSearch(query, maxResults);
    }
    
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: this.tavilyApiKey,
          query: query,
          max_results: maxResults,
          search_depth: 'basic',
          include_answer: true,
          include_raw_content: false
        })
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Format results
      let formattedResults = '';
      
      if (data.answer) {
        formattedResults += `**AI Summary:**\n${data.answer}\n\n`;
      }
      
      if (data.results && data.results.length > 0) {
        formattedResults += '**Search Results:**\n\n';
        data.results.forEach((result, index) => {
          formattedResults += `${index + 1}. **${result.title}**\n`;
          formattedResults += `   URL: ${result.url}\n`;
          formattedResults += `   ${result.content}\n\n`;
        });
      }
      
      console.log('✅ Web search completed\n');
      console.log('-'.repeat(80));
      console.log(formattedResults);
      console.log('-'.repeat(80) + '\n');

      return {
        query,
        results: formattedResults,
        rawData: data,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Tavily search failed:', error.message);
      return await this.fallbackSearch(query, maxResults);
    }
  }

  /**
   * Fallback: Use AI knowledge when Tavily is unavailable
   */
  async fallbackSearch(query, maxResults) {
    try {
      const fallbackPrompt = `Based on your knowledge, provide information about: ${query}
      
Provide ${maxResults} key points or aspects. Be factual and comprehensive.

Note: This is based on training data, not live web search.`;

      const result = await this.neurolink.generate({
        input: { text: fallbackPrompt },
        provider: this.provider,
        model: this.model
      });

      const fallbackResults = result.text || result.content || result.response || '';
      
      console.log('⚠️  Using AI knowledge (not live web search)\n');
      console.log('-'.repeat(80));
      console.log(fallbackResults);
      console.log('-'.repeat(80) + '\n');

      return {
        query,
        results: `[Based on AI Training Data - Not Live Web Search]\n\n${fallbackResults}`,
        fallback: true,
        timestamp: new Date().toISOString()
      };
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
      return {
        query,
        results: 'Web search unavailable.',
        error: true,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Enhance query based on document context
   * Creates optimized search query for web search
   */
  async enhanceQuery(originalQuery, documentContext) {
    console.log('\n🔧 Enhancing query with document context...');
    
    try {
      const enhancementPrompt = `You are an expert at creating effective web search queries. Analyze the user's query and the document context to create an optimized search query.

**User's Original Query:** "${originalQuery}"

**Document Context Summary:**
${documentContext.substring(0, 800)}...

**Your Task:**
Create a focused, keyword-rich search query that will find relevant, up-to-date information from the web to SUPPLEMENT what's already in the documents.

**Guidelines for the Search Query:**
1. Identify gaps or areas where web search can add value (recent news, updates, broader context)
2. Use specific, searchable keywords and phrases
3. Avoid overly broad or vague terms
4. Include relevant technical terms or names from the context
5. Make it concise but comprehensive (ideally 5-10 keywords)
6. Focus on information that would complement the documents

**Important:** Only search for information that is NOT fully covered in the documents or needs recent updates.

**Output ONLY the enhanced search query, nothing else. No explanations, no labels, just the query.**`;

      const result = await this.neurolink.generate({
        input: { text: enhancementPrompt },
        provider: this.provider,
        model: this.model
      });

      const enhancedQuery = (result.text || result.content || result.response || '').trim();
      
      // Clean up the query - remove any labels or formatting
      const cleanedQuery = enhancedQuery
        .replace(/^(ENHANCED_QUERY|Query|Search Query):\s*/i, '')
        .replace(/^["']|["']$/g, '')
        .trim();
      
      console.log(`✅ Enhanced Query: "${cleanedQuery}"\n`);
      
      return {
        original: originalQuery,
        enhanced: cleanedQuery || originalQuery
      };
      
    } catch (error) {
      console.error('❌ Query enhancement failed:', error.message);
      return {
        original: originalQuery,
        enhanced: originalQuery,
        error: true
      };
    }
  }
}

module.exports = WebSearchService;
