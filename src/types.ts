export interface CodeSnippet {
  id: string;
  title: string;
  part: string;
  description: string;
  openaiCode: string;
  groqCode: string;
  explanation: string[];
  keyChanges: {
    from: string;
    to: string;
    reason: string;
  }[];
}

export interface RAGDocument {
  id: string;
  title: string;
  source: string;
  content: string;
}

export interface Chunk {
  id: string;
  text: string;
  index: number;
  tokens: number;
  similarityScore?: number;
}

export interface GroqModelOption {
  id: string;
  name: string;
  contextWindow: string;
  speed: string;
  description: string;
  recommendedFor: string;
}
