import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  RefreshCw,
  Users,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Layers,
  Code,
  LogOut,
  Hash,
  Search,
  Check,
  Copy
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
  GOOGLE_CHAT_SCOPES,
} from '../services/googleAuth';
import {
  listSpaces,
  createSpace,
  listMessages,
  sendMessage,
  deleteMessage,
  listMembers,
  GoogleChatSpace,
  GoogleChatMessage,
  GoogleChatMembership,
} from '../services/googleChatApi';

interface GoogleChatManagerProps {
  lastRAGResult?: {
    question: string;
    answer: string;
    model: string;
    ttftMs: number;
    tokensPerSec: number;
  };
}

export const GoogleChatManager: React.FC<GoogleChatManagerProps> = ({ lastRAGResult }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Chat state
  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<GoogleChatSpace | null>(null);
  const [messages, setMessages] = useState<GoogleChatMessage[]>([]);
  const [members, setMembers] = useState<GoogleChatMembership[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Message composer state
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Confirmation Modals State (Mandatory for mutating/sending operations)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    payloadText?: string;
    actionType: 'send_message' | 'delete_message' | 'create_space';
    targetId?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'send_message',
  });

  // Create space modal
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  // Show Members Panel
  const [showMembersPanel, setShowMembersPanel] = useState(false);

  // Auto initialize Auth on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        fetchSpaces(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fetch spaces list
  const fetchSpaces = async (token?: string) => {
    const activeToken = token || accessToken;
    if (!activeToken) return;

    setIsLoadingSpaces(true);
    setChatError(null);
    try {
      const data = await listSpaces(activeToken);
      setSpaces(data);
      if (data.length > 0 && !selectedSpace) {
        setSelectedSpace(data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching spaces:', err);
      setChatError(err.message || 'Failed to load Google Chat spaces. Your access token may have expired.');
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  // Fetch messages when space changes
  useEffect(() => {
    if (selectedSpace && accessToken) {
      fetchMessages(selectedSpace.name);
      fetchMembersList(selectedSpace.name);
    } else {
      setMessages([]);
      setMembers([]);
    }
  }, [selectedSpace, accessToken]);

  const fetchMessages = async (spaceName: string) => {
    if (!accessToken) return;
    setIsLoadingMessages(true);
    setChatError(null);
    try {
      const data = await listMessages(accessToken, spaceName);
      setMessages(data);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setChatError(err.message || 'Failed to fetch messages.');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchMembersList = async (spaceName: string) => {
    if (!accessToken) return;
    setIsLoadingMembers(true);
    try {
      const data = await listMembers(accessToken, spaceName);
      setMembers(data);
    } catch (err: any) {
      console.error('Error fetching members:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Handle Google Login
  const handleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        fetchSpaces(result.accessToken);
        showSuccess('Connected to Google Chat successfully!');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Sign in with Google failed. Please check popup permissions.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setSpaces([]);
    setSelectedSpace(null);
    setMessages([]);
    setMembers([]);
    showSuccess('Signed out of Google Workspace.');
  };

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // Request to Send Message (opens mandatory user confirmation modal)
  const handleRequestSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !selectedSpace) return;

    setConfirmModal({
      isOpen: true,
      title: `Send Message to ${selectedSpace.displayName || 'Google Chat Space'}?`,
      description: `You are about to broadcast this message to the Google Chat space "${selectedSpace.displayName || selectedSpace.name}".`,
      payloadText: messageInput,
      actionType: 'send_message',
    });
  };

  // Request to Delete Message (opens mandatory user confirmation modal)
  const handleRequestDeleteMessage = (messageName: string, textSnippet?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Google Chat Message?',
      description: 'Are you sure you want to delete this message? This action is permanent and cannot be undone.',
      payloadText: textSnippet || messageName,
      actionType: 'delete_message',
      targetId: messageName,
    });
  };

  // Execute Confirmed Action
  const executeConfirmedAction = async () => {
    if (!accessToken || !selectedSpace) return;
    const { actionType, payloadText, targetId } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    if (actionType === 'send_message' && payloadText) {
      setIsSending(true);
      try {
        await sendMessage(accessToken, selectedSpace.name, payloadText);
        setMessageInput('');
        showSuccess('Message posted to Google Chat!');
        fetchMessages(selectedSpace.name);
      } catch (err: any) {
        setChatError(err.message || 'Failed to send message to Google Chat.');
      } finally {
        setIsSending(false);
      }
    } else if (actionType === 'delete_message' && targetId) {
      try {
        await deleteMessage(accessToken, targetId);
        showSuccess('Message deleted.');
        fetchMessages(selectedSpace.name);
      } catch (err: any) {
        setChatError(err.message || 'Failed to delete message.');
      }
    }
  };

  // Create Space Handler
  const handleCreateSpaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newSpaceName.trim()) return;

    setIsCreatingSpace(true);
    setChatError(null);
    try {
      const created = await createSpace(accessToken, newSpaceName.trim(), 'SPACE');
      setIsCreateSpaceModalOpen(false);
      setNewSpaceName('');
      showSuccess(`Created space "${created.displayName || newSpaceName}"!`);
      await fetchSpaces(accessToken);
      setSelectedSpace(created);
    } catch (err: any) {
      setChatError(err.message || 'Failed to create Google Chat space.');
    } finally {
      setIsCreatingSpace(false);
    }
  };

  // Quick Preset Inserters
  const insertBenchmarkShare = () => {
    const text = `⚡ *Groq LPU vs GPU RAG Benchmark Report*\n- Model: Meta Llama 3 (ChatGroq)\n- Speed: ~800+ tokens/second (20x faster than GPU)\n- Time-to-First-Token (TTFT): 150ms\n- Vector Store: Chroma DB + HuggingFace Embeddings\n- Status: Production Ready`;
    setMessageInput(text);
  };

  const insertArchitectureSummary = () => {
    const text = `🧠 *RAG from Scratch: Groq + Llama 3 Architecture*\n1. Ingestion: BeautifulSoup / WebBaseLoader\n2. Chunking: RecursiveCharacterTextSplitter (1000/200)\n3. Embeddings: HuggingFace all-MiniLM-L6-v2\n4. Vector DB: Chroma DB (HNSW Index)\n5. Inference: ChatGroq with \`llama3-8b-8192\`\n6. Pipeline: LangChain LCEL Stream Execution`;
    setMessageInput(text);
  };

  const insertPythonSnippet = () => {
    const text = `📦 *Python LangChain + Groq Code Snippet*\n\`\`\`python\nfrom langchain_groq import ChatGroq\nfrom langchain_core.prompts import ChatPromptTemplate\n\nllm = ChatGroq(model_name="llama3-8b-8192", temperature=0)\nchain = prompt | llm | StrOutputParser()\n\`\`\``;
    setMessageInput(text);
  };

  const insertLastRAGResult = () => {
    if (!lastRAGResult) return;
    const text = `🔍 *Live RAG Query & Inference Result*\n*Question:* ${lastRAGResult.question}\n*Answer:* ${lastRAGResult.answer}\n*Metrics:* Model ${lastRAGResult.model} | ${lastRAGResult.tokensPerSec} tok/s | ${lastRAGResult.ttftMs}ms TTFT`;
    setMessageInput(text);
  };

  // Filtered spaces
  const filteredSpaces = spaces.filter((s) => {
    const name = s.displayName || s.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Integration Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Google Workspace Integration
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Google Chat Workspaces & Collaboration Hub
            </h2>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Connect your Google Workspace to interact with Google Chat spaces, browse channels, post RAG query insights, and share high-speed Groq + Llama 3 benchmarks directly with your team.
            </p>
          </div>

          {/* Auth Button or User Profile Card */}
          <div className="shrink-0">
            {user && accessToken ? (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full border border-slate-300"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="text-left pr-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {user.displayName || 'Google User'}
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
                  </div>
                  <div className="text-[11px] text-slate-500 max-w-[160px] truncate">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out of Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* Official Material Style Sign In Button */}
                <button
                  onClick={handleLogin}
                  disabled={isAuthenticating}
                  className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-slate-700 font-medium text-xs shadow-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isAuthenticating ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Error Alerts */}
        {authError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Notice</p>
              <p>{authError}</p>
            </div>
          </div>
        )}

        {chatError && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Google Chat Status</p>
              <p>{chatError}</p>
            </div>
          </div>
        )}

        {successBanner && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      {!user || !accessToken ? (
        /* Not Signed In Welcome Screen */
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Sign in to Access Google Chat</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Authenticate with your Google account with permission to view your chat spaces, send answers, and collaborate on your RAG architecture in real time.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleLogin}
              disabled={isAuthenticating}
              className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAuthenticating ? 'Authorizing with Google...' : 'Sign in with Google Workspace'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100 max-w-2xl mx-auto text-left">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" /> Space Navigation
              </div>
              <p className="text-[11px] text-slate-500">
                Browse, search, and manage all your Google Chat rooms and group conversations.
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" /> Instant Share
              </div>
              <p className="text-[11px] text-slate-500">
                Post Groq LPU speed metrics and Llama 3 answers to your team with 1 click.
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safe Confirmation
              </div>
              <p className="text-[11px] text-slate-500">
                Explicit dialog confirmations for all message posts and deletions.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Google Chat Workspace Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Spaces & Channels List (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Chat Spaces</h3>
                <span className="text-[11px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-full">
                  {spaces.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchSpaces()}
                  disabled={isLoadingSpaces}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Refresh spaces"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsCreateSpaceModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                  title="Create new Google Chat space"
                >
                  <Plus className="w-3 h-3" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Space Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            {/* Spaces List */}
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {isLoadingSpaces ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto text-indigo-600" />
                  <p>Loading spaces from Google Chat...</p>
                </div>
              ) : filteredSpaces.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 space-y-3 bg-slate-50 rounded-xl border border-slate-100">
                  <MessageSquare className="w-6 h-6 mx-auto text-slate-400" />
                  <p>No Google Chat spaces found matching your search.</p>
                  <button
                    onClick={() => setIsCreateSpaceModalOpen(true)}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    + Create your first space
                  </button>
                </div>
              ) : (
                filteredSpaces.map((space) => {
                  const isSelected = selectedSpace?.name === space.name;
                  const displayName = space.displayName || space.name.replace('spaces/', 'Space ');
                  return (
                    <button
                      key={space.name}
                      onClick={() => setSelectedSpace(space)}
                      className={`w-full text-left p-3 rounded-xl transition-all border flex items-start justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="font-semibold text-xs flex items-center gap-1.5 truncate">
                          <Hash className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="truncate">{displayName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="capitalize">{space.spaceType?.toLowerCase() || 'Space'}</span>
                          {space.spaceThreadingState && (
                            <span>&bull; {space.spaceThreadingState === 'THREADED_MESSAGES' ? 'Threaded' : 'Unthreaded'}</span>
                          )}
                        </div>
                      </div>

                      {space.spaceUri && (
                        <a
                          href={space.spaceUri}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-indigo-600 p-1 shrink-0"
                          title="Open directly in Google Chat"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Space Messages & Composer (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedSpace ? (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[580px]">
                
                {/* Space Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {selectedSpace.displayName || selectedSpace.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {selectedSpace.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setShowMembersPanel(!showMembersPanel)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        showMembersPanel
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="View Space Members"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Members</span>
                      <span className="font-mono text-[10px]">({members.length})</span>
                    </button>

                    <button
                      onClick={() => fetchMessages(selectedSpace.name)}
                      disabled={isLoadingMessages}
                      className="p-1.5 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Refresh messages"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Members Drawer Panel if toggled */}
                {showMembersPanel && (
                  <div className="bg-indigo-50/40 border-b border-indigo-100 p-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" /> Space Members ({members.length})
                      </span>
                      <button
                        onClick={() => setShowMembersPanel(false)}
                        className="text-slate-400 hover:text-slate-600 text-[11px]"
                      >
                        Close
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                      {members.map((m, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="font-medium">{m.member?.displayName || 'Member'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({m.role?.replace('ROLE_', '') || 'MEMBER'})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages Timeline */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[380px] bg-slate-50/30">
                  {isLoadingMessages ? (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
                      <p>Loading messages from Google Chat...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-medium">No messages in this space yet.</p>
                      <p className="text-slate-400 text-[11px]">
                        Compose a message below or share a RAG analysis snippet with your team!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender?.displayName === user.displayName;
                      const formattedDate = msg.createTime
                        ? new Date(msg.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';

                      return (
                        <div
                          key={msg.name}
                          className="group bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {msg.sender?.avatarUrl ? (
                                <img
                                  src={msg.sender.avatarUrl}
                                  alt={msg.sender.displayName || 'Sender'}
                                  referrerPolicy="no-referrer"
                                  className="w-5 h-5 rounded-full"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                  {msg.sender?.displayName?.charAt(0) || 'U'}
                                </div>
                              )}
                              <span className="font-bold text-xs text-slate-900">
                                {msg.sender?.displayName || 'User'}
                              </span>
                              <span className="text-[10px] text-slate-400">{formattedDate}</span>
                            </div>

                            {/* Delete Action (Mutating -> requires confirmation dialog) */}
                            <button
                              onClick={() => handleRequestDeleteMessage(msg.name, msg.text)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                              title="Delete message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Presets & RAG Integration Bar */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Quick Share to Google Chat:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={insertBenchmarkShare}
                      className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg transition-colors shadow-2xs"
                    >
                      ⚡ LPU Speed Benchmark (800 tok/s)
                    </button>
                    <button
                      type="button"
                      onClick={insertArchitectureSummary}
                      className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg transition-colors shadow-2xs"
                    >
                      🧠 Groq + Llama 3 Architecture
                    </button>
                    <button
                      type="button"
                      onClick={insertPythonSnippet}
                      className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 rounded-lg transition-colors shadow-2xs"
                    >
                      📦 Python LangChain Code
                    </button>
                    {lastRAGResult && (
                      <button
                        type="button"
                        onClick={insertLastRAGResult}
                        className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg transition-colors shadow-2xs"
                      >
                        🔍 Share Latest RAG Answer
                      </button>
                    )}
                  </div>
                </div>

                {/* Message Composer Form */}
                <form onSubmit={handleRequestSendMessage} className="p-4 bg-white border-t border-slate-200">
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={`Message #${selectedSpace.displayName || 'space'}... (supports Markdown formatting)`}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none font-sans"
                    />

                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        Sending will ask for confirmation before posting to Google Chat.
                      </div>
                      <button
                        type="submit"
                        disabled={!messageInput.trim() || isSending}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-40 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                      </button>
                    </div>
                  </div>
                </form>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-400" />
                <p className="font-semibold text-slate-700">Select a Space from the left column to view conversations.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Mandatory User Confirmation Modal for Destructive / Mutating Actions */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{confirmModal.title}</h3>
                <p className="text-xs text-slate-500">Google Chat Action Confirmation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmModal.description}
            </p>

            {confirmModal.payloadText && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto text-xs font-mono text-slate-800 whitespace-pre-wrap">
                {confirmModal.payloadText}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors ${
                  confirmModal.actionType === 'delete_message'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmModal.actionType === 'delete_message' ? 'Confirm Delete' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Space Modal */}
      {isCreateSpaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create Google Chat Space</h3>
                <p className="text-xs text-slate-500">Create a collaborative room for your team</p>
              </div>
            </div>

            <form onSubmit={handleCreateSpaceSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Space Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RAG-Architecture-Team"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                This will create a new room under your Google Workspace account with permissions to post messages and manage members.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateSpaceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSpace || !newSpaceName.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isCreatingSpace ? 'Creating...' : 'Create Space'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
