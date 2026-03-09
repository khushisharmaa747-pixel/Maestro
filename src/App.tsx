import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Library, 
  FileText, 
  Target, 
  Map, 
  MessageSquare, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  BrainCircuit,
  Zap,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Ad, Territory, IntelligenceBrief } from './types';
import { generateBrief, detectTerritories, ariaChat, scrapeCompetitorAds } from './services/gemini';
import { initialAds } from './data/mockAds';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ads, setAds] = useState<Ad[]>([]);
  const [brief, setBrief] = useState<IntelligenceBrief | null>(null);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAriaOpen, setIsAriaOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeBrand, setScrapeBrand] = useState('');

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      // Using local data for Vercel/Static compatibility
      const data = initialAds;
      setAds(data);
      
      // Initial AI analysis
      const [briefData, territoryData] = await Promise.all([
        generateBrief(data),
        detectTerritories(data)
      ]);
      setBrief(briefData);
      setTerritories(territoryData);
    } catch (error) {
      console.error("Failed to initialize ads", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    if (!process.env.GEMINI_API_KEY && !import.meta.env.VITE_GEMINI_API_KEY) {
      alert("Aria: I can't find your Gemini API Key. Please add VITE_GEMINI_API_KEY to your Vercel environment variables.");
      return;
    }
    setIsScraping(true);
    try {
      // Aria "scrapes" (searches the web) for new ads and marketing data
      const newAds = await scrapeCompetitorAds(ads, scrapeBrand);
      const updatedAds = [...newAds, ...ads];
      setAds(updatedAds);
      setScrapeBrand(''); // Clear input after success
      
      // Re-run intelligence with the new real-time data
      const [briefData, territoryData] = await Promise.all([
        generateBrief(updatedAds),
        detectTerritories(updatedAds)
      ]);
      setBrief(briefData);
      setTerritories(territoryData);
    } catch (error) {
      console.error("Scraping failed", error);
    } finally {
      setIsScraping(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const response = await ariaChat(userMsg, ads);
      setChatHistory(prev => [...prev, { role: 'aria', content: response || "I'm sorry, I couldn't process that." }]);
    } catch (error: any) {
      console.error("Aria Chat Error:", error);
      let errorMsg = "Error connecting to Aria.";
      if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("API key not valid")) {
        errorMsg = "Aria says: Your Gemini API Key seems invalid. Please check your Render environment variables.";
      } else if (!process.env.GEMINI_API_KEY && !import.meta.env.VITE_GEMINI_API_KEY) {
        errorMsg = "Aria says: I can't find your Gemini API Key. Did you add GEMINI_API_KEY to Render?";
      }
      setChatHistory(prev => [...prev, { role: 'aria', content: errorMsg }]);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6 relative">
      {/* Aurora Background for Dashboard */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[150%] h-[600px] pointer-events-none overflow-hidden opacity-20 z-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full rounded-[50%] blur-[100px] bg-conic-gradient from-[#22d3ee] via-[#a78bfa] to-[#fb923c] animate-aurora" 
             style={{ background: 'conic-gradient(from 0deg at 50% 100%, #22d3ee, #60a5fa, #a78bfa, #f0abfc, #fb923c, #fbbf24, #34d399, #22d3ee)' }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-2">Total Ads</div>
          <div className="text-4xl font-bold tracking-tight">{ads.length}</div>
          <div className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> +12% vs last week
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-2">Proven Performers</div>
          <div className="text-4xl font-bold tracking-tight">{ads.filter(a => a.proven).length}</div>
          <div className="text-xs font-bold text-black/40 mt-2">30+ days active</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-2">Avg. Longevity</div>
          <div className="text-4xl font-bold tracking-tight">
            {ads.length ? Math.round(ads.reduce((acc, a) => acc + a.days_active, 0) / ads.length) : 0}d
          </div>
          <div className="text-xs font-bold text-black/40 mt-2">Across all brands</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
          <div className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-2">Active Brands</div>
          <div className="text-4xl font-bold tracking-tight">{new Set(ads.map(a => a.brand)).size}</div>
          <div className="text-xs font-bold text-black/40 mt-2">Competitor set</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2 bg-black text-white p-10 rounded-[32px] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-20">
            <Sparkles size={160} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <BrainCircuit className="text-emerald-400" size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Aria's Weekly Intelligence</span>
            </div>
            <h2 className="text-3xl font-bold mb-8 leading-tight tracking-tight">
              {brief?.summary || "Analyzing competitor movements..."}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">Creative Patterns</h3>
                <ul className="space-y-3">
                  {brief?.patterns.map((p, i) => (
                    <li key={i} className="text-sm font-bold text-white/80 flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">Opportunities</h3>
                <ul className="space-y-3">
                  {brief?.opportunities.map((o, i) => (
                    <li key={i} className="text-sm font-bold text-white/80 flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span> {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black/30">Intelligence Engine</h3>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-black/5">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp size={18} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-black/30">Trend Detection</div>
                <div className="text-sm font-bold">Scalable Hooks Identified</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-black/5">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <AlertCircle size={18} className="text-amber-600" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-black/30">Fatigue Alert</div>
                <div className="text-sm font-bold">Mamaearth Onion Oil (62d)</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-black/5">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Zap size={18} className="text-indigo-600" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-black/30">Launch Alert</div>
                <div className="text-sm font-bold">3 New Ads from Oziva</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdLibrary = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Video', 'Static', 'Carousel'].map(f => (
            <button key={f} className="px-4 py-1.5 rounded-full border border-black/10 text-xs font-medium hover:bg-black hover:text-white transition-colors">
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={14} />
          <input 
            type="text" 
            placeholder="Search ads, hooks, brands..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-black/10 rounded-xl text-sm focus:outline-none focus:border-black/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ads.map(ad => (
          <motion.div 
            layout
            key={ad.id} 
            className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-stone-100 flex items-center justify-center relative">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/20">{ad.format} PREVIEW</span>
              {ad.proven && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Proven
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">{ad.brand}</span>
                <span className="text-[10px] font-medium text-black/30">{ad.days_active} days</span>
              </div>
              <p className="text-sm font-light leading-relaxed mb-4 line-clamp-3">{ad.copy}</p>
              
              {ad.additional_signals && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 bg-stone-50 rounded-lg border border-black/5">
                    <div className="text-[8px] font-bold uppercase text-black/30 mb-0.5">Promise</div>
                    <div className="text-[10px] font-medium truncate">{ad.additional_signals.promise_type}</div>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-lg border border-black/5">
                    <div className="text-[8px] font-bold uppercase text-black/30 mb-0.5">Persona</div>
                    <div className="text-[10px] font-medium truncate">{ad.additional_signals.audience_persona}</div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-black/5 flex flex-wrap gap-2">
                <span className="text-[9px] px-2 py-1 bg-stone-100 rounded-md uppercase font-bold text-black/50">{ad.theme}</span>
                <span className="text-[9px] px-2 py-1 bg-stone-100 rounded-md uppercase font-bold text-black/50">{ad.tone}</span>
              </div>
              {ad.summary && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-1 mb-1">
                    <BrainCircuit size={10} className="text-emerald-700" />
                    <div className="text-[9px] font-bold uppercase text-emerald-700">Aria Insight</div>
                  </div>
                  <div className="text-[11px] text-emerald-800/70 italic leading-relaxed">"{ad.summary}"</div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTerritoryMap = () => (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-light tracking-tight mb-4">Creative Territory Map</h2>
        <p className="text-black/50 font-light leading-relaxed">
          Aria clusters competitor ads into strategic territories. Identify where the market is saturated and where the "white space" exists for Mosaic brands.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {territories.map((t, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm relative group hover:border-black/20 transition-colors">
            <div className="absolute top-6 right-6 text-black/5 group-hover:text-black/10 transition-colors">
              <Map size={40} />
            </div>
            <h3 className="text-xl font-medium mb-2">{t.name}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {t.brands.map((b, bi) => (
                <span key={bi} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-black/5 rounded-full">
                  {b}
                </span>
              ))}
            </div>
            <p className="text-sm text-black/60 font-light leading-relaxed">
              {t.description}
            </p>
          </div>
        ))}

        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-200 border-dashed flex flex-col justify-center">
          <div className="flex items-center gap-2 text-emerald-700 mb-2">
            <Sparkles size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Open Territory Detected</span>
          </div>
          <h3 className="text-xl font-medium text-emerald-900 mb-2">Men's Hair Science Video</h3>
          <p className="text-sm text-emerald-800/60 font-light leading-relaxed mb-6">
            No competitor is currently running clinical-tone video ads for men's hair loss. The entire category is dominated by lifestyle imagery.
          </p>
          <button className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors">
            Generate Campaign Brief
          </button>
        </div>
      </div>
    </div>
  );

  const renderAriaChat = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xs mx-auto">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-6">
              <BrainCircuit size={32} />
            </div>
            <h3 className="text-lg font-medium mb-2">I'm Aria</h3>
            <p className="text-sm text-black/40 font-light">
              Your AI growth strategist. Ask me to analyze hooks, detect patterns, or generate campaign ideas.
            </p>
          </div>
        )}
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-tr-none' 
                : 'bg-stone-100 text-black rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleChat} className="p-4 border-t border-black/5">
        <div className="relative">
          <input 
            type="text" 
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Ask Aria anything..." 
            className="w-full pl-4 pr-12 py-3 bg-stone-100 border-none rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black/10"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-lg hover:opacity-80 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );

  const renderAboutMe = () => (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-black text-white p-12 rounded-[40px] relative overflow-hidden shadow-2xl">
        <div className="absolute bottom-0 left-0 right-0 h-full pointer-events-none overflow-hidden opacity-10">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full rounded-[50%] blur-[100px] bg-conic-gradient from-[#22d3ee] via-[#a78bfa] to-[#fb923c] animate-aurora" 
               style={{ background: 'conic-gradient(from 0deg at 50% 100%, #22d3ee, #60a5fa, #a78bfa, #f0abfc, #fb923c, #fbbf24, #34d399, #22d3ee)' }} />
        </div>
        <div className="relative z-10">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6">Mosaic Wellness Fellowship 2026 Applicant</div>
          <h1 className="text-6xl font-bold tracking-tighter mb-10 leading-[0.9]">Khushi<br />Sharma.</h1>
          <div className="space-y-6 text-xl font-bold text-white/90 leading-relaxed tracking-tight">
            <p>Hi, I am Khushi Sharma and I aspire to be a part of the Mosaic Wellness 2026 Fellowship. I am deeply curious about how ideas turn into meaningful products and how technology, data, and marketing can work together to solve real consumer problems.</p>
            <p>What inspires me about Mosaic is the way it builds brands that genuinely improve people’s lives. Products from brands like BeBodywise, Man Matters, and Little Joys focus on solving everyday wellness challenges in a thoughtful and consumer focused way. Being part of an organization that combines innovation, consumer understanding, and strong execution is incredibly exciting to me.</p>
            <p>I see myself as a lifelong learner. I enjoy exploring new tools, understanding how businesses grow, and continuously challenging myself to build and learn more. Whether it is analyzing data, understanding consumer behavior, or creating new solutions, I am motivated by the process of learning through building.</p>
            <p>I hope to contribute to Mosaic by bringing curiosity, initiative, and a genuine desire to grow while working on ideas that create real impact. For me, the fellowship represents an opportunity to learn from talented people, contribute meaningfully, and keep evolving as a builder and problem solver.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-black/5 shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-6">About Maestro</div>
        <div className="space-y-4 text-lg font-bold text-black/80 leading-relaxed tracking-tight">
          <p>The name Maestro reflects the core idea: a maestro conducts many instruments into one coordinated performance. This system brings together scattered advertising signals from competitor brands and organises them into intelligence Mosaic's marketing team can act on.</p>
          <p>Maestro scrapes the Meta Ad Library, uses AI to tag every ad by theme, tone, hook type, and longevity signal, surfaces proven performers automatically, identifies creative gaps competitors are ignoring, and writes a weekly brief specific enough for strategic decision support.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F5F0E8] text-[#0A0A0A] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-black/5 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-black" size={24} fill="currentColor" />
            <h1 className="text-2xl font-bold tracking-tighter">Maestro</h1>
          </div>
          <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">Intelligence Layer</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('adlibrary')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'adlibrary' ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5'}`}
          >
            <Library size={18} /> Ad Library
          </button>
          <button 
            onClick={() => setActiveTab('territory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'territory' ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5'}`}
          >
            <Map size={18} /> Territory Map
          </button>
          <button 
            onClick={() => setActiveTab('brief')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'brief' ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5'}`}
          >
            <FileText size={18} /> Weekly Brief
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'about' ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5'}`}
          >
            <User size={18} /> About Me
          </button>
        </nav>

        <div className="p-6">
          <button 
            onClick={() => setIsAriaOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-colors"
          >
            <Sparkles size={14} /> Talk to Aria
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-bottom border-black/5 flex items-center justify-between px-10 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black/30">
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace(/([A-Z])/g, ' $1').trim()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="Enter brand to scrape..."
                value={scrapeBrand}
                onChange={(e) => setScrapeBrand(e.target.value)}
                className="bg-black/5 border border-black/5 rounded-full px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-black/10 w-48 transition-all"
              />
              <Search size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20" />
            </div>
            <button 
              onClick={handleScrape}
              disabled={isScraping}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-full border transition-all shadow-sm ${
                isScraping 
                  ? 'bg-stone-100 text-black/30 border-black/5' 
                  : 'bg-black text-white border-black hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <RefreshCw size={14} className={isScraping ? 'animate-spin' : ''} />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-0.5">Aria Engine</span>
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {isScraping ? 'Searching Web & Ad Libraries...' : 'Scrape Real-Time Ads'}
                </span>
              </div>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full border border-black/5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider">Aria Agent Active</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'adlibrary' && renderAdLibrary()}
              {activeTab === 'territory' && renderTerritoryMap()}
              {activeTab === 'about' && renderAboutMe()}
              {activeTab === 'brief' && (
                <div className="max-w-3xl mx-auto bg-white p-12 rounded-[40px] border border-black/5 shadow-sm">
                  <div className="text-xs font-bold text-black/30 uppercase tracking-[0.2em] mb-8">Weekly Intelligence Brief</div>
                  <div className="prose prose-stone max-w-none">
                    <h1 className="text-4xl font-light mb-8 leading-tight">{brief?.summary}</h1>
                    <div className="space-y-8">
                      <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">Major Patterns</h3>
                        <ul className="space-y-3">
                          {brief?.patterns.map((p, i) => <li key={i} className="text-lg font-light text-black/70 leading-relaxed">{p}</li>)}
                        </ul>
                      </section>
                      <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">Emerging Themes</h3>
                        <ul className="space-y-3">
                          {brief?.emerging_themes?.map((t, i) => <li key={i} className="text-lg font-light text-black/70 leading-relaxed">{t}</li>)}
                        </ul>
                      </section>
                      <section>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">Opportunities</h3>
                        <ul className="space-y-3">
                          {brief?.opportunities.map((o, i) => <li key={i} className="text-lg font-light text-black/70 leading-relaxed">{o}</li>)}
                        </ul>
                      </section>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Aria Sidebar */}
      <AnimatePresence>
        {isAriaOpen && (
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-black/5 z-50 flex flex-col"
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Aria</h3>
                  <p className="text-[10px] text-black/30 uppercase font-bold tracking-widest">Growth Strategist</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAriaOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderAriaChat()}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
