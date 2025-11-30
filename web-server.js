const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const RAGMultiModelAgent = require('./rag-multi-model-agent');

const app = express();
const PORT = process.env.PORT || 3002;

// Store user agents in memory
const userAgents = new Map();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = tempUserId;
    const userDir = path.join('./documents', userId);
    
    // Create directory synchronously to avoid race conditions
    const fsSync = require('fs');
    if (!fsSync.existsSync(userDir)) {
      fsSync.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename, clean it up
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, cleanName);
  }
});

// Store userId temporarily for multer destination callback
let tempUserId = 'default';

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.md', '.pdf', '.docx', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: TXT, MD, PDF, DOCX, JSON'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware to extract userId before multer processes the file
const extractUserId = (req, res, next) => {
  // Parse userId from query or default
  tempUserId = req.query.userId || req.body.userId || 'default';
  next();
};

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize RAG agent for a specific user
async function getUserAgent(userId) {
  if (userAgents.has(userId)) {
    return userAgents.get(userId);
  }
  
  console.log(`🚀 Initializing RAG Agent for user: ${userId}`);
  
  const userDocPath = path.join('./documents', userId);
  await fs.mkdir(userDocPath, { recursive: true });
  
  const agent = new RAGMultiModelAgent({
    documentsPath: userDocPath,
    provider: 'google-ai',
    model: process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash-lite',
    evaluatorCount: 3
  });
  
  await agent.initialize();
  userAgents.set(userId, agent);
  
  console.log(`✅ RAG Agent initialized for user: ${userId}`);
  
  return agent;
}

// Generate user ID (in production, use proper authentication)
function generateUserId() {
  return crypto.randomBytes(8).toString('hex');
}

// API Routes

// Create new user session
app.post('/api/user/create', (req, res) => {
  const userId = generateUserId();
  res.json({ 
    success: true, 
    userId,
    message: 'User session created'
  });
});

// Get list of uploaded documents for a user
app.get('/api/documents', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const userDir = path.join('./documents', userId);
    
    try {
      const files = await fs.readdir(userDir);
      const documents = files
        .filter(file => !file.startsWith('.'))
        .map(file => ({
          name: file,
          type: path.extname(file).substring(1).toUpperCase()
        }));
      
      res.json({ success: true, documents, userId });
    } catch (error) {
      res.json({ success: true, documents: [], userId });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload document
app.post('/api/upload', extractUserId, upload.single('document'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('Body userId:', req.body.userId);
    console.log('File:', req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const userId = req.body.userId || 'default';
    console.log(`📄 File saved to: ${req.file.path}`);
    console.log(`📄 Original name: ${req.file.originalname}`);
    console.log(`📄 User: ${userId}`);
    
    // Verify file exists
    const fsSync = require('fs');
    if (!fsSync.existsSync(req.file.path)) {
      throw new Error('File was not saved properly');
    }
    
    console.log('✅ File verified on disk');
    
    // Remove user's agent to force re-initialization
    userAgents.delete(userId);
    await getUserAgent(userId);
    
    res.json({ 
      success: true, 
      message: 'Document uploaded and indexed successfully',
      filename: req.file.originalname,
      filepath: req.file.path,
      userId
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete document
app.delete('/api/documents/:filename', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const filename = req.params.filename;
    const filepath = path.join('./documents', userId, filename);
    
    await fs.unlink(filepath);
    console.log(`🗑️  Deleted: ${filename} for user: ${userId}`);
    
    // Re-initialize user's agent
    userAgents.delete(userId);
    await getUserAgent(userId);
    
    res.json({ 
      success: true, 
      message: 'Document deleted successfully',
      userId
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Query endpoint
app.post('/api/query', async (req, res) => {
  try {
    const { query, userId } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Query is required' 
      });
    }

    const userIdToUse = userId || 'default';
    console.log(`\n🔍 Query from user ${userIdToUse}: ${query}`);
    
    // Get user-specific agent
    const agent = await getUserAgent(userIdToUse);
    
    // Process query
    const result = await agent.process(query);
    
    res.json({ 
      success: true, 
      result: {
        query: result.userQuery,
        finalResponse: result.finalResult?.finalResponse || result.initialResponse,
        sources: result.metadata?.sources || [],
        processingTime: result.duration
      },
      userId: userIdToUse
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    activeUsers: userAgents.size
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           RAG MULTI-MODEL AGENT - WEB INTERFACE               ║
╚═══════════════════════════════════════════════════════════════╝

🌐 Server running at: http://localhost:${PORT}
📚 Document upload enabled
🔍 RAG search enabled
✨ Ready to accept queries!

Open your browser and navigate to: http://localhost:${PORT}
`);
});
