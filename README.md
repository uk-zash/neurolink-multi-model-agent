# RAG Multi-Model Agent (TypeScript)

A production-ready **Retrieval-Augmented Generation (RAG)** system with multi-model evaluation, built entirely in **TypeScript**. Upload documents, ask questions, and get AI-powered answers with web search integration and multi-model quality assessment.

## 🚀 Features

- **📚 Document RAG**: Upload and query PDF, DOCX, TXT, MD, and JSON files
- **🔍 Semantic Search**: Vector-based document retrieval using embeddings
- **🌐 Web Search Integration**: Enhanced answers with Tavily web search
- **🤖 Multi-Model Evaluation**: 3 AI models evaluate responses for quality
- **✨ Query Enhancement**: Automatic query optimization based on context
- **💪 TypeScript**: Full type safety and modern ES modules
- **🎯 Production Ready**: Built with Express.js, proper error handling

## 📋 Architecture

```
User Query
    ↓
1. Retrieve relevant document chunks (RAG)
    ↓
2. Enhance query with document context
    ↓
3. Search web with enhanced query
    ↓
4. Generate response (Query + Documents + Web)
    ↓
5. Evaluate with 3 models
    ↓
6. Aggregate & produce final answer
```

## 🛠️ Tech Stack

- **Language**: TypeScript 5.3+
- **Runtime**: Node.js 18+
- **AI Models**: Google Gemini (via NeuroLink)
- **Embeddings**: Google text-embedding-004
- **Web Search**: Tavily API
- **Framework**: Express.js
- **Build**: TypeScript Compiler (tsc)
- **Dev**: tsx for hot-reloading

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Google AI API key
- (Optional) Tavily API key for web search

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd hackathon
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
# Required: Google AI API Key
GOOGLE_API_KEY=your_google_api_key_here

# Model Configuration
GOOGLE_AI_MODEL=gemini-2.0-flash-exp
GOOGLE_EMBEDDING_MODEL=text-embedding-004

# Optional: Web Search
TAVILY_API_KEY=your_tavily_api_key_here

# Server Configuration
PORT=3002
```

4. **Build the project**
```bash
npm run build
```

## 🎯 Usage

### Development Mode (with hot-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start at `http://localhost:3002`

## 📁 Project Structure

```
hackathon/
├── src/                          # TypeScript source files
│   ├── web-server.ts            # Express server & API endpoints
│   ├── rag-multi-model-agent.ts # Main RAG agent orchestration
│   ├── document-manager.ts      # Document loading & chunking
│   ├── embedding-service.ts     # Vector embeddings
│   ├── rag-retriever.ts         # Semantic search & retrieval
│   ├── web-search.ts            # Tavily web search integration
│   ├── types.ts                 # TypeScript type definitions
│   └── neurolink.d.ts           # NeuroLink type declarations
├── dist/                         # Compiled JavaScript (generated)
├── documents/                    # User documents storage
├── public/                       # Frontend files
│   └── index.html               # Web interface
├── package.json                  # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 🔌 API Endpoints

### `POST /api/user/create`
Create a new user session
```bash
curl -X POST http://localhost:3002/api/user/create
```

### `GET /api/documents?userId=<userId>`
List uploaded documents for a user
```bash
curl http://localhost:3002/api/documents?userId=abc123
```

### `POST /api/upload`
Upload a document (multipart/form-data)
```bash
curl -X POST http://localhost:3002/api/upload \
  -F "document=@myfile.pdf" \
  -F "userId=abc123"
```

### `POST /api/query`
Query the RAG system
```bash
curl -X POST http://localhost:3002/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic?",
    "userId": "abc123"
  }'
```

### `DELETE /api/documents/:filename?userId=<userId>`
Delete a document
```bash
curl -X DELETE http://localhost:3002/api/documents/myfile.pdf?userId=abc123
```

### `GET /api/health`
Health check endpoint
```bash
curl http://localhost:3002/api/health
```

## 🧪 Testing

1. **Open the web interface**: Navigate to `http://localhost:3002`
2. **Upload documents**: Click "Choose File" and upload PDFs, DOCX, or TXT files
3. **Ask questions**: Type a query about your documents
4. **Get AI answers**: Receive comprehensive responses with source citations

## 📊 Example Workflow

1. Upload a research paper (PDF)
2. Ask: "What are the key findings?"
3. The system will:
   - Retrieve relevant sections from the paper
   - Enhance the query based on document context
   - Search the web for additional context
   - Generate a comprehensive answer
   - Evaluate the response with 3 models
   - Return the best final answer with sources

## 🔧 Configuration

### Models

Edit `src/rag-multi-model-agent.ts` to customize:
- Primary model for response generation
- Evaluation models (default: 3 evaluators)
- Aggregator model for final synthesis

### Chunking

Edit `src/document-manager.ts`:
```typescript
chunkDocument(content: string, chunkSize = 500, overlap = 100)
```

### Retrieval

Edit `src/rag-multi-model-agent.ts`:
```typescript
this.topK = 3; // Number of chunks to retrieve
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Run Production Server
```bash
NODE_ENV=production npm start
```

### Environment Variables for Production
Ensure these are set:
- `GOOGLE_API_KEY`
- `PORT` (optional, defaults to 3002)
- `TAVILY_API_KEY` (optional, for web search)

## 📝 TypeScript Migration

This project has been fully converted to TypeScript with:
- ✅ ES Modules (`"type": "module"`)
- ✅ Strict type checking
- ✅ Full type definitions
- ✅ Proper error handling
- ✅ Type-safe API endpoints

### Scripts

```json
{
  "build": "tsc",                    // Compile TypeScript
  "start": "node dist/web-server.js", // Run compiled code
  "dev": "tsx src/web-server.ts",    // Development with tsx
  "dev:watch": "tsx watch src/web-server.ts", // Hot-reload dev
  "clean": "rm -rf dist"             // Clean build artifacts
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes (TypeScript)
4. Run `npm run build` to verify
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini AI for language models
- NeuroLink for multi-model orchestration
- Tavily for web search API
- TypeScript community for excellent tooling

## 🐛 Troubleshooting

### Build Errors
```bash
npm run clean
npm run build
```

### Module Resolution Issues
Ensure `"type": "module"` is in package.json and all imports use `.js` extensions:
```typescript
import { RAGRetriever } from './rag-retriever.js';
```

### API Key Issues
Verify your `.env` file has valid keys:
```bash
cat .env | grep API_KEY
```

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review TypeScript compilation errors in `dist/`

---

**Built with ❤️ using TypeScript, Google Gemini, and NeuroLink**
