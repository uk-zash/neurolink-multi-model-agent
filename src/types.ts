export interface Document {
  name: string;
  type: string;
  text: string;
  chunks?: string[];
  embeddings?: number[][];
}

export interface QueryResult {
  response: string;
  sources: string[];
  processingTime: number;
  finalResponse?: {
    decision: string;
    reasoning: string;
    finalResponse: string;
    improvementsMade: string;
    sources: string[];
  };
}

export interface EvaluationResult {
  accuracyScore: number;
  relevanceScore: number;
  completenessScore: number;
  sourceIntegration: number;
  clarityScore: number;
  overallScore: number;
  keyStrengths: string[];
  areasForImprovement: string[];
  recommendation: 'Accept' | 'Reject' | 'Enhance';
}

export interface WebSearchResult {
  aiSummary: string;
  results: Array<{
    title: string;
    url: string;
    content: string;
  }>;
}

export interface RAGConfig {
  documentsPath: string;
  provider?: string;
  model?: string;
  evaluatorCount?: number;
}

export interface ChunkWithScore {
  text: string;
  score: number;
  source: string;
}
