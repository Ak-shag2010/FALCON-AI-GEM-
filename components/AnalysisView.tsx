
import React from 'react';
import { FactCheckResult } from '../types';

interface AnalysisViewProps {
  result: FactCheckResult;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ result }) => {
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return (
          <h3 key={i} className="text-lg font-black text-cyan-400 uppercase tracking-widest mt-10 mb-4 pb-2 border-b border-slate-800 flex items-center">
            <span className="w-2 h-4 bg-cyan-600 mr-3 rounded-sm"></span>
            {trimmed.replace(/\*\*/g, '')}
          </h3>
        );
      }
      
      // List items
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <li key={i} className="ml-4 text-slate-300 mb-3 flex items-start group">
            <span className="text-cyan-600 mr-3 mt-1.5">•</span>
            <span className="leading-relaxed">{trimmed.substring(2)}</span>
          </li>
        );
      }
      
      if (trimmed === '') return <div key={i} className="h-2" />;
      
      // Inline Bold
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldRegex);
      return (
        <p key={i} className="text-slate-300 leading-relaxed mb-4 font-medium">
          {parts.map((part, index) => (
            index % 2 === 1 ? <strong key={index} className="text-white font-black">{part}</strong> : part
          ))}
        </p>
      );
    });
  };

  return (
    <div className="bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 sm:p-12 border border-slate-800 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">INTELLIGENCE <span className="text-cyan-500">REPORT</span></h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Classification: Verified Dataset Analysis</p>
        </div>
        <div className="flex items-center space-x-3">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Timestamp</span>
             <span className="px-4 py-1.5 bg-slate-950 text-cyan-500 rounded-lg text-xs font-black border border-slate-800">
               {new Date(result.timestamp).toLocaleString()}
             </span>
           </div>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        {renderFormattedText(result.text)}
      </div>

      {result.sources.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-800">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-emerald-950/50 text-emerald-500 rounded-xl flex items-center justify-center mr-4 border border-emerald-900/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Validation Network</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cross-Reference Origin URLs</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-cyan-900/50 rounded-2xl transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                    {source.title}
                  </p>
                  <p className="text-[10px] text-slate-600 truncate font-mono mt-1">{source.uri}</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 group-hover:bg-cyan-950 text-slate-700 group-hover:text-cyan-400 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;
