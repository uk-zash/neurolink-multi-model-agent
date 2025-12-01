import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { Document } from './types.js';

interface DocumentMetadata {
  filename: string;
  path: string;
  type: string;
  loadedAt: string;
  pages?: number;
  isJson?: boolean;
}

export class DocumentManager {
  private documentsPath: string;
  private documents: Document[];

  constructor(documentsPath: string) {
    this.documentsPath = documentsPath;
    this.documents = [];
  }

  /**
   * Load a single document
   */
  async loadDocument(filePath: string): Promise<Document | null> {
    const fullPath = path.join(this.documentsPath, filePath);
    const ext = path.extname(filePath).toLowerCase();

    try {
      const metadata: DocumentMetadata = {
        filename: path.basename(filePath),
        path: filePath,
        type: ext,
        loadedAt: new Date().toISOString()
      };

      let text = '';

      // Handle different file types
      if (ext === '.pdf') {
        const dataBuffer = await fs.readFile(fullPath);
        const pdfData = await pdfParse(dataBuffer);
        text = pdfData.text;
        metadata.pages = pdfData.numpages;
      } else if (ext === '.docx') {
        const dataBuffer = await fs.readFile(fullPath);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        text = result.value;
      } else if (ext === '.txt' || ext === '.md') {
        text = await fs.readFile(fullPath, 'utf-8');
      } else if (ext === '.json') {
        const jsonContent = await fs.readFile(fullPath, 'utf-8');
        text = JSON.stringify(JSON.parse(jsonContent), null, 2);
        metadata.isJson = true;
      } else {
        console.log(`⚠️  Unsupported file type: ${ext}`);
        return null;
      }

      // Create chunks
      const chunks = this.chunkDocument(text);

      return {
        name: metadata.filename,
        type: ext,
        text,
        chunks
      };
    } catch (error) {
      const err = error as Error;
      console.error(`❌ Error loading document ${filePath}:`, err.message);
      return null;
    }
  }

  /**
   * Load all documents from the documents directory
   */
  async loadAllDocuments(): Promise<Document[]> {
    try {
      const files = await fs.readdir(this.documentsPath);

      const documentFiles = files.filter(file =>
        ['.pdf', '.txt', '.md', '.docx', '.json'].includes(path.extname(file).toLowerCase())
      );

      console.log(`\n📚 Loading ${documentFiles.length} documents from ${this.documentsPath}...`);

      this.documents = [];

      for (const file of documentFiles) {
        try {
          const doc = await this.loadDocument(file);
          if (doc) {
            this.documents.push(doc);
          }
        } catch (error) {
          const err = error as Error;
          console.error(`⚠️  Skipping ${file}: ${err.message}`);
        }
      }

      console.log(`✅ Successfully loaded ${this.documents.length} documents\n`);
      return this.documents;
    } catch (error) {
      const err = error as Error;
      console.error('❌ Error loading documents:', err.message);
      return [];
    }
  }

  /**
   * Chunk a document into smaller pieces
   */
  chunkDocument(content: string, chunkSize = 500, overlap = 100): string[] {
    const words = content.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }

    return chunks;
  }

  /**
   * Get all loaded documents
   */
  getDocuments(): Document[] {
    return this.documents;
  }

  /**
   * Get all chunks with metadata
   */
  getAllChunks() {
    const allChunks: Array<{ text: string; source: string; chunkIndex: number }> = [];
    
    this.documents.forEach(doc => {
      doc.chunks?.forEach((chunk, index) => {
        allChunks.push({
          text: chunk,
          source: doc.name,
          chunkIndex: index
        });
      });
    });

    return allChunks;
  }

  /**
   * Clear all loaded documents
   */
  clear(): void {
    this.documents = [];
  }
}
