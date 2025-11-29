const MultiModelEvaluationAgent = require('./multi-model-agent');

/**
 * Example Usage: Multi-Model Evaluation Agent
 * 
 * This demonstrates how to use the agent with different configurations
 */

async function runExample() {
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║        MULTI-MODEL EVALUATION AGENT - EXAMPLE USAGE                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

  // Example 1: Basic usage with default configuration
  console.log('\n📋 EXAMPLE 1: Basic Configuration\n');
  
  const agent = new MultiModelEvaluationAgent();
  
  const userQuery = "Explain the benefits of renewable energy in 3 points";
  
  const result = await agent.process(userQuery);
  
  if (result.success) {
    console.log('\n📊 SUMMARY:');
    console.log(`✓ User Query: ${result.userQuery}`);
    console.log(`✓ Primary Model: ${result.metadata.primaryModel}`);
    console.log(`✓ Evaluators: ${result.metadata.evaluationModels.join(', ')}`);
    console.log(`✓ Aggregator Model: ${result.metadata.aggregatorModel}`);
    console.log(`✓ Total Duration: ${result.duration}s`);
  }
}

async function runCustomExample() {
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║        EXAMPLE 2: Custom Configuration                                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

  // Example 2: Custom configuration with different models
  const customAgent = new MultiModelEvaluationAgent({
    primaryProvider: 'google-ai',
    primaryModel: 'gemini-1.5-flash',
    
    // Use different models for evaluation
    evaluationModels: [
      { provider: 'google-ai', model: 'gemini-2.0-flash-exp', name: 'Fast-Evaluator' },
      { provider: 'google-ai', model: 'gemini-1.5-pro', name: 'Pro-Evaluator' }
    ],
    
    // More powerful model for final aggregation
    aggregatorProvider: 'google-ai',
    aggregatorModel: 'gemini-1.5-pro'
  });
  
  const technicalQuery = "What are the key differences between REST and GraphQL APIs?";
  
  const result = await customAgent.process(technicalQuery);
  
  if (result.success) {
    console.log('\n📊 SUMMARY:');
    console.log(`✓ User Query: ${result.userQuery}`);
    console.log(`✓ Primary Model: ${result.metadata.primaryModel}`);
    console.log(`✓ Evaluators: ${result.metadata.evaluationModels.join(', ')}`);
    console.log(`✓ Aggregator Model: ${result.metadata.aggregatorModel}`);
    console.log(`✓ Total Duration: ${result.duration}s`);
  }
}

// Run examples
async function main() {
  try {
    // Run basic example
    await runExample();
    
    // Uncomment to run custom example
    // await runCustomExample();
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Execute
main();
