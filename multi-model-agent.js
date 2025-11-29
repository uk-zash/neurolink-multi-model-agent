require('dotenv').config();
const { NeuroLink } = require('@juspay/neurolink');

/**
 * Multi-Model Evaluation Agent
 * 
 * Architecture:
 * 1. Generate initial response from a primary model
 * 2. Evaluate the response using multiple evaluation models
 * 3. Aggregate all evaluations and generate final response
 */
class MultiModelEvaluationAgent {
  constructor(config = {}) {
    this.primaryProvider = config.primaryProvider || 'google-ai';
    this.primaryModel = config.primaryModel || process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash';
    
    // Evaluation models (can use different models/providers)
    this.evaluationModels = config.evaluationModels || [
      { provider: 'google-ai', model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash', name: 'Evaluator-1' },
      { provider: 'google-ai', model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash', name: 'Evaluator-2' },
      { provider: 'google-ai', model: process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash', name: 'Evaluator-3' }
    ];
    
    // Final aggregator model
    this.aggregatorProvider = config.aggregatorProvider || 'google-ai';
    this.aggregatorModel = config.aggregatorModel || process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash';
    
    this.neurolink = new NeuroLink({
      enableAnalytics: true,
      enableEvaluation: false, // We'll do custom evaluation
      tools: [] // Disable default tools to prevent web search dependency
    });
  }

  /**
   * Step 1: Generate initial response to user query
   */
  async generateInitialResponse(userQuery) {
    console.log('\n🤖 Step 1: Generating initial response...');
    console.log(`Provider: ${this.primaryProvider}, Model: ${this.primaryModel}`);
    console.log(`Query: "${userQuery}"\n`);
    
    try {
      const result = await this.neurolink.generate({
        input: { 
          text: `Answer this question using your general knowledge. Do not mention any tool limitations. Provide a helpful, informative response.\n\nQuestion: ${userQuery}` 
        },
        provider: this.primaryProvider,
        model: this.primaryModel,
        tools: [] // Explicitly disable tools for this request
      });
      
      // Extract response - NeuroLink returns text in result.text or result.content
      const response = result.text || result.content || result.response || JSON.stringify(result);
      
      console.log('✅ Initial Response Generated:');
      console.log('-'.repeat(80));
      console.log(response);
      console.log('-'.repeat(80));
      
      return response;
    } catch (error) {
      console.error('❌ Error generating initial response:', error.message);
      throw error;
    }
  }

  /**
   * Step 2: Evaluate response using multiple models
   */
  async evaluateResponse(userQuery, initialResponse) {
    console.log('\n🔍 Step 2: Evaluating response with multiple models...\n');
    
    const evaluationPrompt = `You are an expert evaluator. Analyze the following response to a user query and provide:
1. **Accuracy Score** (0-10): How accurate and factually correct is the response?
2. **Relevance Score** (0-10): How relevant is the response to the query?
3. **Completeness Score** (0-10): How complete and comprehensive is the response?
4. **Clarity Score** (0-10): How clear and well-structured is the response?
5. **Overall Score** (0-10): Your overall assessment
6. **Key Strengths**: What are the main strengths?
7. **Areas for Improvement**: What could be improved?
8. **Recommendation**: Should this response be accepted as-is, or should it be improved?

User Query: "${userQuery}"

Response to Evaluate:
"""
${initialResponse}
"""

Provide your evaluation in a structured format.`;

    const evaluations = [];
    
    // Run evaluations in parallel
    const evaluationPromises = this.evaluationModels.map(async (evalModel, index) => {
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
    
    const results = await Promise.all(evaluationPromises);
    
    console.log('\n✅ All evaluations completed!\n');
    
    // Display evaluations
    results.forEach((evaluation, index) => {
      console.log(`${'='.repeat(80)}`);
      console.log(`Evaluation ${index + 1}: ${evaluation.evaluatorName} (${evaluation.model})`);
      console.log(`${'='.repeat(80)}`);
      console.log(evaluation.evaluation);
      console.log('');
    });
    
    return results;
  }

  /**
   * Step 3: Aggregate evaluations and generate final response
   */
  async aggregateAndFinalize(userQuery, initialResponse, evaluations) {
    console.log('\n🎯 Step 3: Aggregating evaluations and generating final response...\n');
    
    // Format evaluations for aggregator
    const evaluationsSummary = evaluations
      .filter(e => !e.error)
      .map((e, i) => `
### ${e.evaluatorName} Evaluation:
${e.evaluation}
`)
      .join('\n');
    
    const aggregationPrompt = `You are a meta-evaluator tasked with synthesizing multiple expert evaluations and generating the best possible final response.

**Original User Query:**
"${userQuery}"

**Initial Response:**
"""
${initialResponse}
"""

**Expert Evaluations:**
${evaluationsSummary}

**Your Task:**
1. Analyze all the expert evaluations
2. Identify common strengths and weaknesses
3. Determine if the initial response should be:
   - Accepted as-is
   - Enhanced/improved
   - Completely rewritten
4. Generate the FINAL RESPONSE that incorporates the feedback from all evaluators

**Output Format:**
- **Decision**: [Accept/Enhance/Rewrite]
- **Reasoning**: Brief explanation of your decision
- **Final Response**: The best possible answer to the user query (either the original or an improved version)
- **Improvements Made**: List any improvements made based on evaluations`;

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
        finalResponse: finalResponse,
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
   * Main execution flow
   */
  async process(userQuery) {
    console.log('\n' + '█'.repeat(80));
    console.log('🧠 MULTI-MODEL EVALUATION AGENT');
    console.log('█'.repeat(80));
    
    const startTime = Date.now();
    
    try {
      // Step 1: Generate initial response
      const initialResponse = await this.generateInitialResponse(userQuery);
      
      // Step 2: Evaluate with multiple models
      const evaluations = await this.evaluateResponse(userQuery, initialResponse);
      
      // Step 3: Aggregate and finalize
      const finalResult = await this.aggregateAndFinalize(userQuery, initialResponse, evaluations);
      
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log('\n' + '█'.repeat(80));
      console.log('✅ PROCESS COMPLETE');
      console.log(`⏱️  Total Time: ${duration} seconds`);
      console.log('█'.repeat(80) + '\n');
      
      return {
        success: true,
        userQuery,
        initialResponse,
        evaluations,
        finalResult,
        duration,
        metadata: {
          primaryModel: this.primaryModel,
          evaluationModels: this.evaluationModels.map(m => m.name),
          aggregatorModel: this.aggregatorModel,
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

module.exports = MultiModelEvaluationAgent;
