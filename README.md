# 🧠 RAG Multi-Model Agent (TypeScript)

A production-ready **Retrieval-Augmented Generation (RAG)** system with multi-model evaluation, built entirely in **TypeScript**. Features document upload, web search integration, and intelligent response generation.

![RAG System](https://img.shields.io/badge/RAG-Enabled-brightgreen)
![Multi--Model](https://img.shields.io/badge/Multi--Model-Evaluation-blue)
![Web-Search](https://img.shields.io/badge/Tavily-Web%20Search-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)

## 🌟 Features

### Core Capabilities

- **📚 Document RAG System**
  - Upload and index documents (PDF, TXT, MD, DOCX, JSON)
  - Automatic text chunking and embedding generation
  - Vector similarity search for relevant context retrieval
  - Support for multiple document formats

- **🔐 User Isolation**
  - Each user has their own document folder
  - No mixing of documents between users
  - Session-based user identification
  - Persistent sessions via localStorage

- **🌐 Web Search Integration (Tavily)**
  - AI-optimized web search
  - Smart query enhancement based on document context
  - Supplements document information with web data

- **🎯 Document Prioritization**
  - Uploaded documents are the PRIMARY source
  - Web search only supplements missing information
  - Clear source attribution in responses

- **🧠 Multi-Model Evaluation**
  - 3 models evaluate each response
  - Quality scoring (accuracy, relevance, completeness)
  - Aggregated final response with improvements

- **💻 Beautiful Web Interface**
  - Drag-and-drop file upload
  - Real-time document management
  - Interactive query interface
  - Response visualization

- **💪 TypeScript**
  - Full type safety and modern ES modules
  - Proper error handling
  - Type-safe API endpoints

## 🏗️ System Architecture

```
User Query
    ↓
┌─────────────────────────────────────────────┐
│  1. RAG Document Retrieval                  │
│     - Search user's documents               │
│     - Retrieve top-3 relevant chunks        │
│     - 768-dim embeddings (Google AI)        │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│  2. Smart Query Enhancement                 │
│     - Analyze document context              │
│     - Create focused web search query       │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│  3. Web Search (Tavily)                     │
│     - Fetch relevant web information        │
│     - AI-generated summaries                │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│  4. Response Generation                     │
│     - Combine documents + web data          │
│     - Generate comprehensive answer         │
│     - Clear source attribution              │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│  5. Multi-Model Evaluation (3 models)       │
│     - Accuracy scoring                      │
│     - Relevance assessment                  │
│     - Completeness check                    │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│  6. Final Response Generation               │
│     - Aggregate evaluations                 │
│     - Apply improvements                    │
│     - Deliver optimized answer              │
└─────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- API keys for:
  - Google AI (Gemini)
  - Tavily (web search)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/uk-zash/neurolink-multi-model-agent.git
   cd neurolink-multi-model-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   # Required: Google AI API Key
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here

   # Model Configuration (Optional - these are defaults)
   GOOGLE_AI_MODEL=gemini-2.5-flash-lite
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

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3002
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

### Upload Documents

1. Click the upload area or drag-and-drop files
2. Supported formats: PDF, TXT, MD, DOCX, JSON
3. Maximum file size: 10MB
4. Documents are automatically indexed

### Ask Questions

1. Type your question in the search box
2. The system will:
   - Search your uploaded documents
   - Enhance the query with document context
   - Perform web search if needed
   - Generate a comprehensive answer
   - Evaluate the response with 3 models
   - Return the optimized final answer

### Example Queries

- "Summarize the key points from my documents"
- "What are the main findings in the research paper?"
- "Explain the technical architecture described in the documentation"
- "What skills are mentioned in the resume?"

## 📊 Performance Metrics

| Metric | Time |
|--------|------|
| Document Upload & Indexing | < 2 seconds |
| Embedding Generation | < 1 second |
| RAG Retrieval | < 1 second |
| Web Search (Tavily) | 2-3 seconds |
| Response Generation | 3-5 seconds |
| Multi-Model Evaluation (3 models) | 10-15 seconds |
| **Total Average Query Time** | **15-30 seconds** |

## 📁 Project Structure

```
neurolink-multi-model-agent/
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
│   ├── user1/
│   ├── user2/
│   └── ...
├── public/                       # Frontend files
│   └── index.html               # Web interface
├── package.json                  # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment template
└── README.md                    # This file
```

## 🛠️ Core Components

### RAG Multi-Model Agent (`src/rag-multi-model-agent.ts`)
Main orchestrator that:
- Manages the RAG pipeline
- Coordinates document retrieval
- Handles web search integration
- Manages multi-model evaluation
- Generates final responses

### RAG Retriever (`src/rag-retriever.ts`)
Handles:
- Document loading and chunking
- Embedding generation
- Vector similarity search
- Context retrieval

### Web Search (`src/web-search.ts`)
Provides:
- Tavily API integration
- Query enhancement
- AI-generated summaries
- Source tracking

### Document Manager (`src/document-manager.ts`)
Supports:
- Multiple file formats (PDF, DOCX, TXT, MD, JSON)
- Text extraction
- Document preprocessing

### Embedding Service (`src/embedding-service.ts`)
Generates:
- High-quality embeddings using Google AI
- 768-dimensional vectors
- Batch processing support

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

## 🔧 Configuration

### Models

The system uses Google AI (Gemini) models via NeuroLink:
- **Main Model**: `gemini-2.5-flash-lite`
- **Evaluators**: 3x `gemini-2.5-flash-lite`
- **Embeddings**: `text-embedding-004`

You can change the model in `src/rag-multi-model-agent.ts`:
```typescript
const agent = new RAGMultiModelAgent({
  documentsPath: userDocPath,
  provider: 'google-ai',
  model: 'gemini-2.5-flash-lite', // Change this
  evaluatorCount: 3
});
```

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
- `GOOGLE_AI_API_KEY` (required)
- `TAVILY_API_KEY` (optional, for web search)
- `PORT` (optional, defaults to 3002)

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
  "build": "tsc",                          // Compile TypeScript
  "start": "node dist/web-server.js",      // Run compiled code
  "dev": "tsx src/web-server.ts",          // Development with tsx
  "dev:watch": "tsx watch src/web-server.ts", // Hot-reload dev
  "clean": "rm -rf dist"                   // Clean build artifacts
}
```

## 🔒 Privacy & Security

- **User Isolation**: Each user's documents are stored in separate folders
- **Session Management**: Secure user sessions with localStorage
- **No Data Sharing**: Documents never mixed between users
- **API Key Security**: Environment variables for sensitive data

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes (TypeScript)
4. Run `npm run build` to verify
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- **Google Gemini AI** for language models
- **NeuroLink** for multi-model orchestration
- **Tavily** for web search API
- **TypeScript** community for excellent tooling

---

**Built with ❤️ using TypeScript, Google Gemini, and NeuroLink**
