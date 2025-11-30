const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Document Manager
 * Handles loading and parsing various document formats
 */
class DocumentManager {
  constructor(documentsPath = './documents') {
    this.documentsPath = documentsPath;
    this.documents = [];
  }

  /**
   * Load a single document from file path
   */
  async loadDocument(filePath) {
    const fullPath = path.join(this.documentsPath, filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      let content = '';
      let metadata = {
        filename: path.basename(filePath),
        path: filePath,
        type: ext,
        loadedAt: new Date().toISOString()
      };

      switch (ext) {
        case '.txt':
        case '.md':
          content = await fs.readFile(fullPath, 'utf8');
          break;
        
        case '.pdf':
          const pdfBuffer = await fs.readFile(fullPath);
          const pdfData = await pdfParse(pdfBuffer);
          content = pdfData.text;
          metadata.pages = pdfData.numpages;
          break;
        
        case '.docx':
          const docxBuffer = await fs.readFile(fullPath);
          const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
          content = docxResult.value;
          break;
        
        case '.json':
          const jsonContent = await fs.readFile(fullPath, 'utf8');
          const jsonData = JSON.parse(jsonContent);
          content = JSON.stringify(jsonData, null, 2);
          metadata.isJson = true;
          break;
        
        default:
          throw new Error(`Unsupported file type: ${ext}`);
      }

      const document = {
        content: content.trim(),
        metadata,
        chunks: this.chunkDocument(content)
      };

      console.log(`✅ Loaded document: ${filePath} (${document.chunks.length} chunks)`);
      return document;
      
    } catch (error) {
      console.error(`❌ Error loading document ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Load all documents from the documents directory
   */
  async loadAllDocuments() {
    try {
      const files = await fs.readdir(this.documentsPath);
      const supportedExtensions = ['.txt', '.md', '.pdf', '.docx', '.json'];
      
      const documentFiles = files.filter(file => 
        supportedExtensions.includes(path.extname(file).toLowerCase())
      );

      console.log(`\n📚 Loading ${documentFiles.length} documents from ${this.documentsPath}...`);
      
      this.documents = [];
      for (const file of documentFiles) {
        try {
          const doc = await this.loadDocument(file);
          this.documents.push(doc);
        } catch (error) {
          console.error(`⚠️  Skipping ${file}: ${error.message}`);
        }
      }

      console.log(`✅ Successfully loaded ${this.documents.length} documents\n`);
      return this.documents;
      
    } catch (error) {
      console.error('❌ Error loading documents:', error.message);
      throw error;
    }
  }

  /**
   * Chunk a document into smaller pieces for better retrieval
   */
  chunkDocument(content, chunkSize = 500, overlap = 100) {
    const words = content.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim().length > 0) {
        chunks.push({
          text: chunk.trim(),
          startIndex: i,
          endIndex: Math.min(i + chunkSize, words.length)
        });
      }
    }
    
    return chunks;
  }

  /**
   * Get all loaded documents
   */
  getDocuments() {
    return this.documents;
  }

  /**
   * Get all chunks from all documents
   */
  getAllChunks() {
    const allChunks = [];
    this.documents.forEach(doc => {
      doc.chunks.forEach(chunk => {
        allChunks.push({
          ...chunk,
          source: doc.metadata.filename,
          documentMetadata: doc.metadata
        });
      });
    });
    return allChunks;
  }

  /**
   * Clear all loaded documents
   */
  clearDocuments() {
    this.documents = [];
  }
}

module.exports = DocumentManager;
