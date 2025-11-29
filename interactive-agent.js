const MultiModelEvaluationAgent = require('./multi-model-agent');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║        INTERACTIVE MULTI-MODEL EVALUATION AGENT                               ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

console.log('Type your query and press Enter. Type "exit" to quit.\n');

const agent = new MultiModelEvaluationAgent();

function askQuestion() {
  rl.question('Your Query: ', async (query) => {
    if (query.toLowerCase() === 'exit') {
      console.log('\nGoodbye! 👋\n');
      rl.close();
      process.exit(0);
    }

    if (!query.trim()) {
      console.log('Please enter a valid query.\n');
      askQuestion();
      return;
    }

    try {
      const result = await agent.process(query);
      
      if (result.success) {
        console.log('\n' + '='.repeat(80));
        console.log('📝 FINAL ANSWER:');
        console.log('='.repeat(80));
        console.log(result.finalResult.finalResponse);
        console.log('='.repeat(80));
        console.log(`⏱️  Processing Time: ${result.duration} seconds\n`);
      } else {
        console.log('\n❌ Error:', result.error, '\n');
      }
    } catch (error) {
      console.log('\n❌ Error:', error.message, '\n');
    }

    // Ask for next query
    console.log('\n' + '-'.repeat(80));
    askQuestion();
  });
}

// Start the interactive session
askQuestion();
