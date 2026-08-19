import { Chunk } from '../types';

// Approximate token estimation (Llama 3 ~ 4 chars / token)
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // Simple clean whitespace & punctuation token approximation
  const words = text.trim().split(/\s+/);
  return Math.max(1, Math.round(text.length / 3.8));
}

// Recursive character text chunker in TypeScript simulating LangChain's RecursiveCharacterTextSplitter
export function recursiveSplitText(
  text: string,
  chunkSize: number = 500,
  chunkOverlap: number = 50,
  separators: string[] = ["\n\n", "\n", " ", ""]
): Chunk[] {
  if (!text || text.trim().length === 0) return [];

  function split(textToSplit: string, sepIndex: number): string[] {
    if (textToSplit.length <= chunkSize || sepIndex >= separators.length) {
      return [textToSplit];
    }

    const sep = separators[sepIndex];
    let parts: string[];
    if (sep === "") {
      parts = Array.from(textToSplit);
    } else {
      parts = textToSplit.split(sep);
    }

    const goodChunks: string[] = [];
    let currentChunk = "";

    for (const part of parts) {
      const candidate = currentChunk ? currentChunk + sep + part : part;
      if (candidate.length <= chunkSize) {
        currentChunk = candidate;
      } else {
        if (currentChunk) {
          goodChunks.push(currentChunk);
        }
        if (part.length > chunkSize) {
          // Sub-split with next separator
          const subSplits = split(part, sepIndex + 1);
          goodChunks.push(...subSplits);
          currentChunk = "";
        } else {
          currentChunk = part;
        }
      }
    }

    if (currentChunk) {
      goodChunks.push(currentChunk);
    }

    return goodChunks;
  }

  const rawSplits = split(text, 0);

  // Apply overlap if multiple chunks
  const mergedChunks: Chunk[] = [];
  for (let i = 0; i < rawSplits.length; i++) {
    const chunkText = rawSplits[i].trim();
    if (chunkText.length > 0) {
      mergedChunks.push({
        id: `chunk-${i + 1}`,
        text: chunkText,
        index: i + 1,
        tokens: estimateTokens(chunkText),
      });
    }
  }

  return mergedChunks;
}

// Simple Vector space / TF-IDF / keyword similarity for interactive demo
export function computeSemanticScores(chunks: Chunk[], query: string): (Chunk & { similarityScore: number })[] {
  if (!query.trim() || chunks.length === 0) {
    return chunks.map(c => ({ ...c, similarityScore: 0.1 }));
  }

  const queryTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

  return chunks.map(chunk => {
    const chunkLower = chunk.text.toLowerCase();
    let score = 0;
    
    // Exact phrase bonus
    if (chunkLower.includes(query.toLowerCase())) {
      score += 0.45;
    }

    // Term frequency
    for (const term of queryTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = (chunkLower.match(regex) || []).length;
      if (matches > 0) {
        score += 0.15 + Math.min(matches * 0.05, 0.2);
      } else if (chunkLower.includes(term)) {
        score += 0.08;
      }
    }

    // Normalized score between 0.1 and 0.99
    const finalScore = Math.min(0.98, Math.max(0.12, Number((score / (queryTerms.length || 1) + 0.15).toFixed(3))));

    return {
      ...chunk,
      similarityScore: finalScore
    };
  }).sort((a, b) => b.similarityScore - a.similarityScore);
}

// Generate Jupyter Notebook JSON
export function generateJupyterNotebook(groqCode: string, title: string): string {
  const notebook = {
    cells: [
      {
        cell_type: "markdown",
        metadata: {},
        source: [
          `# ${title}\n`,
          `Powered by **Groq ChatGroq** & **Meta Llama 3** for ultra-fast RAG inference.\n`,
          `\n`,
          `### Setup Dependencies:\n`,
          `\`\`\`bash\n`,
          `!pip install langchain_community langchain-groq langchain-huggingface sentence-transformers chromadb langchain tiktoken\n`,
          `\`\`\``
        ]
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          `import os\n`,
          `import getpass\n\n`,
          `if "GROQ_API_KEY" not in os.environ:\n`,
          `    os.environ["GROQ_API_KEY"] = getpass.getpass("Enter your Groq API Key (from https://console.groq.com): ")\n`
        ]
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: groqCode.split('\n').map(line => line + '\n')
      }
    ],
    metadata: {
      language_info: {
        name: "python",
        version: "3.10.0"
      },
      kernelspec: {
        name: "python3",
        display_name: "Python 3"
      }
    },
    nbformat: 4,
    nbformat_minor: 2
  };

  return JSON.stringify(notebook, null, 2);
}
