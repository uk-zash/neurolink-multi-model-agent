# 🧠 RAG Multi-Model Agent

A production-ready **Retrieval-Augmented Generation (RAG)** system with multi-model evaluation, featuring document upload, web search integration, and intelligent response generation.

![RAG System](https://img.shields.io/badge/RAG-Enabled-brightgreen)
![Multi--Model](https://img.shields.io/badge/Multi--Model-Evaluation-blue)
![Web-Search](https://img.shields.io/badge/Tavily-Web%20Search-orange)

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
- API keys for:
  - Google AI (Gemini)
  - Tavily (web search)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rag-multi-model-agent.git
   cd rag-multi-model-agent
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
   ```
   GOOGLE_AI_API_KEY=your_google_ai_key_here
   TAVILY_API_KEY=your_tavily_key_here
   ```

4. **Start the server**
   ```bash
   node web-server.js
   ```

5. **Open your browser**
   ```
   http://localhost:3002
   ```

## 📖 Usage

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

## 🔧 Configuration

### Models

The system uses Google AI (Gemini) models by default:
- **Main Model**: `gemini-2.5-flash-lite`
- **Evaluators**: 3x `gemini-2.5-flash-lite`

You can change the model in `web-server.js`:
```javascript
const agent = new RAGMultiModelAgent({
  documentsPath: userDocPath,
  provider: 'google-ai',
  model: 'gemini-2.5-flash-lite', // Change this
  evaluatorCount: 3
});
```

### Embedding Service

Embeddings are generated using Google AI's embedding model:
- Model: `text-embedding-004`
- Dimensions: 768
- Used for semantic search

## 📁 Project Structure

```
rag-multi-model-agent/
├── public/
│   └── index.html              # Web interface
├── documents/                  # User documents (gitignored)
│   ├── user1/
│   ├── user2/
│   └── ...
├── web-server.js              # Express server
├── rag-multi-model-agent.js   # Main RAG agent
├── rag-retriever.js           # Document retrieval
├── embedding-service.js       # Embedding generation
├── web-search.js              # Tavily web search
├── document-manager.js        # Document processing
├── package.json               # Dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

## 🛠️ Core Components

### RAG Multi-Model Agent (`rag-multi-model-agent.js`)
Main orchestrator that:
- Manages the RAG pipeline
- Coordinates document retrieval
- Handles web search integration
- Manages multi-model evaluation
- Generates final responses

### RAG Retriever (`rag-retriever.js`)
Handles:
- Document loading and chunking
- Embedding generation
- Vector similarity search
- Context retrieval

### Web Search (`web-search.js`)
Provides:
- Tavily API integration
- Query enhancement
- AI-generated summaries
- Source tracking

### Document Manager (`document-manager.js`)
Supports:
- Multiple file formats (PDF, DOCX, TXT, MD, JSON)
- Text extraction
- Document preprocessing

### Embedding Service (`embedding-service.js`)
Generates:
- High-quality embeddings using Google AI
- 768-dimensional vectors
- Batch processing support

## 🔒 Privacy & Security

- **User Isolation**: Each user's documents are stored in separate folders
- **Session Management**: Secure user sessions with localStorage
- **No Data Sharing**: Documents never mixed between users
- **API Key Security**: Environment variables for sensitive data

## 📊 Performance

- **Average Query Time**: 15-30 seconds
- **Document Indexing**: Real-time
- **Embedding Generation**: < 1 second per document
- **Web Search**: 2-3 seconds
- **Multi-Model Evaluation**: 10-15 seconds

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- **Google AI** for Gemini models and embeddings
- **Tavily** for web search API
- **OpenAI** for RAG inspiration

## 📧 Support

For issues or questions, please open an issue on GitHub.
