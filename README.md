# Multi-Model Evaluation Agent

A sophisticated AI agent built with [NeuroLink](https://www.npmjs.com/package/@juspay/neurolink) that implements a multi-stage evaluation architecture for high-quality AI responses.

## 🏗️ Architecture

The agent follows a three-stage pipeline:

```
User Query
    ↓
┌─────────────────────────────────────┐
│  Stage 1: Primary Response          │
│  Generate initial response           │
│  (Primary Model)                     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Stage 2: Multi-Model Evaluation    │
│  Multiple models evaluate response   │
│  (Evaluator Models 1, 2, 3, ...)    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Stage 3: Aggregation & Synthesis   │
│  Final model aggregates evaluations │
│  and produces optimal response       │
│  (Aggregator Model)                  │
└─────────────────────────────────────┘
    ↓
Final Response
```

## 🚀 Features

- **Multi-Model Evaluation**: Leverage multiple AI models to evaluate response quality
- **Parallel Processing**: Evaluations run concurrently for speed
- **Configurable Models**: Use any combination of supported providers (Google AI, OpenAI, Anthropic, etc.)
- **Structured Evaluation**: Standardized scoring across accuracy, relevance, completeness, and clarity
- **Intelligent Aggregation**: Final model synthesizes all evaluations for optimal response
- **Error Handling**: Graceful degradation if individual evaluators fail

## 📋 Prerequisites

- Node.js 14.x or higher
- API key for at least one AI provider (Google AI, OpenAI, Anthropic, etc.)

## 🔧 Installation

1. **Clone or download the project**

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:

Create a `.env` file in the root directory:

```env
# Google AI (Free tier available)
GOOGLE_AI_API_KEY=your_api_key_here

# Optional: Add other providers
# OPENAI_API_KEY=your_openai_key
# ANTHROPIC_API_KEY=your_anthropic_key
```

Get your API keys:
- **Google AI**: https://aistudio.google.com/app/apikey (Free tier)
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/

## 📖 Usage

### Basic Usage

```javascript
const MultiModelEvaluationAgent = require('./multi-model-agent');

// Create agent with default configuration
const agent = new MultiModelEvaluationAgent();

// Process a user query
const result = await agent.process("Explain quantum computing in simple terms");

if (result.success) {
  console.log('Final Response:', result.finalResult.finalResponse);
}
```

### Custom Configuration

```javascript
const agent = new MultiModelEvaluationAgent({
  // Primary model for initial response
  primaryProvider: 'google-ai',
  primaryModel: 'gemini-2.0-flash-exp',
  
  // Multiple evaluator models
  evaluationModels: [
    { provider: 'google-ai', model: 'gemini-2.0-flash-exp', name: 'Speed-Evaluator' },
    { provider: 'google-ai', model: 'gemini-1.5-flash', name: 'Quality-Evaluator' },
    { provider: 'google-ai', model: 'gemini-1.5-pro', name: 'Expert-Evaluator' }
  ],
  
  // Aggregator model for final synthesis
  aggregatorProvider: 'google-ai',
  aggregatorModel: 'gemini-1.5-pro'
});

const result = await agent.process("Your query here");
```

### Running Examples

```bash
# Run the basic example
node example.js

# Edit example.js to try different configurations
```

## 🎯 Configuration Options

### MultiModelEvaluationAgent Constructor

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `primaryProvider` | string | `'google-ai'` | Provider for initial response |
| `primaryModel` | string | `'gemini-2.0-flash-exp'` | Model for initial response |
| `evaluationModels` | array | 3 Gemini models | Array of evaluator configurations |
| `aggregatorProvider` | string | `'google-ai'` | Provider for final aggregation |
| `aggregatorModel` | string | `'gemini-1.5-pro'` | Model for final aggregation |

### Evaluator Model Configuration

Each evaluator in `evaluationModels` should be an object:

```javascript
{
  provider: 'google-ai',      // Provider name
  model: 'gemini-1.5-flash',  // Model name
  name: 'Evaluator-1'         // Display name
}
```

## 📊 Response Structure

The agent returns a comprehensive result object:

```javascript
{
  success: true,                    // Boolean indicating success
  userQuery: "...",                 // Original user query
  initialResponse: "...",           // First response from primary model
  evaluations: [...],               // Array of evaluation results
  finalResult: {
    finalResponse: "...",           // Final optimized response
    metadata: {...}                 // Metadata about aggregation
  },
  duration: "15.42",                // Total processing time (seconds)
  metadata: {
    primaryModel: "...",            // Model used for initial response
    evaluationModels: [...],        // Names of evaluator models
    aggregatorModel: "...",         // Model used for aggregation
    timestamp: "..."                // ISO timestamp
  }
}
```

## 🔍 Evaluation Criteria

Each evaluator assesses responses on:

1. **Accuracy Score (0-10)**: Factual correctness
2. **Relevance Score (0-10)**: Alignment with user query
3. **Completeness Score (0-10)**: Comprehensiveness
4. **Clarity Score (0-10)**: Clear communication
5. **Overall Score (0-10)**: Holistic assessment
6. **Key Strengths**: What works well
7. **Areas for Improvement**: What could be better
8. **Recommendation**: Accept/Enhance/Rewrite

## 🌐 Supported Providers

Thanks to NeuroLink, you can use any of these providers:

- **Google AI** (Free tier available) - `google-ai`
- **OpenAI** - `openai`
- **Anthropic** - `anthropic`
- **AWS Bedrock** - `bedrock`
- **Google Vertex AI** - `vertex`
- **Azure OpenAI** - `azure`
- **Mistral AI** - `mistral`
- **Ollama** (Local) - `ollama`
- **LiteLLM** (100+ models) - `litellm`
- And more...

See [NeuroLink Provider Documentation](https://github.com/juspay/neurolink/blob/HEAD/docs/getting-started/provider-setup.md) for setup details.

## 🎓 Use Cases

1. **Content Quality Assurance**: Ensure AI-generated content meets quality standards
2. **Multi-Perspective Analysis**: Get diverse viewpoints on complex questions
3. **Fact-Checking**: Cross-validate responses across multiple models
4. **Educational Content**: Generate well-vetted explanations
5. **Research Assistance**: Synthesize information from multiple sources
6. **Customer Support**: Provide high-quality, validated responses

## 🛠️ Advanced Features

### Adding More Evaluators

```javascript
const agent = new MultiModelEvaluationAgent({
  evaluationModels: [
    { provider: 'google-ai', model: 'gemini-2.0-flash-exp', name: 'Fast' },
    { provider: 'google-ai', model: 'gemini-1.5-flash', name: 'Balanced' },
    { provider: 'google-ai', model: 'gemini-1.5-pro', name: 'Thorough' },
    { provider: 'google-ai', model: 'gemini-1.5-pro', name: 'Expert' }
    // Add as many as needed
  ]
});
```

### Using Different Providers

```javascript
// Mix different AI providers for diverse perspectives
const agent = new MultiModelEvaluationAgent({
  primaryProvider: 'google-ai',
  primaryModel: 'gemini-2.0-flash-exp',
  
  evaluationModels: [
    { provider: 'google-ai', model: 'gemini-1.5-pro', name: 'Google-Eval' },
    // Add OpenAI if you have the key
    // { provider: 'openai', model: 'gpt-4', name: 'OpenAI-Eval' },
    // Add Anthropic if you have the key  
    // { provider: 'anthropic', model: 'claude-3-sonnet', name: 'Anthropic-Eval' }
  ],
  
  aggregatorProvider: 'google-ai',
  aggregatorModel: 'gemini-1.5-pro'
});
```

## 📝 Example Output

When you run the agent, you'll see:

```
████████████████████████████████████████████████████████████████████████████████
🧠 MULTI-MODEL EVALUATION AGENT
████████████████████████████████████████████████████████████████████████████████

🤖 Step 1: Generating initial response...
Provider: google-ai, Model: gemini-2.0-flash-exp
Query: "Explain the benefits of renewable energy in 3 points"

✅ Initial Response Generated:
--------------------------------------------------------------------------------
[Initial response content]
--------------------------------------------------------------------------------

🔍 Step 2: Evaluating response with multiple models...

⏳ Evaluator-1 (gemini-2.0-flash-exp) is evaluating...
⏳ Evaluator-2 (gemini-1.5-flash) is evaluating...
⏳ Evaluator-3 (gemini-1.5-pro) is evaluating...
✅ Evaluator-1 completed evaluation
✅ Evaluator-2 completed evaluation
✅ Evaluator-3 completed evaluation

✅ All evaluations completed!

[Detailed evaluation results...]

🎯 Step 3: Aggregating evaluations and generating final response...

✅ Final Response Generated:
================================================================================
[Final optimized response]
================================================================================

████████████████████████████████████████████████████████████████████████████████
✅ PROCESS COMPLETE
⏱️  Total Time: 15.42 seconds
████████████████████████████████████████████████████████████████████████████████
```

## 🐛 Troubleshooting

### API Key Issues

```
Error: Missing API key for provider
```
**Solution**: Ensure your `.env` file has the correct API key for your provider.

### Model Not Available

```
Error: Model not found
```
**Solution**: Check the [NeuroLink models list](https://github.com/juspay/neurolink#-smart-model-selection) for available models.

### Rate Limiting

If you hit rate limits, reduce the number of evaluators or add delays between requests.

## 📚 Additional Resources

- [NeuroLink Documentation](https://github.com/juspay/neurolink)
- [NeuroLink Provider Setup](https://github.com/juspay/neurolink/blob/HEAD/docs/getting-started/provider-setup.md)
- [Google AI Studio](https://aistudio.google.com/)

## 📄 License

MIT

## 🤝 Contributing

Feel free to enhance this agent! Some ideas:
- Add streaming support for real-time evaluation
- Implement weighted scoring across evaluators
- Add support for custom evaluation criteria
- Create a web interface
- Add conversation memory for multi-turn interactions

## ⭐ Acknowledgments

Built with [NeuroLink](https://github.com/juspay/neurolink) by Juspay - the universal AI integration platform.
