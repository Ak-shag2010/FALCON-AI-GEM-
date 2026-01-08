
import React, { useState } from 'react';
import { geminiService } from './services/geminiService';
import { AnalysisStatus, FactCheckResult } from './types';
import AnalysisView from './components/AnalysisView';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [isFetching, setIsFetching] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractTextFromHtml = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove scripts, styles, navs, footers to get cleaner text
    const selectorsToRemove = ['script', 'style', 'nav', 'footer', 'header', 'aside', 'noscript', 'iframe'];
    selectorsToRemove.forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Target main content areas if possible, otherwise use body
    const mainContent = doc.querySelector('article') || doc.querySelector('main') || doc.body;
    
    // Get text and clean it up
    return mainContent.innerText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 50) // Filter out short snippets like button labels
      .join('\n\n')
      .substring(0, 15000); // Limit to 15k chars for prompt efficiency
  };

  const handleUrlFetch = async () => {
    if (!urlInput.trim()) return;
    
    setIsFetching(true);
    setError(null);
    setStatus(AnalysisStatus.IDLE);
    setResult(null);

    try {
      // Using AllOrigins CORS Proxy
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlInput)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) throw new Error('Network bridge failed. Resource unreachable.');
      
      const data = await response.json();
      const content = extractTextFromHtml(data.contents);

      if (!content || content.length < 100) {
        throw new Error('Insufficient readable content detected at target URL.');
      }

      setInput(content);
      setIsFetching(false);
      
      // Automatically trigger analysis with the fetched content
      await triggerAnalysis(content);
    } catch (err: any) {
      setError(`URL INGESTION FAILURE: ${err.message || 'The target domain actively blocked remote extraction.'}`);
      setIsFetching(false);
    }
  };

  const triggerAnalysis = async (contentToAnalyze: string) => {
    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const data = await geminiService.analyzeArticle(contentToAnalyze);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during intelligence scan.');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    await triggerAnalysis(input);
  };

  const handleClear = () => {
    setInput('');
    setUrlInput('');
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-950 text-slate-100">
      {/* Header */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tighter">F.A.L.C.O.N <span className="text-cyan-500">A.I</span></span>
              <p className="text-[10px] text-slate-500 leading-none uppercase tracking-widest font-semibold">Intelligence Network</p>
            </div>
          </div>
          <div className="hidden sm:block text-xs text-slate-400 font-medium">
            Fake Article Locator & Credibility Observation Network
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Intro Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Advanced Intelligence <span className="text-cyan-500">Scan</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Utilizing high-order neural analysis to verify cross-platform narratives and expose misinformation.
          </p>
        </div>

        {/* URL Ingestion Field */}
        <div className="mb-6 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlFetch()}
            placeholder="Paste source URL for remote intelligence gathering..."
            className="block w-full pl-12 pr-32 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all text-slate-200 placeholder:text-slate-600 font-semibold"
          />
          <button
            onClick={handleUrlFetch}
            disabled={isFetching || !urlInput.trim()}
            className={`absolute right-2 top-2 bottom-2 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              isFetching || !urlInput.trim()
                ? 'bg-slate-800 text-slate-500'
                : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-900/40'
            }`}
          >
            {isFetching ? 'Fetching...' : 'Fetch & Scan'}
          </button>
        </div>

        {/* Input Area */}
        <div className="bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-10 border border-slate-800 mb-12 transition-all hover:border-slate-700">
          <div className="mb-4 flex items-center justify-between">
            <label htmlFor="article" className="block text-sm font-bold text-slate-300 uppercase tracking-wider">
              Scan Source Text / Buffer
            </label>
            <button 
              onClick={handleClear}
              className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear Data Buffer
            </button>
          </div>
          
          <textarea
            id="article"
            rows={8}
            className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all text-slate-200 placeholder:text-slate-600 resize-none font-medium"
            placeholder="Manual entry: Paste suspected misinformation or statements here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 text-slate-500">
              <div className="flex items-center text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2 shadow-[0_0_8px_#06b6d4]"></span>
                Web Grounding
              </div>
              <div className="flex items-center text-xs font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_#10b981]"></span>
                Logic Engine
              </div>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={status === AnalysisStatus.ANALYZING || !input.trim() || isFetching}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-white transition-all transform active:scale-95 flex items-center justify-center space-x-3 uppercase tracking-tighter ${
                status === AnalysisStatus.ANALYZING || !input.trim() || isFetching
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-xl shadow-cyan-900/40 hover:-translate-y-1'
              }`}
            >
              {status === AnalysisStatus.ANALYZING ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Initiating Scan...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Verify Intelligence</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        {status === AnalysisStatus.ANALYZING && (
          <div className="mb-12 text-center animate-pulse">
            <p className="text-sm font-bold text-cyan-500 uppercase tracking-widest italic">Cross-referencing global databases and verifying semantic integrity...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-12 p-5 bg-red-950/30 border border-red-900/50 rounded-2xl flex items-start space-x-4 text-red-400">
            <svg className="w-6 h-6 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && <AnalysisView result={result} />}

        {/* Features for Initial State */}
        {status === AnalysisStatus.IDLE && !result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <FeatureCard 
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />}
              title="Narrative Sync"
              description="F.A.L.C.O.N aligns claims with verified news cycles and global fact-checking networks in real-time."
            />
            <FeatureCard 
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
              title="Semantic Audit"
              description="Deep-scan for manipulative language patterns, logical inconsistencies, and emotional baiting tactics."
            />
            <FeatureCard 
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
              title="Credibility Score"
              description="Every scan yields a definitive 0-100 credibility index based on multi-source verification protocols."
            />
          </div>
        )}
      </main>

      <footer className="mt-24 py-16 border-t border-slate-900 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center space-x-2 opacity-50 mb-6">
            <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-400 tracking-tighter">F.A.L.C.O.N A.I</span>
          </div>
          <p className="text-slate-600 text-xs font-medium text-center max-w-lg leading-relaxed uppercase tracking-widest">
            Fake Article Locator and Credibility Observation Network A.I. 
            <br />
            &copy; {new Date().getFullYear()} DECRYPT INTELLIGENCE LABS.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg hover:shadow-cyan-900/10 hover:border-slate-700 transition-all group">
    <div className="w-12 h-12 bg-cyan-950 text-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icon}
      </svg>
    </div>
    <h3 className="text-lg font-black text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed font-medium">{description}</p>
  </div>
);

export default App;
