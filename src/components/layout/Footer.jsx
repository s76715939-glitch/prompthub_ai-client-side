import React from 'react';
import { Sparkles, Github, Linkedin, Heart } from 'lucide-react';

export const Footer = ({ navigate }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <span className="text-lg font-bold text-white">PromptHub AI</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The modern community-driven marketplace for discovering, sharing, and monetizing high-performance AI prompts for ChatGPT, Gemini, Claude, and Midjourney.
          </p>
          <div className="flex items-center gap-3 pt-2">
            {/* Latest X (Twitter) Logo SVG */}
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title="X (Twitter)"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button onClick={() => navigate('/prompts')} className="hover:text-indigo-400 transition-colors">
                Explore All Prompts
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/payment')} className="hover:text-indigo-400 transition-colors">
                Premium Access ($5)
              </button>
            </li>
            <li>
              <button onClick={() => navigate('/register')} className="hover:text-indigo-400 transition-colors">
                Become a Creator
              </button>
            </li>
          </ul>
        </div>

        {/* AI Tools */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Supported AI Tools</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="hover:text-indigo-400 cursor-pointer" onClick={() => navigate('/prompts?aiTool=ChatGPT')}>
              ChatGPT (GPT-4o & o1)
            </li>
            <li className="hover:text-indigo-400 cursor-pointer" onClick={() => navigate('/prompts?aiTool=Gemini')}>
              Google Gemini 1.5 Pro
            </li>
            <li className="hover:text-indigo-400 cursor-pointer" onClick={() => navigate('/prompts?aiTool=Claude')}>
              Anthropic Claude 3.5 Sonnet
            </li>
            <li className="hover:text-indigo-400 cursor-pointer" onClick={() => navigate('/prompts?aiTool=Midjourney')}>
              Midjourney v6.0 Concept Art
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Prompt Digest</h4>
          <p className="text-xs text-slate-400 mb-3">
            Get the top 5 trending prompts delivered to your inbox every week.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            />
            <button className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-300 rounded-xl text-xs font-semibold shrink-0">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-center text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} PromptHub AI. All rights reserved.</p>
      </div>
    </footer>
  );
};
