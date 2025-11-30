# Testing the RAG Agent - Step by Step

## 🧪 Quick Test (Console Queries)

### Step 1: Run the Interactive Agent

```bash
node interactive-rag-agent.js
```

### Step 2: Wait for Initialization

You'll see:
```
🚀 INITIALIZING RAG MULTI-MODEL AGENT
📚 Loading documents...
✅ Agent is ready! You can now ask questions.

📚 Sample documents loaded:
   - renewable_energy.txt (X chunks)
   - ai_technology.md (X chunks)
```

### Step 3: Ask Your First Question

Try these example queries:

**About Renewable Energy:**
```
What are the benefits of solar energy?
```

**About AI:**
```
How does machine learning work?
```

**Mixed (documents + web search):**
```
What are the latest developments in renewable energy storage?
```

### Step 4: View the Results

You'll see:
1. 📚 Document retrieval from your files
2. 🔧 Query enhancement  
3. 🌐 Web search results
4. 🤖 Response generation
5. 🔍 Multi-model evaluation
6. ✨ Final optimized answer with sources

### Available Commands:

- `docs` - Show all loaded documents
- `help` - Show help and example questions
- `exit` or `quit` - Exit the program

---

## 📁 Adding Your Own Documents

### Method 1: Simple Copy (Recommended for Testing)

1. **Copy your document to the documents folder:**
   ```bash
   cp /path/to/your/document.txt documents/
   # or
   cp /path/to/your/file.pdf documents/
   ```

2. **Restart the interactive agent:**
   ```bash
   node interactive-rag-agent.js
   ```

3. **Your document is now indexed and ready!**

### Method 2: Manual Upload

1. **Navigate to the `documents/` folder**
2. **Drag and drop or paste your files**
3. **Restart the agent**

### Supported File Types:

✅ `.txt` - Plain text files
✅ `.md` - Markdown files  
✅ `.pdf` - PDF documents
✅ `.docx` - Word documents
✅ `.json` - JSON files

---

## 📝 Test Scenarios

### Scenario 1: Test with Sample Documents

**Documents**: renewable_energy.txt, ai_technology.md (already included)

**Test Queries:**
```
1. What are the types of renewable energy?
2. Explain supervised learning
3. What are the environmental impacts of wind energy?
4. How do large language models work?
```

### Scenario 2: Add Your Own Document

**Example: Add a company handbook**

1. Create `documents/company_handbook.txt` with your content
2. Run: `node interactive-rag-agent.js`
3. Ask: "What is our company policy on X?"

### Scenario 3: Multiple Documents

**Add multiple related documents:**
```bash
documents/
  ├── product_overview.pdf
  ├── user_manual.docx
  ├── faq.md
  └── technical_specs.txt
```

**Then ask comprehensive questions that require multiple sources!**

---

## 🔍 How to Verify It's Working

### 1. Check Document Loading

When you start, you should see:
```
📚 Sample documents loaded:
   - your_document.txt (X chunks)
```

### 2. Check Document Retrieval

In the output, look for:
```
📚 Step 1: Retrieving relevant information from documents...
✅ Retrieved context from X source(s)
```

### 3. Check Source Citations

In the final answer, you should see references to:
- Your document names
- Web search results
- Clear attribution of information

---

## 💡 Tips for Better Results

### 1. Document Quality
- Clear, well-structured content works best
- Break long documents into logical sections
- Use descriptive headings

### 2. Query Formulation
- **Good**: "What are the benefits of solar panels?"
- **Better**: "What are the cost and efficiency benefits of solar panels compared to other renewable sources?"

### 3. Number of Chunks
- Default: top 3 chunks retrieved
- For more context, modify in code:
  ```javascript
  const agent = new RAGMultiModelAgent({
    topK: 5  // Retrieve more chunks
  });
  ```

---

## 🐛 Troubleshooting

### "No documents found to index"

**Problem**: Documents folder is empty or files aren't supported

**Solution**: 
```bash
# Check if files exist
ls documents/

# Add sample documents
echo "Your content here" > documents/test.txt
```

### "Embedding API error"

**Problem**: Issue with Google AI API key

**Solution**:
```bash
# Check .env file
cat .env

# Should show:
GOOGLE_AI_API_KEY=your_actual_key_here
GOOGLE_AI_MODEL=gemini-2.5-flash-lite
```

### Slow Performance

**Normal behavior**:
- First query: Slower (indexing + embedding)
- Subsequent queries: Much faster (embeddings cached)

**If consistently slow**:
- Reduce document size
- Decrease topK value
- Split large files into smaller ones

---

## 📊 What to Expect

### Processing Time

- **Document indexing**: 5-30 seconds (one time)
- **Per query**: 15-40 seconds
  - Document retrieval: ~2 seconds
  - Query enhancement: ~3 seconds
  - Web search: ~5 seconds
  - Response generation: ~5 seconds
  - Multi-model evaluation: ~10 seconds
  - Final aggregation: ~5 seconds

### Output Quality

You'll get:
1. ✅ Answers combining your documents + web search
2. ✅ Source citations
3. ✅ Multi-model verification
4. ✅ Comprehensive, well-structured responses

---

## 🚀 Next Steps After Testing

Once you've tested with console queries:

1. **Add more documents** relevant to your use case
2. **Test different query types** (factual, analytical, comparative)
3. **Customize settings** (number of evaluators, chunk size, etc.)
4. **Build a web interface** (optional - for easier document upload)

---

## 📞 Quick Reference

### Start Interactive Mode:
```bash
node interactive-rag-agent.js
```

### Add New Document:
```bash
cp your_file.pdf documents/
# Then restart the agent
```

### View Loaded Documents:
Type `docs` in the interactive prompt

### Get Help:
Type `help` in the interactive prompt

### Exit:
Type `exit` or press `Ctrl+C`

---

Happy testing! 🎉
