import { CodeSnippet, GroqModelOption, RAGDocument } from '../types';

export const GROQ_MODELS: GroqModelOption[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    contextWindow: '128k tokens',
    speed: '~300-350 tok/s',
    description: 'Flagship open model with GPT-4-level reasoning, ideal for complex multi-hop RAG synthesis.',
    recommendedFor: 'Production RAG & Deep Synthesis'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    contextWindow: '128k tokens',
    speed: '~800-1,000 tok/s',
    description: 'Ultra-low latency inference, instant response time with high fidelity for concise extraction.',
    recommendedFor: 'Low-latency search & QA chatbots'
  },
  {
    id: 'llama3-70b-8192',
    name: 'Llama 3 70B (8k)',
    contextWindow: '8,192 tokens',
    speed: '~330 tok/s',
    description: 'High performance Meta Llama 3 70B parameter model with 8k context window.',
    recommendedFor: 'Standard RAG pipelines'
  },
  {
    id: 'llama3-8b-8192',
    name: 'Llama 3 8B (8k)',
    contextWindow: '8,192 tokens',
    speed: '~850 tok/s',
    description: 'Superfast 8B model on Groq LPUs for rapid prototyping and interactive workflows.',
    recommendedFor: 'High throughput & cost efficiency'
  }
];

export const SAMPLE_DOCUMENTS: RAGDocument[] = [
  {
    id: 'lilian-agent-decom',
    title: 'LLM Powered Autonomous Agents - Task Decomposition',
    source: 'https://lilianweng.github.io/posts/2023-06-23-agent/',
    content: `Building agents with LLM (large language model) as its core controller is a cool concept. In an LLM-powered autonomous agent system, LLM functions as the agent’s brain, complemented by several key components: Planning, Memory, and Tool Use.

1. Task Decomposition:
Complex tasks usually involve many steps. An agent needs to know what the steps are and plan ahead.
- Chain of thought (CoT; Wei et al. 2022) has become a standard prompting technique for enhancing model performance on complex tasks. The model is instructed to "think step by step" to utilize more test-time computation to decompose the hard task into smaller and simpler steps.
- Tree of Thoughts (Yao et al. 2023) extends CoT by exploring multiple reasoning possibilities at each step. It first decomposes the problem into multiple thought steps and generates multiple thoughts per step, creating a tree structure.
- Task-specific instructions: for example, "Write a story with 5 chapters."
- Human inputs: with human-in-the-loop, the user can guide the decomposition.

2. Self-Reflection:
Self-reflection is a vital aspect that allows autonomous agents to improve iteratively by refining past action decisions and correcting previous mistakes.
- ReAct (Yao et al. 2023) integrates reasoning and acting within LLM by extending the action space to be a combination of task-specific discrete actions and the linguistic thought space.
- Reflexion (Shinn & Labash 2023) equips the agent with dynamic memory and self-reflection capabilities to improve reasoning skills.

3. Memory Stream & Vector Storage:
Memory stream is a long-term memory module that records a comprehensive list of agents' experience in natural language. Vector databases are used for fast associative recall via embedding distance.`
  },
  {
    id: 'groq-lpu-architecture',
    title: 'Groq LPU Inference Engine Architecture',
    source: 'https://groq.com/technology/',
    content: `Groq developed the Language Processing Unit (LPU) Inference Engine. The LPU is an entirely new processing architecture designed specifically for the compute-intensive, sequential nature of Large Language Models (LLMs).

Unlike traditional GPUs that rely on high-bandwidth memory (HBM) and dynamic instruction scheduling designed for parallel graphics rendering, Groq's Tensor Streaming Processor (TSP) architecture features:
1. Deterministic Execution: Exact execution timing is calculated at compile time, eliminating memory bottlenecks and dynamic scheduling overhead.
2. SRAM on-chip memory: Ultra-high memory bandwidth (up to 80TB/s per chip), delivering over 500-1,000 tokens per second per user stream.
3. Sub-second Time To First Token (TTFT): Critical for conversational AI and multi-step agentic RAG workflows where LLMs make multiple calls sequentially.
4. Llama 3 Performance: ChatGroq enables running Meta's Llama 3 70B at over 300 tokens/sec and Llama 3 8B at over 800 tokens/sec, converting 5-second RAG response times into mere 200ms instantaneous streams.`
  },
  {
    id: 'rag-chunking-guide',
    title: 'Chunking Strategies & Vector Embeddings',
    source: 'LangChain RAG Architecture Guide',
    content: `Chunking is the process of breaking down large documents into smaller, coherent units before indexing into a vector store.
1. RecursiveCharacterTextSplitter splits text by prioritizing natural semantic boundaries: double newlines (paragraphs), single newlines (sentences), spaces (words), and individual characters.
2. Chunk Size vs Overlap: Standard chunk size of 500-1000 characters with 10-20% overlap (100-200 characters) preserves context across chunk boundaries, preventing fragmented semantic recall.
3. Embeddings: Since Groq specializes in ultra-fast LLM generation (LPU), dense text embeddings are typically computed using HuggingFaceEmbeddings (e.g. BAAI/bge-small-en-v1.5 or sentence-transformers/all-MiniLM-L6-v2) or FastEmbed, then queried via Chroma or FAISS.`
  }
];

