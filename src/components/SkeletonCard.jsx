import React from 'react';

const SkeletonCard = () => {
  return (
    <article className="bg-surface-container-lowest border-border-width border-on-surface shadow-[4px_4px_0px_0px_#141414] flex flex-col relative animate-pulse h-[280px]">
      <div className="p-stack-md flex-1 flex flex-col gap-stack-md border-b-border-width border-on-surface">
        <div className="flex items-center gap-stack-sm pr-24">
          <div className="w-10 h-10 border-border-width border-on-surface bg-surface-variant flex-shrink-0"></div>
          <div className="min-w-0 flex-1">
            <div className="h-4 bg-surface-variant w-1/2 mb-2"></div>
            <div className="h-3 bg-surface-variant w-1/3"></div>
          </div>
        </div>

        <div className="p-stack-sm border-border-width border-on-surface mt-2 bg-surface-variant">
          <div className="h-5 bg-surface-container-highest w-3/4 mb-3"></div>
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-surface-container-highest w-full"></div>
            <div className="h-3 bg-surface-container-highest w-5/6"></div>
          </div>
        </div>
      </div>

      <div className="p-stack-sm flex justify-between items-center bg-surface-container">
        <div className="h-6 bg-surface-variant w-1/4"></div>
        <div className="h-10 bg-surface-variant w-1/3 border-border-width border-on-surface"></div>
      </div>
    </article>
  );
};

export default SkeletonCard;
