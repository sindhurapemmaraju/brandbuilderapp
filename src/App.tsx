/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Layout, Newspaper, Share2, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { generateProductDescription, generateBrandImage, BrandImage } from "./lib/gemini";

export default function App() {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<BrandImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const refinedDescription = await generateProductDescription(description);
      
      const mediums: ("Billboard" | "Newspaper" | "Social Post")[] = [
        "Billboard",
        "Newspaper",
        "Social Post"
      ];

      const imagePromises = mediums.map(async (medium) => {
        const url = await generateBrandImage(refinedDescription, medium);
        return {
          id: crypto.randomUUID(),
          medium,
          url,
          prompt: refinedDescription
        };
      });

      const generatedImages = await Promise.all(imagePromises);
      setResults(generatedImages);
    } catch (err) {
      console.error(err);
      setError("Something went wrong with the AI generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#050505] text-[#E2E2E2] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 px-8 border-b border-[#222] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-black rotate-45"></div>
          </div>
          <span className="font-medium tracking-[0.2em] text-sm uppercase">Brand Builder Studio</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#151515] border border-[#333] rounded-full hidden sm:flex">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[10px] uppercase tracking-wider text-[#999]">Model: Nano-Banana v2.4</span>
          </div>
          <button className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer">
            Export Assets
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Controls */}
        <aside className="w-[320px] border-r border-[#222] p-8 flex flex-col gap-8 bg-[#080808] shrink-0 overflow-y-auto">
          <form onSubmit={handleGenerate} className="flex flex-col gap-8 h-full">
            <section>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#666] mb-4 block underline decoration-white/10 underline-offset-4">Product Description</label>
              <div className="relative group">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product... (e.g. minimalist smart desk lamp)"
                  className="w-full p-4 bg-[#111] border border-[#222] rounded-lg text-sm leading-relaxed text-neutral-400 focus:outline-none focus:border-white/30 transition-colors h-40 resize-none font-serif italic"
                />
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                    <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                  </div>
                )}
              </div>
              {error && <p className="text-red-500 text-[10px] mt-2 uppercase tracking-wider">{error}</p>}
            </section>

            <section>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#666] mb-4 block underline decoration-white/10 underline-offset-4">Consistency Engine</label>
              <div className="space-y-3">
                <StatusItem label="Object Preservation" value="Active" />
                <StatusItem label="Texture Mapping" value="Nano-Enhanced" />
                <StatusItem label="Human Filtering" value="Shielded" success />
                <StatusItem label="Consistency Seed" value={`#${Math.floor(Math.random() * 10000)}`} />
              </div>
            </section>

            <div className="mt-auto pt-8">
              <button
                type="submit"
                disabled={isGenerating || !description.trim()}
                className="w-full py-4 border border-white/20 text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGenerating ? "Synthesizing..." : "Generate Creative"}
              </button>
            </div>
          </form>
        </aside>

        {/* Mockup Canvas */}
        <div className="flex-1 p-8 bg-[#0A0A0A] overflow-y-auto">
          <AnimatePresence mode="wait">
            {!isGenerating && results.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center opacity-10 grayscale"
              >
                <Layout size={64} className="mb-6" />
                <p className="text-xs uppercase tracking-[0.5em]">Awaiting Simulation Data</p>
              </motion.div>
            )}

            {(isGenerating || results.length > 0) && (
              <div className="grid grid-cols-2 gap-6 pb-8">
                {isGenerating ? (
                  <>
                    <SkeletonCard key="sk-1" className="col-span-2 aspect-[16/6]" />
                    <SkeletonCard key="sk-2" className="aspect-square" />
                    <SkeletonCard key="sk-3" className="aspect-square" />
                  </>
                ) : (
                  <>
                    {results.find(r => r.medium === "Billboard") && (
                      <div className="col-span-2" key="res-billboard">
                        <MediaCard result={results.find(r => r.medium === "Billboard")!} />
                      </div>
                    )}
                    {results.filter(r => r.medium !== "Billboard").map((result) => (
                      <MediaCard key={`res-${result.id}`} result={result} />
                    ))}
                  </>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-10 px-8 border-t border-[#222] bg-[#050505] flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-[#555] shrink-0">
        <div className="flex gap-8">
          <span>Session ID: BB-9921-X</span>
          <span>Latency: {isGenerating ? "..." : "442ms"}</span>
        </div>
        <div className="flex gap-4">
          <span>Nano-Banana rendering engine: Optimized</span>
          <span className="text-white flex items-center gap-2">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            System Ready
          </span>
        </div>
      </footer>
    </div>
  );
}

const StatusItem: React.FC<{ label: string; value: string; success?: boolean }> = ({ label, value, success }) => {
  return (
    <div className="flex items-center justify-between text-xs p-3 bg-[#111] border border-white/5 rounded">
      <span className="text-[#666]">{label}</span>
      <span className={`${success ? 'text-green-500' : 'text-white'} uppercase font-mono text-[10px]`}>{value}</span>
    </div>
  );
};

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`${className} bg-[#111] rounded-xl border border-[#222] overflow-hidden flex flex-col animate-pulse`}>
      <div className="px-4 py-2 border-b border-[#222] bg-[#151515] h-8" />
      <div className="flex-1 bg-white/5" />
    </div>
  );
};

const MediaCard: React.FC<{ result: BrandImage }> = ({ result }) => {
  const isBillboard = result.medium === "Billboard";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#111] rounded-xl border border-[#222] overflow-hidden flex flex-col group transition-all hover:border-[#444] ${isBillboard ? 'aspect-[16/6]' : 'aspect-square'}`}
    >
      <div className="px-4 py-2 border-b border-[#222] flex justify-between items-center bg-[#151515] shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-[#888]">Medium: {result.medium}</span>
        <span className="text-[10px] text-[#444] font-mono">{isBillboard ? "4096 x 1152 px" : "1080 x 1080 px"}</span>
      </div>
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        <img
          id={`brand-image-${result.id}`}
          src={result.url}
          alt={result.medium}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10"></div>
        
        <div className="absolute bottom-4 left-4 right-4 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/50 mb-1">Generated Prompt Extract</p>
          <p className="text-[10px] text-white/90 line-clamp-1 italic font-serif border-l border-white/20 pl-2">
            {result.prompt}
          </p>
        </div>

        <button className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera size={12} className="text-white/60" />
        </button>
      </div>
    </motion.div>
  );
};

