import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebSearchResult } from './types.js';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  answer?: string;
}

export class WebSearch {
  private tavilyApiKey: string | undefined;
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor() {
    this.tavilyApiKey = process.env.TAVILY_API_KEY;
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || '');
    this.model = process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash-lite';
  }

  /**
   * Enhance query using LLM before searching
   */
  async enhanceQuery(originalQuery: string, documentContext: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      const prompt = `Given the user's query and document context, enhance the query to make it more effective for web search.

User Query: ${originalQuery}

Document Context (first 500 chars):
${documentContext.substring(0, 500)}

Provide an enhanced search query that will find relevant information on the web. Return ONLY the enhanced query, nothing else.`;

      const result = await model.generateContent(prompt);
      const enhancedQuery = result.response.text().trim();
      
      console.log(`🔍 Original query: "${originalQuery}"`);
      console.log(`✨ Enhanced query: "${enhancedQuery}"`);
      
      return enhancedQuery;
    } catch (error) {
      const err = error as Error;
      console.error('❌ Query enhancement failed:', err.message);
      return originalQuery;
    }
  }

  /**
   * Search the web using Tavily API
   */
  async search(query: string, maxResults = 5): Promise<WebSearchResult> {
    if (!this.tavilyApiKey) {
      console.log('⚠️  Tavily API key not found, skipping web search');
      return {
        aiSummary: 'Web search is not configured. Please add TAVILY_API_KEY to your environment variables.',
        results: []
      };
    }

    try {
      console.log(`🌐 Searching web for: "${query}"`);
      
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: this.tavilyApiKey,
          query: query,
          search_depth: 'advanced',
          max_results: maxResults,
          include_answer: true,
          include_raw_content: false
        })
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data = await response.json() as TavilyResponse;
      
      console.log(`✅ Found ${data.results?.length || 0} web results`);

      return {
        aiSummary: data.answer || 'No AI summary available',
        results: (data.results || []).map(r => ({
          title: r.title,
          url: r.url,
          content: r.content
        }))
      };
    } catch (error) {
      const err = error as Error;
      console.error('❌ Web search failed:', err.message);
      return {
        aiSummary: `Web search failed: ${err.message}`,
        results: []
      };
    }
  }

  /**
   * Perform enhanced search (with query enhancement)
   */
  async enhancedSearch(
    originalQuery: string,
    documentContext: string,
    maxResults = 5
  ): Promise<WebSearchResult> {
    const enhancedQuery = await this.enhanceQuery(originalQuery, documentContext);
    return this.search(enhancedQuery, maxResults);
  }

  /**
   * Format web search results as text
   */
  formatResults(searchResult: WebSearchResult): string {
    let formatted = `AI Summary: ${searchResult.aiSummary}\n\n`;
    
    if (searchResult.results.length > 0) {
      formatted += 'Web Results:\n';
      searchResult.results.forEach((result, index) => {
        formatted += `\n${index + 1}. ${result.title}\n`;
        formatted += `   URL: ${result.url}\n`;
        formatted += `   ${result.content}\n`;
      });
    }
    
    return formatted;
  }

  /**
   * Check if web search is available
   */
  isAvailable(): boolean {
    return !!this.tavilyApiKey;
  }
}
