const MultiModelEvaluationAgent = require('./multi-model-agent');

async function testAgent() {
  console.log('Testing Multi-Model Evaluation Agent\n');
  console.log('Configuration:');
  
  const agent = new MultiModelEvaluationAgent();
  
  console.log('- Primary Model:', agent.primaryModel);
  console.log('- Evaluation Models:', agent.evaluationModels.map(m => m.model).join(', '));
  console.log('- Aggregator Model:', agent.aggregatorModel);
  console.log('\nRunning a simple test query...\n');
  
  const result = await agent.process("What are the three primary colors?");
  
  if (result.success) {
    console.log('\n✅ TEST SUCCESSFUL!');
  } else {
    console.log('\n❌ TEST FAILED:', result.error);
  }
}

testAgent().catch(console.error);
