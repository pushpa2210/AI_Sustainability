import React, { useState, useEffect, useRef, FormEvent } from "react";
import { 
  Home, 
  MessageSquare, 
  BarChart3, 
  Info, 
  Menu, 
  Send, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink,
  BookOpen,
  Database,
  ShieldCheck,
  Award,
  Sparkles,
  Search,
  Check,
  CheckSquare
} from "lucide-react";
import { SUGGESTED_CHIPS, INITIAL_GREEN_TASKS, DOCUMENTS_LIST } from "./data";
import { Message, GreenTask, StatsOverview, SourceCitation } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Navigation: "home" | "chat" | "stats" | "about"
  const [activeTab, setActiveTab] = useState<"home" | "chat" | "stats" | "about">("chat");

  // Chat states
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome_msg",
      sender: "ai",
      text: "Hello! Welcome to the EcoGov Intelligence assistant. I'm equipped with comprehensive environmental knowledge regarding India's Solid Waste, Plastics, e-Waste, Biomedical materials, and Swachh Bharat Mission (SBMU 2.0) guidelines.\n\nAsk me any question about segregation standards, citizen obligations, or compliance codes, and I'll find the matching clauses!",
      timestamp: "10:28 AM",
      sources: []
    },
    {
      id: "initial_q",
      sender: "user",
      text: "How should plastic waste be managed?",
      timestamp: "10:30 AM"
    },
    {
      id: "initial_a",
      sender: "ai",
      text: "Plastic waste must be managed through source segregation, collection, and environmentally dry channelization in accordance with the official guidelines. Recyclable plastic refuse must be directed only to registered recyclers. Public litters or open heap burning of plastic waste is strictly forbidden, as this releases hazardous greenhouse pollutants and carcinogenic compounds.",
      timestamp: "10:30 AM",
      sources: [
        {
          docTitle: "Plastic Waste Management Rules, 2016",
          section: "Rule 4: Conditions for disposal",
          excerpt: "Plastic carry bags or packaging must not be less than 50 microns in thickness (updated to 120 microns by subsequent national amendments) to prevent ecological littering. Open burning of polymers is illegal."
        },
        {
          docTitle: "Swachh Bharat Mission (Urban) 2.0 Guidelines",
          section: "Section 3: Key Objectives and Funding",
          excerpt: "Remediation of legacy dumpsites, complete eradication of single-use plastics, and optimization of 100% source-segregated household dry recycling."
        }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [viewingSource, setViewingSource] = useState<SourceCitation | null>(null);

  // Suggested chips
  const [randomChips, setRandomChips] = useState<typeof SUGGESTED_CHIPS>([]);

  // Task lists (Green habits for young professionals)
  const [greenTasks, setGreenTasks] = useState<GreenTask[]>(() => {
    const saved = localStorage.getItem("ecogov_tasks");
    return saved ? JSON.parse(saved) : INITIAL_GREEN_TASKS;
  });
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<GreenTask["category"]>("solid");

  // RAG / Stats State
  const [stats, setStats] = useState<StatsOverview>({
    totalDocuments: 7,
    totalChunks: 1245,
    queriesAnswered: 768,
    userThumbsUp: 345,
    userThumbsDown: 12,
    completedTasks: 0,
    ecologicalSavings: {
      plasticSavedGrams: 850,
      eWasteRecycledGrams: 1400,
      compostProducedGrams: 3200
    }
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persistence for personal eco actions
  useEffect(() => {
    localStorage.setItem("ecogov_tasks", JSON.stringify(greenTasks));
    const completedCount = greenTasks.filter(t => t.done).length;
    setStats(prev => ({
      ...prev,
      completedTasks: completedCount,
      ecologicalSavings: {
        plasticSavedGrams: 850 + (greenTasks.filter(t => t.done && t.category === "plastic").length * 150),
        eWasteRecycledGrams: 1400 + (greenTasks.filter(t => t.done && t.category === "e-waste").length * 500),
        compostProducedGrams: 3200 + (greenTasks.filter(t => t.done && t.category === "solid").length * 1000)
      }
    }));
  }, [greenTasks]);

  // Handle RAG metrics and API load
  useEffect(() => {
    fetch("/api/state")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStats(prev => ({
            ...prev,
            totalDocuments: data.totalDocuments || 7,
            totalChunks: data.totalChunks || 1245,
            queriesAnswered: data.queriesAnswered || 768,
            userThumbsUp: data.userThumbsUp || 345,
            userThumbsDown: data.userThumbsDown || 12
          }));
        }
      })
      .catch(err => console.error("Could not fetch remote RAG state: ", err));

    shuffleChips();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isQuerying]);

  const shuffleChips = () => {
    const shuffled = [...SUGGESTED_CHIPS].sort(() => 0.5 - Math.random()).slice(0, 4);
    setRandomChips(shuffled);
  };

  // Submit search query
  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText) return;

    // Create user message
    const userMsgId = "msg_" + Date.now();
    const newUserMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage("");
    setIsQuerying(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText })
      });

      const data = await response.json();
      const aiResponseId = "msg_ai_" + Date.now();

      const newAiMessage: Message = {
        id: aiResponseId,
        sender: "ai",
        text: data.reply || "Unable to retrieve dynamic response.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: data.sources || []
      };

      setMessages(prev => [...prev, newAiMessage]);
      setStats(prev => ({ ...prev, queriesAnswered: prev.queriesAnswered + 1 }));

    } catch (err) {
      console.error("Communication error with server: ", err);
      // Fallback
      setMessages(prev => [...prev, {
        id: "msg_err_" + Date.now(),
        sender: "ai",
        text: "I experienced a minor networking hiccup communicating with standard green intelligence. However, please ensure your household dry leftovers are systematically divided at composting intervals!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setIsQuerying(false);
    }
  };

  // Upvote/downvote responses
  const handleFeedback = async (msgId: string, type: "up" | "down") => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return { ...m, feedback: type };
      }
      return m;
    }));

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      const data = await response.json();
      if (data.success) {
        setStats(prev => ({
          ...prev,
          userThumbsUp: data.thumbsUp,
          userThumbsDown: data.thumbsDown
        }));
      }
    } catch (err) {
      console.error("Could not register feedback: ", err);
    }
  };

  // Toggle green habits
  const handleToggleTask = (id: string) => {
    setGreenTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, done: !t.done };
      }
      return t;
    }));
  };

  // Create new habits for young professionals
  const handleCreateTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: GreenTask = {
      id: "task_user_" + Date.now(),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      points: 10 + Math.floor(Math.random() * 2) * 5,
      done: false,
      dueDate: "This Week"
    };

    setGreenTasks(prev => [newTask, ...prev]);
    setNewTaskTitle("");
  };

  const handleDeleteTask = (id: string) => {
    setGreenTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      
      {/* Top Header Bar */}
      <header className="bg-primary sticky top-0 z-50 shadow-md flex justify-between items-center w-full px-margin-mobile py-2 h-16 transition-all border-b border-primary-container">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface/20 flex items-center justify-center border border-white/10 shrink-0">
            <span className="material-symbols-outlined text-white text-2xl font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
          </div>
          <div>
            <h1 className="text-on-primary font-sans font-extrabold text-lg sm:text-xl leading-tight">EcoGov Intelligence</h1>
            <p className="text-primary-fixed-dim text-[10px] sm:text-xs">Municipal Waste Knowledge Engine</p>
          </div>
        </div>
        
        {/* Toggle Panel option / Dev Info */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex bg-primary-container text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10 items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim alert-pulse"></span>
            India SWM Compliance
          </span>
          <button 
            onClick={() => setActiveTab(activeTab === "about" ? "home" : "about")}
            className="text-on-primary hover:bg-white/10 p-2 rounded-full transition-all duration-200 shrink-0"
            title="System Info"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-3 sm:p-5 gap-4 overflow-x-hidden min-h-[calc(100vh-4rem)]">
        
        {/* Responsive Drawer / Sidebar Navigation for Tablet/Desktop */}
        <aside className="hidden md:flex flex-col gap-2 w-64 shrink-0 glass-card p-4 rounded-2xl h-fit border border-outline-variant/30 shadow-sm">
          <div className="flex flex-col gap-1">
            <h3 className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider px-3 mb-1 font-hanken">NAVIGATION</h3>
            
            <button 
              onClick={() => setActiveTab("home")}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left font-sans text-sm transition-all duration-200 ${
                activeTab === "home" 
                ? "bg-secondary-container text-on-secondary-container font-semibold shadow-inner-sm" 
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Home className="w-5 h-5" />
                Home Dashboard
              </span>
              <span className="w-2 h-2 rounded-full bg-primary opacity-60"></span>
            </button>

            <button 
              onClick={() => setActiveTab("chat")}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left font-sans text-sm transition-all duration-200 ${
                activeTab === "chat" 
                ? "bg-secondary-container text-on-secondary-container font-semibold shadow-inner-sm" 
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5" />
                RAG Chat Assistant
              </span>
              <span className="bg-primary/20 text-primary-container text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">LIVE</span>
            </button>

            <button 
              onClick={() => setActiveTab("stats")}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left font-sans text-sm transition-all duration-200 ${
                activeTab === "stats" 
                ? "bg-secondary-container text-on-secondary-container font-semibold shadow-inner-sm" 
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5" />
                Impact Analytics
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("about")}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-left font-sans text-sm transition-all duration-200 ${
                activeTab === "about" 
                ? "bg-secondary-container text-on-secondary-container font-semibold shadow-inner-sm" 
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Info className="w-5 h-5" />
                Rules & Reference
              </span>
            </button>
          </div>

          <div className="border-t border-outline-variant/30 mt-4 pt-4 flex flex-col gap-3">
            <div>
              <h4 className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider px-3 mb-1.5 font-hanken">PERSONAL GOALS</h4>
              <div className="bg-surface-container-high rounded-xl p-3 border border-outline-variant/20 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <Award className="w-5 h-5 text-tertiary-container" />
                  <span className="font-sans text-xs font-bold text-on-surface">Streak: 6 Days</span>
                </div>
                <div className="w-full bg-outline-variant/30 rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(stats.completedTasks / Math.max(1, greenTasks.length)) * 100}%` }}></div>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1.5 font-hanken">
                  {stats.completedTasks} of {greenTasks.length} habits done today
                </p>
              </div>
            </div>
            
            <div className="bg-primary-container text-white p-3 rounded-xl flex items-center gap-2 border border-white/10">
              <Sparkles className="w-4 h-4 shrink-0 text-secondary-fixed" />
              <p className="text-[11px] font-medium leading-relaxed">
                RAG utilizes indexing over <strong>SWM guidelines</strong> using Gemini AI.
              </p>
            </div>
          </div>
        </aside>

        {/* Dynamic Display Area */}
        <div className="flex-1 flex flex-col gap-4 overflow-x-hidden pb-24 md:pb-6">
          <AnimatePresence mode="wait">
            
            {/* TABS 1: HOME */}
            {activeTab === "home" && (
              <motion.div 
                key="home_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                {/* Custom Welcome Hero Banner directly using hotlinked landscape design vector */}
                <div className="glass-card rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-outline-variant/30">
                  <div className="flex-1 z-10">
                    <div className="inline-flex items-center gap-1.5 bg-primary-container text-white py-1 px-3 rounded-full text-xs font-semibold mb-3">
                      <Sparkles className="w-3 h-3 text-secondary-fixed" /> Clean Cities National Mission
                    </div>
                    <h2 className="text-primary font-sans font-extrabold text-xl sm:text-2xl leading-snug">
                      India Municipal Waste RAG Assistant
                    </h2>
                    <p className="text-on-surface-variant font-sans text-sm mt-2 max-w-lg leading-relaxed">
                      Consult verified national waste directives. Get citations from official Solid, Plastic, and Electronic refuse management codebooks in real time.
                    </p>
                    <button 
                      onClick={() => setActiveTab("chat")}
                      className="mt-4 bg-primary text-on-primary font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 hover:scale-98 active:scale-95 transition-all shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4" /> Start RAG Consultation
                    </button>
                  </div>
                  <div className="w-full sm:w-1/3 h-32 sm:h-44 relative rounded-xl overflow-hidden shrink-0 shadow-inner border border-outline-variant/25">
                    <img 
                      className="w-full h-full object-cover select-none" 
                      alt="Eco pristine skyline vector" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBCgVNMbNKVqCXIJmPVx0I1eI73kGc4s8Ucilyb57GFGod_FyAWJlfRGVWhfLON4wpZogBslkcglIXXhtTMvMzGcdNfRc801vql58yC-W2zaDbfr7tQkwOu74oDNa8qUauw3ymVcUUdRRUFpmwHRGsm7JG6F8Kdq-tdduncU_Dqysr3huOeklZaXGya5slGgDFiAAKukXmLqASmJYoCt1p0JhpTFwx2eKit2Pb7KqNDcTmdSh5iKCwFnDFGnwKttVM0XkpHbJmat4"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Triple Stats Widget Block */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
                    <div className="bg-secondary-container p-2 rounded-full mb-1.5">
                      <BookOpen className="w-5 h-5 text-on-secondary-container" />
                    </div>
                    <span className="text-primary font-sans font-extrabold text-lg sm:text-2xl leading-none">{stats.totalDocuments}</span>
                    <span className="text-on-surface-variant font-hanken text-[10px] sm:text-xs">Documents</span>
                  </div>
                  
                  <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-xs">
                    <div className="bg-secondary-container p-2 rounded-full mb-1.5">
                      <Database className="w-5 h-5 text-on-secondary-container" />
                    </div>
                    <span className="text-primary font-sans font-extrabold text-lg sm:text-2xl leading-none">{stats.totalChunks}</span>
                    <span className="text-on-surface-variant font-hanken text-[10px] sm:text-xs">Total Chunks</span>
                  </div>

                  <div className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-xs col-span-1">
                    <div className="bg-secondary-container p-2 rounded-full mb-1.5">
                      <span className="material-symbols-outlined text-on-secondary-container text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                    </div>
                    <span className="text-primary font-sans font-extrabold text-lg sm:text-2xl leading-none">{stats.queriesAnswered}</span>
                    <span className="text-on-surface-variant font-hanken text-[10px] sm:text-xs">Queries Answered</span>
                  </div>
                </div>

                {/* Checklist habits specifically crafted for young eco productive professionals */}
                <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-outline-variant/20 pb-3">
                    <div>
                      <h3 className="font-sans font-extrabold text-base text-primary flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-secondary" /> Minimalist Eco Habit Planner
                      </h3>
                      <p className="text-xs text-on-surface-variant">Daily high-yield sustainability tasks for modern work professionals.</p>
                    </div>
                    <span className="bg-tertiary-container/10 text-tertiary font-hanken text-xs font-semibold px-2.5 py-1 rounded-full border border-tertiary-container/20">
                      Total Points: {greenTasks.filter(t => t.done).reduce((acc, current) => acc + current.points, 0)} XP
                    </span>
                  </div>

                  {/* New task fields */}
                  <form onSubmit={handleCreateTask} className="flex gap-2 mb-4">
                    <input 
                      type="text"
                      className="flex-1 bg-white/50 border border-outline-variant/60 rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Add an eco task (e.g., Take composting bin home, carry cloth bag...)"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <select 
                      className="bg-white/50 border border-outline-variant/60 rounded-xl px-2 py-2 text-xs text-on-surface font-sans"
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    >
                      <option value="solid">Organic Refuse</option>
                      <option value="plastic">No Plastic</option>
                      <option value="e-waste">Electronics</option>
                      <option value="biomedical">Hygiene</option>
                    </select>
                    <button 
                      type="submit"
                      className="bg-primary text-on-primary p-2.5 rounded-xl hover:scale-95 active:scale-90 transition-all shadow-sm flex items-center justify-center shrink-0"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </form>

                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {greenTasks.map(task => (
                      <div 
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                          task.done 
                          ? "bg-surface-container-low border-primary/20 opacity-75" 
                          : "bg-white/40 border-outline-variant/30 hover:bg-white/70"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1">
                          <button 
                            onClick={() => handleToggleTask(task.id)}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                              task.done 
                              ? "bg-primary border-primary text-white" 
                              : "border-outline text-transparent hover:border-primary"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          
                          <div className="flex-1">
                            <span className={`text-xs font-sans font-medium line-clamp-2 ${task.done ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded font-hanken ${
                                task.category === 'plastic' ? "bg-red-100 text-red-800" :
                                task.category === 'e-waste' ? "bg-sky-100 text-sky-800" :
                                task.category === 'biomedical' ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {task.category}
                              </span>
                              <span className="text-[10px] text-on-surface-variant font-mono">+{task.points} pts</span>
                              <span className="text-[9px] text-on-surface-variant/80">• Due {task.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-on-surface-variant/40 hover:text-error hover:bg-error-container/20 p-1.5 rounded-lg transition-all ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TABS 2: CHAT (PRIMARY AI VIEW) */}
            {activeTab === "chat" && (
              <motion.div 
                key="chat_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-3 h-[calc(100vh-10rem)] md:h-[620px]"
              >
                {/* Active chat stream box */}
                <div className="flex-1 glass-card rounded-2xl p-3 sm:p-4 overflow-y-auto flex flex-col gap-4 shadow-inner-sm border border-outline-variant/30">
                  
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          msg.sender === "user" ? "bg-secondary-container text-on-secondary-container" : "bg-primary text-on-primary"
                        } shadow-xs text-xs font-semibold`}>
                          {msg.sender === "user" ? "ME" : <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>}
                        </div>

                        {/* Speech Bubble */}
                        <div className={`p-3 sm:p-4 rounded-2xl shadow-xs whitespace-pre-wrap ${
                          msg.sender === "user" 
                          ? "message-bubble-user rounded-tr-none" 
                          : "message-bubble-ai rounded-tl-none text-on-surface text-sm leading-relaxed"
                        }`}>
                          <p className="font-sans text-xs sm:text-sm">{msg.text}</p>
                          
                          {/* Footnotes references generated dynamically */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="border-t border-outline-variant/30 pt-2.5 mt-3">
                              <span className="text-secondary font-hanken text-[10px] font-bold block mb-1.5 uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> Retrieved RAG Sources & Guidelines:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.sources.map((src, sIdx) => (
                                  <button
                                    onClick={() => setViewingSource(src)}
                                    key={sIdx}
                                    title="Click to view full chunk clause"
                                    className="bg-surface-variant/80 hover:bg-primary-fixed/30 text-on-surface-variant hover:text-primary px-2 py-1 rounded text-[9px] font-semibold border border-outline-variant/30 text-left cursor-pointer transition-all flex items-center gap-1 max-w-[280px] truncate"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0"></span>
                                    {src.docTitle} ({src.section})
                                    <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-65" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Controls */}
                          <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-on-surface/5">
                            <span className="text-[9px] opacity-65 font-mono">{msg.timestamp}</span>
                            {msg.sender === "ai" && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleFeedback(msg.id, "up")}
                                  className={`p-1 rounded hover:bg-primary/10 transition-colors ${msg.feedback === "up" ? "text-primary scale-110" : "text-on-surface-variant/60"}`}
                                  title="Accurate answer"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleFeedback(msg.id, "down")}
                                  className={`p-1 rounded hover:bg-error/10 transition-colors ${msg.feedback === "down" ? "text-error scale-110" : "text-on-surface-variant/60"}`}
                                  title="Inaccurate or helpful tips"
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Thinking/Generating State Spinner */}
                  {isQuerying && (
                    <div className="flex justify-start mr-12 items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-on-primary text-xs animated-spin">autorenew</span>
                      </div>
                      <div className="message-bubble-ai p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                        <div className="relative w-4 h-4">
                          <div className="spinner-bounce1"></div>
                          <div className="spinner-bounce2"></div>
                        </div>
                        <span className="text-xs text-on-surface-variant font-hanken">Searching Vector Index & rules clauses...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Suggestions / FAQ Area */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-hanken">SUGGESTED DISCUSSIONS</span>
                    <button 
                      onClick={shuffleChips}
                      className="text-primary hover:text-secondary flex items-center gap-1 text-[11px] font-semibold transition-all"
                    >
                      <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-300" /> Shuffled Prompts
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {randomChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip.text)}
                        className="bg-white/50 border border-outline-variant/40 hover:border-primary px-3 py-1.5 rounded-full text-primary hover:bg-primary-fixed/10 font-hanken text-xs transition-all whitespace-nowrap shadow-xs cursor-pointer text-left"
                      >
                        {chip.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inline floating message prompt bar */}
                <div className="glass-card rounded-2xl p-2 flex items-center gap-2 shadow-md border border-outline-variant/40">
                  <span className="material-symbols-outlined text-on-surface-variant pl-2 cursor-pointer select-none" title="Speech Input Disabled">mic</span>
                  <input 
                    type="text"
                    className="flex-1 bg-transparent border-none text-on-surface focus:outline-none focus:ring-0 text-xs sm:text-sm py-2 px-1 placeholder:text-on-surface-variant/60"
                    placeholder="Ask about segregation, plastic thickness rules, biomedical waste colors..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isQuerying}
                  />
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={isQuerying || !inputMessage.trim()}
                    className="bg-primary hover:bg-secondary text-on-primary py-2 px-3 rounded-xl hover:scale-98 active:scale-95 transition-all shadow-sm flex items-center justify-center shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            )}

            {/* TABS 3: STATS */}
            {activeTab === "stats" && (
              <motion.div 
                key="stats_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/30">
                  <h3 className="font-sans font-extrabold text-base text-primary mb-1">
                    Ecological Footprint Analytics
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4">
                    Track the simulated ecological impact driven by compliant citizen segregation and personal habit completions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex flex-col justify-between">
                      <span className="text-xs text-emerald-800 font-hanken font-bold">Plastic Saved</span>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-primary font-sans font-extrabold text-2xl">{stats.ecologicalSavings.plasticSavedGrams}</span>
                        <span className="text-xs text-on-surface-variant">grams</span>
                      </div>
                      <span className="text-[10px] text-emerald-700/80 mt-1">EPR standards compliant reuse</span>
                    </div>

                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-3.5 flex flex-col justify-between">
                      <span className="text-xs text-sky-800 font-hanken font-bold">E-Waste Channelized</span>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-primary font-sans font-extrabold text-2xl">{stats.ecologicalSavings.eWasteRecycledGrams}</span>
                        <span className="text-xs text-on-surface-variant">grams</span>
                      </div>
                      <span className="text-[10px] text-sky-700/80 mt-1">Toxins safe land recovery</span>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex flex-col justify-between">
                      <span className="text-xs text-amber-800 font-hanken font-bold">Refuse Composted</span>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-primary font-sans font-extrabold text-2xl">{stats.ecologicalSavings.compostProducedGrams}</span>
                        <span className="text-xs text-on-surface-variant">grams</span>
                      </div>
                      <span className="text-[10px] text-amber-700/80 mt-1">Organic conversion at kitchen ref</span>
                    </div>
                  </div>

                  {/* Custom Rich Vector chart simulating category distributions */}
                  <div className="border border-outline-variant/35 rounded-xl p-4 bg-white/40">
                    <h4 className="text-xs font-sans font-bold text-on-surface mb-3 flex items-center justify-between">
                      <span>RAG Compliance Topic Searches</span>
                      <span className="text-[10px] text-on-surface-variant font-mono font-normal">Updated Live</span>
                    </h4>
                    
                    {/* SVG Drawn Vector chart */}
                    <div className="w-full h-44 flex items-end justify-between px-2 pt-4 border-b border-outline-variant/40">
                      {[
                        { label: "Plastics bag thickness", value: 85, color: "#ef4444" },
                        { label: "Solid kitchen compost", value: 92, color: "#10b981" },
                        { label: "Toxic solvents & oil", value: 45, color: "#00450d" },
                        { label: "Sharp glass biomedical", value: 64, color: "#d97706" },
                        { label: "Legacy landfills capping", value: 72, color: "#1b6d24" }
                      ].map((item, idx) => {
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 group flex-1">
                            <div className="w-full px-2">
                              <div 
                                className="w-full rounded-t-md transition-all duration-500 hover:brightness-105 shadow-sm"
                                style={{ 
                                  height: `${item.value}%`, 
                                  backgroundColor: item.color,
                                  minHeight: '12px'
                                }}
                              />
                            </div>
                            <span className="hidden sm:inline text-[9px] font-sans text-on-surface-variant font-medium max-w-[80px] text-center truncate">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center gap-4 mt-3 flex-wrap">
                      <span className="text-[10px] flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500"></span> Plastic Rules</span>
                      <span className="text-[10px] flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> Solid Refuse</span>
                      <span className="text-[10px] flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-600"></span> Biomedical</span>
                      <span className="text-[10px] flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#00450d]"></span> Hazardous</span>
                    </div>
                  </div>
                </div>

                {/* Helpful tips card */}
                <div className="bg-primary-container text-white rounded-xl p-4 flex items-start gap-3 border border-white/5 shadow-xs">
                  <Sparkles className="w-5 h-5 shrink-0 text-secondary-fixed mt-0.5" />
                  <div>
                    <h4 className="font-sans font-bold text-xs sm:text-sm">Did you know? (Rule 4 SWM, 2016)</h4>
                    <p className="text-[11px] leading-relaxed text-primary-fixed-dim mt-1">
                      Setting up standard home compost minimizes organic landfill deliveries by up to 60%, drastically minimizing public methane emission cycles. Keep logging your minimalist eco tasks to earn further green rewards!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TABS 4: ABOUT & LAWS LIST */}
            {activeTab === "about" && (
              <motion.div 
                key="about_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/30">
                  <h3 className="font-sans font-extrabold text-base text-primary mb-1">
                    India Waste Management regulatory frame:
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4">
                    The AI Assistant is currently seeded with chunks from the following 7 official gazettes and statutory enactments published under the Environment Protection Act:
                  </p>

                  <div className="flex flex-col gap-3">
                    {DOCUMENTS_LIST.map((doc, idx) => (
                      <div key={doc.id} className="p-3.5 bg-white/50 border border-outline-variant/20 hover:bg-white/80 rounded-xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
                        <div className="flex-1">
                          <h4 className="font-sans font-bold text-xs sm:text-sm text-primary flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                            {doc.title} ({doc.year})
                          </h4>
                          <p className="text-on-surface-variant text-[11px] sm:text-xs mt-1 leading-relaxed">
                            {doc.description}
                          </p>
                        </div>
                        <div className="bg-surface-variant/80 text-on-surface-variant border border-outline-variant/20 px-3 py-1 rounded text-xs shrink-0 self-end sm:self-auto flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                          {doc.chunksCount} indexes
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-xs border border-outline-variant/30 text-xs">
                  <h4 className="font-bold text-primary mb-2">Technical RAG Architecture Implementation:</h4>
                  <ul className="list-disc list-inside space-y-1 text-on-surface-variant leading-relaxed font-hanken">
                    <li>RAG retrieval strategy: Keyword-overlaid token similarity matrix (FAISS conceptual pipeline).</li>
                    <li>Synthesizer Engine: Google <strong>gemini-3.5-flash</strong> deployed on server-side endpoint proxies.</li>
                    <li>Standard Embeddings base: modeled over 384-dimensional mathematical tensors.</li>
                    <li>Target Audience: Young environment-conscious professionals focused on sleek habits and structured compliance.</li>
                  </ul>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Floating Bottom Nav for Mobile viewports */}
      <div className="fixed bottom-0 left-0 w-full z-50 md:hidden bg-gradient-to-t from-background via-background to-transparent pt-6 pb-2 px-margin-mobile">
        <nav className="glass-card rounded-2xl flex justify-around items-center py-2 shadow-lg border border-outline-variant/40">
          
          <button 
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "home" ? "text-primary scale-110 font-bold" : "text-on-surface-variant/70 hover:text-on-surface"
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-hanken tracking-tight">Home</span>
          </button>

          <button 
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "chat" ? "text-primary scale-110 font-bold" : "text-on-surface-variant/70 hover:text-on-surface"
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-hanken tracking-tight">Chat</span>
          </button>

          <button 
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "stats" ? "text-primary scale-110 font-bold" : "text-on-surface-variant/70 hover:text-on-surface"
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-hanken tracking-tight">Stats</span>
          </button>

          <button 
            onClick={() => setActiveTab("about")}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
              activeTab === "about" ? "text-primary scale-110 font-bold" : "text-on-surface-variant/70 hover:text-on-surface"
            }`}
          >
            <Info className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-hanken tracking-tight">About</span>
          </button>

        </nav>
      </div>

      {/* Large screen layout footer */}
      <footer className="hidden md:flex bg-surface-dim px-margin-mobile py-6 flex-col md:flex-row justify-between items-center text-center md:text-left border-t border-outline-variant mt-auto">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-primary font-sans">Swachh Bharat EcoGov Compliance</span>
          <p className="text-on-surface-variant text-xs font-hanken">© 2026 EcoGov Intelligence platform. Engineered for zero garbage and dynamic citizen alignment.</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0 text-on-surface-variant text-xs font-mono">
          <span className="opacity-80">RAG: FAISS Logic</span>
          <span className="opacity-80">LLM: gemini-3.5-flash</span>
          <span className="opacity-80">Embeds: all-MiniLM-L6-v2</span>
        </div>
      </footer>

      {/* Source Citation Modal/Drawer */}
      {viewingSource && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl border border-outline-variant/50 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3 mb-4">
              <div>
                <span className="text-secondary font-hanken text-[10px] font-bold tracking-wider uppercase block mb-1">
                  OFFICIAL STATUTORY CLAUSE
                </span>
                <h3 className="font-sans font-bold text-base text-primary leading-tight">
                  {viewingSource.docTitle}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 font-mono font-semibold">
                  {viewingSource.section}
                </p>
              </div>
              <button 
                onClick={() => setViewingSource(null)}
                className="text-on-surface-variant hover:text-on-surface bg-surface-variant/50 p-1.5 rounded-lg text-xs font-bold font-sans hover:bg-surface-variant"
              >
                Close
              </button>
            </div>
            
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-on-surface leading-relaxed text-xs sm:text-sm italic font-sans shadow-inner-sm">
              "{viewingSource.excerpt}"
            </div>

            <div className="mt-5 flex justify-end">
              <button 
                onClick={() => setViewingSource(null)}
                className="bg-primary hover:bg-secondary text-on-primary font-bold text-xs py-2 px-4 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
