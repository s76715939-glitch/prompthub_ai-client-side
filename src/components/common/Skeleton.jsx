import React from 'react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-indigo-500 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 animate-pulse flex flex-col gap-4">
    <div className="w-full h-44 bg-slate-800/60 rounded-xl" />
    <div className="flex gap-2">
      <div className="w-20 h-6 bg-slate-800/80 rounded-full" />
      <div className="w-24 h-6 bg-slate-800/80 rounded-full" />
    </div>
    <div className="w-3/4 h-6 bg-slate-800 rounded-lg" />
    <div className="w-full h-12 bg-slate-800/50 rounded-lg" />
    <div className="flex justify-between items-center pt-2">
      <div className="w-28 h-5 bg-slate-800/70 rounded" />
      <div className="w-20 h-8 bg-slate-800 rounded-lg" />
    </div>
  </div>
);
