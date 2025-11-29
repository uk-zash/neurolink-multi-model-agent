# Multi-Model Evaluation Agent - Setup Guide

## ✅ What Has Been Built

A sophisticated AI agent using **NeuroLink** that implements a three-stage multi-model evaluation architecture:

1. **Stage 1**: Generate initial response with primary model
2. **Stage 2**: Multiple models evaluate the response in parallel
3. **Stage 3**: Aggregator model synthesizes evaluations and produces final response

## 📁 Project Structure

```
hackathon/
├── multi-model-agent.js    # Main agent implementation
├── example.js               # Usage examples
├── test-agent.js           # Simple test script
├── README.md               # Complete documentation
├── SETUP_GUIDE.md          # This file
├── .env                    # API configuration
├── package.json            # Dependencies
└── node_modules/           # Installed packages
```

## 🔑 Configuration

The agent uses the model specified in your `.env` file:

```env
GOOGLE_AI_API_KEY=AIzaSyBbDnmeRA7jUZxAKG0o2l8e0LIrn4ibA4w
GOOGLE_AI_MODEL=gemini-2.5-flash-lite
```

## 🚀 Quick Start

### Option 1: Simple Test

```bash
node test-agent.js
```

This runs a quick test with the question "What are the three primary colors?"

### Option 2: Full Example

```bash
node example.js
```

This demonstrates the complete multi-model evaluation flow with detailed output.

### Option 3: Custom Usage

Create your own script:

```javascript
const MultiModelEvaluationAgent = require('./multi-model-agent');

const agent = new MultiModelEvaluationAgent();
const result = await agent.process("Your question here");

console.log(result.finalResult.finalResponse);
```

## ⚙️ Customization

### Using Different Models

```javascript
const agent = new MultiModelEvaluationAgent({
  // Primary model for initial response
  primaryProvider: 'google-ai',
  primaryModel: 'gemini-2.5-flash-lite',
  
  // Multiple evaluator models
  evaluationModels: [
    { provider: 'google-ai', model: 'gemini-2.5-flash-lite', name: 'Eval-1' },
    { provider: 'google-ai', model: 'gemini-2.5-flash-lite', name: 'Eval-2' },
  ],
  
  // Aggregator model
  aggregatorProvider: 'google-ai',
  aggregatorModel: 'gemini-2.5-flash-lite'
});
```

### Adding More Evaluators

Simply add more models to the `evaluationModels` array:

```javascript
evaluationModels: [
  { provider: 'google-ai', model: 'gemini-2.5-flash-lite', name: 'Fast' },
  { provider: 'google-ai', model: 'gemini-2.5-flash-lite', name: 'Balanced' },
  { provider: 'google-ai', model: 'gemini-2.5-flash-lite', name: 'Thorough' },
  { provider: 'google-ai', model: 'gemini-2.5-flash-lite', name: 'Expert' }
]
```

## 🔧 Troubleshooting

### API Quota Exceeded

If you see quota errors:

1. **Wait**: Google AI free tier has rate limits
2. **Change Model**: Update `GOOGLE_AI_MODEL` in `.env` to a different model
3. **Add Provider**: Configure additional providers (OpenAI, Anthropic, etc.)

### Model Not Found

Verify your model name matches Google AI's available models:
- `gemini-2.5-flash-lite`
- `gemini-1.5-flash`
- `gemini-1.5-pro`

### Dependencies Missing

If you get import errors:

```bash
npm install
```

## 📊 Expected Output

When you run the agent, you'll see:

```
████████████████████████████████████████████████████████████████████████████████
🧠 MULTI-MODEL EVALUATION AGENT
████████████████████████████████████████████████████████████████████████████████

🤖 Step 1: Generating initial response...
Provider: google-ai, Model: gemini-2.5-flash-lite
Query: "Your question"

✅ Initial Response Generated:
--------------------------------------------------------------------------------
[Response content]
--------------------------------------------------------------------------------

🔍 Step 2: Evaluating response with multiple models...

⏳ Evaluator-1 (gemini-2.5-flash-lite) is evaluating...
⏳ Evaluator-2 (gemini-2.5-flash-lite) is evaluating...
⏳ Evaluator-3 (gemini-2.5-flash-lite) is evaluating...
✅ All evaluations completed!

🎯 Step 3: Aggregating evaluations and generating final response...

✅ Final Response Generated:
================================================================================
[Final optimized response]
================================================================================

████████████████████████████████████████████████████████████████████████████████
✅ PROCESS COMPLETE
⏱️  Total Time: X.XX seconds
████████████████████████████████████████████████████████████████████████████████
```

## 🎯 Use Cases

1. **Quality Assurance**: Ensure AI responses meet quality standards
2. **Multi-Perspective Analysis**: Get diverse viewpoints on questions
3. **Fact-Checking**: Cross-validate information
4. **Content Creation**: Generate well-vetted content
5. **Research**: Synthesize information from multiple evaluations

## 📚 Additional Resources

- **README.md**: Complete documentation with examples
- **NeuroLink Docs**: https://github.com/juspay/neurolink
- **Google AI Studio**: https://aistudio.google.com/

## 💡 Tips

1. **Start Simple**: Use the test script first to verify everything works
2. **Monitor Usage**: Keep an eye on API quotas
3. **Experiment**: Try different combinations of models
4. **Scale Up**: Add more evaluators for better quality
5. **Mix Providers**: Use different AI providers for diverse perspectives

## ⚠️ Important Notes

- The agent automatically uses the model from your `.env` file
- Evaluations run in parallel for speed
- Error handling ensures graceful degradation if evaluators fail
- All responses include detailed metadata for tracking

## 🆘 Support

If you encounter issues:

1. Check `.env` file has valid API key
2. Verify model names are correct
3. Ensure dependencies are installed
4. Review quota limits in Google AI console

---

**Ready to use!** Run `node test-agent.js` to get started.
