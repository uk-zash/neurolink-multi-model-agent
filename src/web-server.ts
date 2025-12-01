import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import crypto from 'crypto';
import { RAGMultiModelAgent } from './rag-multi-model-agent.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Store user agents in memory
const userAgents = new Map<string, RAGMultiModelAgent>();

// Store userId temporarily for multer destination callback
let tempUserId = 'default';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const userId = tempUserId;
    const userDir = path.join('./documents', userId);
    
    if (!fsSync.existsSync(userDir)) {
      fsSync.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (_req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, cleanName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (_req, file, cb) => {
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
const extractUserId = (req: Request, _res: Response, next: NextFunction) => {
  tempUserId = (req.query.userId as string) || (req.body.userId as string) || 'default';
  next();
};

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize RAG agent for a specific user
async function getUserAgent(userId: string): Promise<RAGMultiModelAgent> {
  if (userAgents.has(userId)) {
    return userAgents.get(userId)!;
  }
  
  console.log(`🚀 Initializing RAG Agent for user: ${userId}`);
  
  const userDocPath = path.join('./documents', userId);
  await fs.mkdir(userDocPath, { recursive: true });
  
  const agent = new RAGMultiModelAgent({
    documentsPath: userDocPath,
    provider: 'google-ai',
    model: process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash-lite'
  });
  
  await agent.initialize();
  userAgents.set(userId, agent);
  
  console.log(`✅ RAG Agent initialized for user: ${userId}`);
  
  return agent;
}

// Generate user ID
function generateUserId(): string {
  return crypto.randomBytes(8).toString('hex');
}

// API Routes

// Create new user session
app.post('/api/user/create', (_req: Request, res: Response) => {
  const userId = generateUserId();
  res.json({ 
    success: true, 
    userId,
    message: 'User session created'
  });
});

// Get list of uploaded documents for a user
app.get('/api/documents', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'default';
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
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upload document
app.post('/api/upload', extractUserId, upload.single('document'), async (req: Request, res: Response) => {
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
    const err = error as Error;
    console.error('❌ Upload error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Delete document
app.delete('/api/documents/:filename', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'default';
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
    const err = error as Error;
    console.error('Delete error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Query endpoint
app.post('/api/query', async (req: Request, res: Response) => {
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
    const err = error as Error;
    console.error('Query error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
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
