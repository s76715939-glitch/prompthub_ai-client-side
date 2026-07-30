import React from 'react';
import { 
  Copy, 
  Bookmark, 
  Lock, 
  Sparkles, 
  Eye, 
  Layers, 
  Cpu, 
  Star 
} from 'lucide-react';
import { motion } from 'framer-motion';

export const PromptCard = ({ prompt, onBookmark, isBookmarked = false, onNavigate, user }) => {
  const isPrivate = prompt.visibility === 'Private';
  const isLocked = isPrivate && (!user || (user.subscription !== 'premium' && user.role !== 'admin' && user.role !== 'creator'));

  const getToolBadgeColor = (tool) => {
    switch (tool) {
      case 'ChatGPT':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'Gemini':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
      case 'Claude':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'Midjourney':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      default:
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-slate-900/90 text-slate-400 border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all"
    >
      {/* Thumbnail Banner Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={prompt.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'}
          alt={prompt.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isLocked ? 'blur-sm brightness-75' : ''
          }`}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

        {/* Badges on Top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border backdrop-blur-md ${getToolBadgeColor(prompt.aiTool)}`}>
            {prompt.aiTool}
          </span>

          <div className="flex items-center gap-1.5">
            {isPrivate ? (
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-950/90 text-amber-300 border border-amber-800/60 backdrop-blur-md flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                Premium
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-950/80 text-slate-300 border border-slate-800 backdrop-blur-md">
                {prompt.difficulty}
              </span>
            )}
            
            {onBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(prompt._id);
                }}
                className={`p-1.5 rounded-lg border backdrop-blur-md transition-colors ${
                  isBookmarked
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:text-white'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Prompt'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-slate-950' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs text-indigo-400 font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>{prompt.category}</span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
            {prompt.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {prompt.description}
          </p>
        </div>

        <div>
          {/* Creator & Stats */}
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-2">
              <img
                src={prompt.creatorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={prompt.creatorName}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="truncate max-w-[110px] font-medium text-slate-300">{prompt.creatorName}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-400">
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                {prompt.copyCount || 0}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onNavigate(`/prompts/${prompt._id}`)}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all group-hover:shadow-lg group-hover:shadow-indigo-600/20"
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Unlock Premium Prompt</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Details</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