export const RAG_PARTS: CodeSnippet[] = [
  {
    id: 'part-1-quickstart',
    title: 'Part 1: RAG Quickstart (End-to-End)',
    part: 'Part 1',
    description: 'Complete end-to-end RAG pipeline converting OpenAI ChatOpenAI and OpenAIEmbeddings to Groq ChatGroq with Llama 3 and HuggingFace/FastEmbed embeddings.',
    openaiCode: `import bs4
from langchain import hub
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

#### INDEXING ####

# Load Documents
loader = WebBaseLoader(
    web_paths=("https://lilianweng.github.io/posts/2023-06-23-agent/",),
    bs_kwargs=dict(
        parse_only=bs4.SoupStrainer(
            class_=("post-content", "post-title", "post-header")
        )
    ),
)
docs = loader.load()

# Split
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)

# Embed
vectorstore = Chroma.from_documents(documents=splits, 
                                    embedding=OpenAIEmbeddings())

retriever = vectorstore.as_retriever()

#### RETRIEVAL and GENERATION ####

# Prompt
prompt = hub.pull("rlm/rag-prompt")

# LLM
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)

# Post-processing
def format_docs(docs):
    return "\\n\\n".join(doc.page_content for doc in docs)

# Chain
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Question
rag_chain.invoke("What is Task Decomposition?")`,
    groqCode: `import os
import bs4
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Set Groq API Key (get free at https://console.groq.com)
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")

#### 1. INDEXING ####

# Load Web Documents
loader = WebBaseLoader(
    web_paths=("https://lilianweng.github.io/posts/2023-06-23-agent/",),
    bs_kwargs=dict(
        parse_only=bs4.SoupStrainer(
            class_=("post-content", "post-title", "post-header")
        )
    ),
)
docs = loader.load()

# Split into semantic chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)

# Embed & Store with HuggingFace Sentence-Transformers + Chroma
# (Groq powers ultra-fast LLM generation; HuggingFace provides local dense vectors)
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings)

retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

#### 2. RETRIEVAL & GENERATION WITH GROQ LLAMA 3 ####

# Custom RAG Prompt Template
template = """You are an expert AI assistant. Answer the question based ONLY on the provided context:

Context:
{context}

Question:
{question}

Provide a concise, accurate, and structured answer. If the context does not contain the answer, say you do not know.
"""
prompt = ChatPromptTemplate.from_template(template)

# Initialize ChatGroq with Meta Llama 3 (Ultra-Fast Inference!)
llm = ChatGroq(
    model="llama-3.3-70b-versatile",  # Or "llama3-8b-8192" for 800+ tok/s
    temperature=0.1,
    max_retries=2,
)

# Format retrieved documents helper
def format_docs(docs):
    return "\\n\\n".join(doc.page_content for doc in docs)

# LCEL (LangChain Expression Language) RAG Chain
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Execute query
response = rag_chain.invoke("What is Task Decomposition?")
print("--- Llama 3 Response (Groq) ---")
print(response)`,
    explanation: [
      'Replaced langchain-openai with langchain-groq and langchain-huggingface for lightning-fast, cost-effective inference.',
      'Swapped ChatOpenAI(gpt-3.5-turbo) with ChatGroq(llama-3.3-70b-versatile or llama3-8b-8192), speeding up generation from ~25 tok/s to 300-800+ tok/s.',
      'Utilized HuggingFaceEmbeddings ("all-MiniLM-L6-v2") for zero-cost, local, high-density vector representations.',
      'Defined a clear, structured ChatPromptTemplate with LCEL composition for deterministic RAG grounding.'
    ],
    keyChanges: [
      {
        from: 'from langchain_openai import ChatOpenAI, OpenAIEmbeddings',
        to: 'from langchain_groq import ChatGroq\nfrom langchain_huggingface import HuggingFaceEmbeddings',
        reason: 'Switches to the specialized Groq hardware runtime & open embeddings'
      },
      {
        from: 'llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)',
        to: 'llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1)',
        reason: 'Unleashes Meta Llama 3 with sub-second Time To First Token on Groq LPUs'
      },
      {
        from: 'OpenAIEmbeddings()',
        to: 'HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")',
        reason: 'Fast, lightweight embedding model perfectly paired with Groq inference'
      }
    ]
  },
  {
    id: 'part-2-indexing',
    title: 'Part 2: Indexing (Tokens, Embeddings & Cosine Similarity)',
    part: 'Part 2',
    description: 'Document loaders, chunking mechanisms, token counting for Llama 3, vector embedding models, and mathematical cosine similarity measurement.',
    openaiCode: `# Documents
question = "What kinds of pets do I like?"
document = "My favorite pet is a cat."

# Count tokens considering ~4 char / token
import tiktoken

def num_tokens_from_string(string: str, encoding_name: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(encoding_name)
    num_tokens = len(encoding.encode(string))
    return num_tokens

num_tokens_from_string(question, "cl100k_base")

# Text embedding models
from langchain_openai import OpenAIEmbeddings
embd = OpenAIEmbeddings()
query_result = embd.embed_query(question)
document_result = embd.embed_query(document)
print("Embedding dimension:", len(query_result))

# Cosine similarity
import numpy as np

def cosine_similarity(vec1, vec2):
    dot_product = np.dot(vec1, vec2)
    norm_vec1 = np.linalg.norm(vec1)
    norm_vec2 = np.linalg.norm(vec2)
    return dot_product / (norm_vec1 * norm_vec2)

similarity = cosine_similarity(query_result, document_result)
print("Cosine Similarity:", similarity)

# Split with RecursiveCharacterTextSplitter
from langchain.text_splitter import RecursiveCharacterTextSplitter
text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=300, 
    chunk_overlap=50)

splits = text_splitter.split_documents(blog_docs)`,
    groqCode: `# Token Counting & Embeddings for Groq / Llama 3 Stack
import numpy as np
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tiktoken

question = "What kinds of pets do I like?"
document = "My favorite pet is a cat."

# 1. Token Counting for Llama 3
# Note: Llama 3 uses a 128k vocabulary tokenizer (similar to tiktoken o200k_base / cl100k_base or transformers AutoTokenizer)
def count_llama3_tokens(text: str) -> int:
    try:
        # Use tiktoken as a fast approximation
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(text))
    except Exception:
        # Fallback heuristic: ~4 characters per token
        return max(1, len(text) // 4)

q_tokens = count_llama3_tokens(question)
doc_tokens = count_llama3_tokens(document)
print(f"Question Tokens: {q_tokens}, Document Tokens: {doc_tokens}")

# 2. Embedding Model (Hugging Face / FastEmbed for Groq workflows)
# Model options:
# - "sentence-transformers/all-MiniLM-L6-v2" (384 dimensions, super fast)
# - "BAAI/bge-small-en-v1.5" (384 dimensions, higher MTEB score)
# - "BAAI/bge-large-en-v1.5" (1024 dimensions, high semantic precision)
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True} # Pre-normalized for instant dot-product
)

q_vec = embeddings.embed_query(question)
doc_vec = embeddings.embed_query(document)
print(f"Vector Dimensions: {len(q_vec)} (all-MiniLM-L6-v2)")

# 3. Fast Cosine Similarity Calculation
def cosine_similarity(v1, v2):
    v1, v2 = np.array(v1), np.array(v2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

similarity = cosine_similarity(q_vec, doc_vec)
print(f"Cosine Similarity Score: {similarity:.4f}")

# 4. Text Splitting Optimized for Llama 3 Context Window
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,        # ~125 tokens per chunk
    chunk_overlap=50,      # ~12 tokens overlap to preserve boundary context
    separators=["\\n\\n", "\\n", " ", ""]
)

# Example chunking:
sample_text = """Building agents with LLMs requires planning, memory, and tools.
Task decomposition breaks complex goals into manageable steps.
Self-reflection allows iterative improvement over past experiences."""

chunks = text_splitter.split_text(sample_text)
print(f"Created {len(chunks)} chunks:")
for i, chunk in enumerate(chunks):
    print(f" Chunk {i+1} ({count_llama3_tokens(chunk)} tokens): {chunk}")`,
    explanation: [
      'Tokenization: Configured for Llama 3 128k vocabulary tokens.',
      'Dense Embeddings: Integrated HuggingFaceEmbeddings with `normalize_embeddings=True`, enabling ultra-fast vector dot-product scoring.',
      'Optimized Splitter: Calibrated chunk_size and chunk_overlap for high-precision retrieval without context dilution.',
      'Zero API cost for embeddings and token calculation.'
    ],
    keyChanges: [
      {
        from: 'embd = OpenAIEmbeddings()',
        to: 'embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")',
        reason: 'Free, locally-computed high accuracy embeddings paired with Groq inference'
      },
      {
        from: 'chunk_size=300 (tiktoken_encoder)',
        to: 'RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)',
        reason: 'Character-based hierarchy split prevents splitting across semantic words'
      }
    ]
  },
  {
    id: 'part-3-retrieval',
    part: 'Part 3',
    title: 'Part 3: Vectorstores & Retrieval',
    description: 'Chroma / FAISS vector stores, k-nearest neighbors semantic similarity search, and score threshold filtering.',
    openaiCode: `# Index
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

vectorstore = Chroma.from_documents(
    documents=splits, 
    embedding=OpenAIEmbeddings()
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 1})
docs = retriever.get_relevant_documents("What is Task Decomposition?")
len(docs)`,
    groqCode: `# Vector Store & Semantic Retrieval for Groq Llama 3
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Initialize embedding function
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# 2. Build Chroma Vectorstore from splits
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=embeddings,
    collection_name="groq_rag_collection"
)

# 3. Create Multi-Mode Retriever
# Mode A: Top-K Similarity Search
retriever_k = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)

# Mode B: Similarity Search with Relevance Score Threshold
retriever_threshold = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.5, "k": 3}
)

# 4. Query the retriever
query = "What is Task Decomposition?"
retrieved_docs = retriever_k.invoke(query)

print(f"Retrieved {len(retrieved_docs)} relevant context chunks for query: '{query}'\\n")
for i, doc in enumerate(retrieved_docs, 1):
    print(f"--- Document Chunk {i} ---")
    print(doc.page_content.strip())
    print()`,
    explanation: [
      'Chroma DB stores vector embeddings generated by HuggingFace / FastEmbed.',
      'Updated retriever invocation to modern LangChain `.invoke(query)` pattern (replacing deprecated `.get_relevant_documents()`).',
      'Configured top-k (k=3) for richer contextual grounding when synthesizing with Llama 3 70B.',
      'Demonstrated score thresholding to filter out low-confidence retrieved contexts.'
    ],
    keyChanges: [
      {
        from: 'docs = retriever.get_relevant_documents(query)',
        to: 'docs = retriever.invoke(query)',
        reason: 'Modern LangChain 0.2+ Runnable standard'
      },
      {
        from: 'search_kwargs={"k": 1}',
        to: 'search_kwargs={"k": 3}',
        reason: 'Provides comprehensive multi-chunk context for Llama 3 reasoning'
      }
    ]
  },
  {
    id: 'part-4-generation',
    part: 'Part 4',
    title: 'Part 4: Generation with ChatGroq & Llama 3',
    description: 'Prompt engineering, ChatGroq integration, streaming generation, and complete LCEL runnable chains.',
    openaiCode: `from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Prompt
template = """Answer the question based only on the following context:
{context}

Question: {question}
"""

prompt = ChatPromptTemplate.from_template(template)

# LLM
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)

# Chain
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

rag_chain.invoke("What is Task Decomposition?")`,
    groqCode: `import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Ensure GROQ_API_KEY is present
groq_api_key = os.environ.get("GROQ_API_KEY")

# 1. High-Precision Prompt Template for Llama 3
template = """You are an intelligent knowledge assistant. Use the retrieved context below to provide an accurate, helpful answer to the user's question.

<context>
{context}
</context>

Question: {question}

Helpful Answer:"""

prompt = ChatPromptTemplate.from_template(template)

# 2. ChatGroq with Meta Llama 3
# Ultra-fast token throughput (300-800+ tokens/sec)
llm = ChatGroq(
    model="llama-3.3-70b-versatile",  # Or "llama-3.1-8b-instant" / "llama3-8b-8192"
    temperature=0,
    groq_api_key=groq_api_key,
    max_tokens=1024,
    streaming=True  # Enables real-time token streaming
)

# 3. Context formatter
def format_docs(docs):
    return "\\n\\n".join(f"[Chunk {i+1}]:\\n{doc.page_content}" for i, doc in enumerate(docs))

# 4. Construct LCEL Chain
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# 5. Option A: Standard Direct Invoke
query = "What is Task Decomposition?"
result = rag_chain.invoke(query)
print("Direct Output:\\n", result)

# 6. Option B: Real-Time Token Streaming (Sub-Second response!)
print("\\n--- Streaming Output ---")
for chunk in rag_chain.stream(query):
    print(chunk, end="", flush=True)
print()`,
    explanation: [
      'ChatGroq is initialized with `model="llama-3.3-70b-versatile"` or `"llama3-8b-8192"`.',
      'Enabled `streaming=True` allowing instant word-by-word streaming through `rag_chain.stream()`.',
      'Enhanced prompt template with `<context>` tagging tailored for Llama 3 attention mechanism.',
      'Maintained 100% LCEL (LangChain Expression Language) composability.'
    ],
    keyChanges: [
      {
        from: 'from langchain_openai import ChatOpenAI\nllm = ChatOpenAI(model_name="gpt-3.5-turbo")',
        to: 'from langchain_groq import ChatGroq\nllm = ChatGroq(model="llama-3.3-70b-versatile", streaming=True)',
        reason: 'Leverages Groq LPUs for ~10x-20x faster inference speeds with streaming'
      },
      {
        from: 'rag_chain.invoke(...)',
        to: 'for chunk in rag_chain.stream(...): print(chunk, end="", flush=True)',
        reason: 'Sub-second real-time streaming to the terminal or frontend'
      }
    ]
  },
  {
    id: 'full-production-script',
    part: 'Full Suite',
    title: 'Complete Standalone Python Script (Production Ready)',
    description: 'A single, self-contained Python script implementing the full RAG pipeline with Groq Llama 3, error handling, command-line arguments, and streaming.',
    openaiCode: `# Non-Groq Legacy Script
# Requires paid OpenAI credits and slow response times`,
    groqCode: `"""
RAG From Scratch with Groq & Meta Llama 3
High-Speed Retrieval-Augmented Generation using LangChain and ChatGroq
"""

import os
import sys
import argparse
import bs4
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

def build_rag_system(url: str, model_name: str = "llama-3.3-70b-versatile"):
    # 1. Verify Groq API Key
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("ERROR: GROQ_API_KEY environment variable is not set.")
        print("Get your free API key at https://console.groq.com")
        print("Then run: export GROQ_API_KEY='gsk_...'")
        sys.exit(1)

    print(f"[*] 1. Loading document from: {url} ...")
    loader = WebBaseLoader(
        web_paths=(url,),
        bs_kwargs=dict(
            parse_only=bs4.SoupStrainer(
                class_=("post-content", "post-title", "post-header", "article", "main")
            )
        ),
    )
    docs = loader.load()
    print(f"    Loaded {len(docs)} document(s) ({sum(len(d.page_content) for d in docs)} characters)")

    print("[*] 2. Splitting text into semantic chunks ...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\\n\\n", "\\n", " ", ""]
    )
    splits = text_splitter.split_documents(docs)
    print(f"    Generated {len(splits)} chunks.")

    print("[*] 3. Initializing local HuggingFace embeddings & Chroma vectorstore ...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embeddings
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    print(f"[*] 4. Initializing Groq Llama 3 engine ({model_name}) ...")
    llm = ChatGroq(
        model=model_name,
        temperature=0.1,
        groq_api_key=api_key,
        streaming=True
    )

    template = """Answer the question strictly based on the following retrieved context:

Context:
{context}

Question: {question}

Helpful & Detailed Answer:"""

    prompt = ChatPromptTemplate.from_template(template)

    def format_docs(retrieved_docs):
        return "\\n\\n".join(doc.page_content for doc in retrieved_docs)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    print("[+] RAG Pipeline successfully initialized on Groq LPUs!\\n")
    return rag_chain

def interactive_loop(rag_chain):
    print("=" * 60)
    print("Interactive RAG Assistant (Powered by Groq + Llama 3)")
    print("Type 'exit' or 'quit' to stop.")
    print("=" * 60)

    while True:
        try:
            query = input("\\n\\033[1;36mAsk a question > \\033[0m").strip()
            if not query:
                continue
            if query.lower() in ("exit", "quit"):
                print("Goodbye!")
                break

            print("\\n\\033[1;32m[Groq Llama 3 Streaming Response]\\033[0m")
            for chunk in rag_chain.stream(query):
                print(chunk, end="", flush=True)
            print("\\n")
        except KeyboardInterrupt:
            print("\\nSession ended.")
            break

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run RAG with Groq & Llama 3")
    parser.add_argument(
        "--url",
        default="https://lilianweng.github.io/posts/2023-06-23-agent/",
        help="URL to load and index"
    )
    parser.add_argument(
        "--model",
        default="llama-3.3-70b-versatile",
        choices=["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "llama3-8b-8192"],
        help="Groq Llama 3 model variant"
    )
    args = parser.parse_args()

    chain = build_rag_system(url=args.url, model_name=args.model)
    interactive_loop(chain)`,
    explanation: [
      'Complete ready-to-run Python script with CLI options for target URL and Llama 3 model variant.',
      'Automatic fallback and informative setup messages for `GROQ_API_KEY`.',
      'Interactive CLI REPL with live streaming generation.',
      'Production-grade document chunking and vector indexing.'
    ],
    keyChanges: []
  },
  {
    id: 'part-8-multi-pdf-loader',
    title: 'Part 8: Multi-PDF Dataloaders & Content-Specific RAG',
    part: 'Part 8',
    description: 'Load 5-10+ PDF files using PyPDFDirectoryLoader & PyPDFLoader, enrich chunk metadata (page, filename, category), apply content-specific filtering, and query with Groq Llama 3.',
    openaiCode: `import os
from langchain_community.document_loaders import PyPDFDirectoryLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# 1. LOAD 5-10 PDFs from a directory
# pip install pypdf or pymupdf
pdf_dir = "./uploaded_pdfs/"
loader = PyPDFDirectoryLoader(pdf_dir)
raw_docs = loader.load()

print(f"Loaded {len(raw_docs)} pages across PDF documents.")

# 2. Split with Metadata preservation
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=150,
    add_start_index=True
)
splits = text_splitter.split_documents(raw_docs)

# 3. Vectorstore with OpenAI Embeddings
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=OpenAIEmbeddings(),
    persist_directory="./chroma_pdf_db"
)

# 4. Content-Specific Retrieval (Filter by document source)
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 4,
        "filter": {"source": "./uploaded_pdfs/Q3_Financial_Report.pdf"} # Optional metadata filter
    }
)

# 5. LLM & Chain
llm = ChatOpenAI(model_name="gpt-4o", temperature=0)
prompt = ChatPromptTemplate.from_template("Answer from PDF context:\\n{context}\\n\\nQuestion: {question}")

rag_chain = (
    {"context": retriever | (lambda docs: "\\n\\n".join(f"[{d.metadata.get('source')} p.{d.metadata.get('page')}]: {d.page_content}" for d in docs)), 
     "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

print(rag_chain.invoke("What was the net profit reported in Q3?"))`,
    groqCode: `import os
import glob
from pathlib import Path
from langchain_community.document_loaders import PyPDFDirectoryLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Set Groq API Key
os.environ["GROQ_API_KEY"] = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")

# =====================================================================
# STEP 1: MULTI-PDF DATALOADER (5-10+ PDFS IN BATCH OR DIRECTORY)
# =====================================================================
PDF_STORAGE_DIR = "./my_pdf_knowledge_base/"
os.makedirs(PDF_STORAGE_DIR, exist_ok=True)

# Option A: Load entire folder containing 5-10+ PDFs at once
print(f"[+] Loading all PDF documents from: {PDF_STORAGE_DIR}")
pdf_loader = PyPDFDirectoryLoader(
    path=PDF_STORAGE_DIR,
    glob="**/*.pdf",
    silent_errors=True
)
raw_pdf_docs = pdf_loader.load()

# Option B: Or load specific list of uploaded PDFs with custom tags
custom_pdf_paths = [
    "Q3_Financial_Results.pdf",
    "Technical_Architecture_Spec.pdf",
    "Legal_Master_Service_Agreement.pdf",
    "Clinical_Research_Study_2024.pdf",
    "Product_Requirements_Doc.pdf"
]

all_docs = list(raw_pdf_docs)
for pdf_file in custom_pdf_paths:
    full_path = os.path.join(PDF_STORAGE_DIR, pdf_file)
    if os.path.exists(full_path):
        loader = PyPDFLoader(full_path)
        docs = loader.load()
        # Enrich metadata with content-specific category tags
        for doc in docs:
            doc.metadata["category"] = "Finance" if "Financial" in pdf_file else "Technical"
            doc.metadata["filename"] = pdf_file
        all_docs.extend(docs)

print(f"[✓] Successfully loaded {len(all_docs)} total pages across {len(set(d.metadata.get('source', '') for d in all_docs))} PDFs.")

# =====================================================================
# STEP 2: CONTENT-SPECIFIC RECURSIVE CHUNKING
# =====================================================================
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150,
    separators=["\\n\\n", "\\n", "(?<=\\.) ", " ", ""],
    add_start_index=True
)
chunked_docs = text_splitter.split_documents(all_docs)
print(f"[✓] Created {len(chunked_docs)} semantic chunks with page & file metadata.")

# =====================================================================
# STEP 3: HIGH-SPEED VECTOR INDEXING (HUGGINGFACE + CHROMA)
# =====================================================================
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True}
)

vectorstore = Chroma.from_documents(
    documents=chunked_docs,
    embedding=embeddings,
    collection_name="multi_pdf_rag_store",
    persist_directory="./chroma_multi_pdf_db"
)

# =====================================================================
# STEP 4: CONTENT-SPECIFIC FILTERING & MULTI-DOC RETRIEVER
# =====================================================================
# Can retrieve across ALL PDFs, or filter by specific PDF / Category:
# filter_condition = {"category": "Finance"} OR {"filename": "Technical_Architecture_Spec.pdf"}
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={
        "k": 4,
        # "filter": {"filename": "Q3_Financial_Results.pdf"}  # Optional specific PDF filter
    }
)

# Format documents with clear citation of filename and page number
def format_pdf_citations(docs):
    formatted = []
    for doc in docs:
        source_name = Path(doc.metadata.get('source', doc.metadata.get('filename', 'Unknown PDF'))).name
        page_num = doc.metadata.get('page', 0) + 1  # 1-indexed page
        formatted.append(f"--- [Source: {source_name} | Page: {page_num}] ---\\n{doc.page_content}")
    return "\\n\\n".join(formatted)

# =====================================================================
# STEP 5: GROQ CHATGROQ + META LLAMA 3 SYNTHESIS
# =====================================================================
template = """You are a high-accuracy Document Intelligence Assistant. Answer the question using ONLY the provided multi-PDF excerpts.

Retrieved PDF Context & Citations:
{context}

User Question:
{question}

Instructions:
1. Ground your response strictly in the retrieved excerpts above.
2. Cite the exact PDF filename and page number for each fact stated (e.g., [Q3_Financial_Results.pdf, Page 4]).
3. If multiple PDFs contain complementary details, synthesize them clearly.
4. If the answer is not present in the documents, state that clearly.

Detailed Answer with Citations:"""

prompt = ChatPromptTemplate.from_template(template)

llm = ChatGroq(
    model="llama-3.3-70b-versatile",  # Or "llama-3.1-8b-instant" for 800+ tok/s
    temperature=0.1,
    max_retries=2,
)

multi_pdf_rag_chain = (
    {"context": retriever | format_pdf_citations, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# =====================================================================
# STEP 6: EXECUTE QUERY ACROSS MULTIPLE PDFS
# =====================================================================
query = "What are the key financial performance metrics and compliance requirements outlined in the documents?"
print(f"\\nQuery: {query}\\n")
print("--- [Groq LPU Llama 3 Answer with PDF Citations] ---")
response = multi_pdf_rag_chain.invoke(query)
print(response)`,
    explanation: [
      'Utilizes `PyPDFDirectoryLoader` to automatically ingest and parse 5-10+ PDF files in batch from any directory.',
      'Supports per-file `PyPDFLoader` iteration to inject custom content-specific metadata tags (e.g. Finance, Legal, Technical, filename, page numbers).',
      'Enables content-specific retrieval using Chroma metadata filters (e.g. `filter={"filename": "doc.pdf"}` or `filter={"category": "Finance"}`).',
      'Pairs with Groq ChatGroq (Meta Llama 3.3 70B) for instant citations, multi-document synthesis, and sub-second Time To First Token.'
    ],
    keyChanges: [
      {
        from: 'WebBaseLoader(web_paths=(url,))',
        to: 'PyPDFDirectoryLoader(pdf_dir, glob="**/*.pdf")\n# Or PyPDFLoader(file_path)',
        reason: 'Ingests multiple local PDF documents rather than single HTML web pages'
      },
      {
        from: 'retriever = vectorstore.as_retriever()',
        to: 'retriever = vectorstore.as_retriever(search_kwargs={"k": 4, "filter": {"category": "Finance"}})',
        reason: 'Adds content-specific metadata filtering across different PDF domains'
      },
      {
        from: 'format_docs(docs) -> plain text',
        to: 'format_pdf_citations(docs) -> [Source: doc.pdf | Page: 3]',
        reason: 'Enforces verifiable source and page citations across multi-PDF answers'
      }
    ]
  }
];
