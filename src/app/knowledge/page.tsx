"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Book, Search, Info, Bookmark, BookmarkCheck, Tag, HelpCircle, 
  FileText, ChevronRight, ChevronDown, Lightbulb, Link as LinkIcon, AlertTriangle 
} from "lucide-react";

export default function LegalKnowledgeCenterPage() {
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const categories = [
    { id: "all", label: "All Topics" },
    { id: "bookmarks", label: "My Bookmarks" },
    { id: "Constitution", label: "Constitution of India" },
    { id: "BNS", label: "Bharatiya Nyaya Sanhita (BNS)" },
    { id: "BNSS", label: "Bharatiya Nagarik Suraksha (BNSS)" },
    { id: "Bharatiya Sakshya Adhiniyam", label: "Bharatiya Sakshya (BSA)" },
    { id: "Consumer Law", label: "Consumer Law" },
    { id: "Property Law", label: "Property Law" },
    { id: "Family Law", label: "Family Law" },
    { id: "Labour Law", label: "Labour Law" },
    { id: "Cyber Law", label: "Cyber Law" },
    { id: "RTI", label: "RTI" }
  ];

  const toggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic update
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      return next;
    });

    try {
      await fetch('/api/v1/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: id })
      });
    } catch (err) {
      console.error("Failed to bookmark via API", err);
      // Rollback optimistic update
      setBookmarkedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    let url = "/api/v1/knowledge";
    if (activeCategory !== "all" && activeCategory !== "bookmarks") {
      url += `?category=${encodeURIComponent(activeCategory)}`;
    }
    if (searchQuery) {
      url += url.includes("?") ? `&q=${encodeURIComponent(searchQuery)}` : `?q=${encodeURIComponent(searchQuery)}`;
    }
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch API");
        return res.json();
      })
      .then(data => {
        if (data.success && data.data) {
          setKnowledgeBase(data.data);
        } else {
          throw new Error("Invalid response");
        }
      })
      .catch((err) => {
        console.error("Backend fetch failed", err);
        setKnowledgeBase([]);
        setIsError(true);
      })
      .finally(() => setIsLoading(false));
  }, [activeCategory, searchQuery]);

  const filteredTopics = useMemo(() => {
    let result = knowledgeBase;
    
    if (activeCategory === 'bookmarks') {
      result = result.filter(t => bookmarkedIds.includes(t.id));
    }

    if (activeTag) {
      result = result.filter(t => t.tags && t.tags.includes(activeTag));
    }

    return result;
  }, [knowledgeBase, activeCategory, activeTag, bookmarkedIds]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    knowledgeBase.forEach(t => {
      if (t.tags) t.tags.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [knowledgeBase]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Book className="w-8 h-8 text-[#FF9933]" />
              Legal Knowledge Center
            </h1>
            <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 mt-2 max-w-2xl">
              Understand the Constitution of India, the new Bharatiya Nyaya Sanhita (BNS), BNSS, BSA, and other critical citizen rights in simple language.
            </p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search laws, rights, or articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Categories */}
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wider">Browse by Act</h3>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActiveTag(null);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${ activeCategory === cat.id ? "bg-[#FF9933] text-white shadow-md" : "bg-transparent text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800" }`}
              >
                <div className="flex items-center gap-2">
                  {cat.id === 'bookmarks' && <Bookmark className="w-4 h-4" />}
                  {cat.label}
                </div>
                {cat.id === 'bookmarks' && activeCategory !== 'bookmarks' && bookmarkedIds.length > 0 && (
                  <span className="bg-[#FF9933]/20 text-[#FF9933] dark:text-[#FF9933] px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {bookmarkedIds.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {allTags.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wider flex items-center justify-between">
                Filter by Tags
                {activeTag && (
                  <button 
                    onClick={() => setActiveTag(null)}
                    className="text-[#FF9933] text-[10px] hover:underline normal-case"
                  >
                    Clear
                  </button>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${ activeTag === tag ? "bg-[#FF9933] text-white border-[#FF9933]" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-[#FF9933] hover:text-[#FF9933]" }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-3" />
            <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-2">Educational Content</h4>
            <p className="text-xs text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
              This content is for educational purposes to spread legal awareness among Indian citizens. Always consult an advocate for specific legal advice.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9933]"></div>
            </div>
          )}
          
          {!isLoading && isError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-8 rounded-3xl text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Unable to load Knowledge Center</h3>
              <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500">There was a problem fetching the data. Please try again later.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 bg-[#FF9933] hover:bg-[#E68A2E] text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          
          {!isLoading && !isError && filteredTopics.map(topic => {
            const isExpanded = expandedArticleId === topic.id;
            const isBookmarked = bookmarkedIds.includes(topic.id);

            return (
              <div key={topic.id} className={`bg-white dark:bg-slate-900 rounded-3xl border ${isExpanded ? 'border-[#FF9933]' : 'border-slate-200 dark:border-slate-800'} overflow-hidden shadow-sm hover:shadow-md transition-all duration-300`}>
                <div 
                  className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-4"
                  onClick={() => setExpandedArticleId(isExpanded ? null : topic.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold text-[#FF9933] uppercase tracking-wider bg-[#FF9933]/10 px-2.5 py-1 rounded-md">
                        {topic.category || 'Law'}
                      </span>
                      {topic.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md hidden sm:inline-block">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-[#FF9933] transition-colors">
                      {topic.title}
                    </h2>
                    
                    {!isExpanded && (
                      <p className="mt-3 text-slate-600 dark:text-slate-400 dark:text-slate-500 line-clamp-2 text-sm md:text-base">
                        {topic.simple_explanation || topic.summary || topic.content}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end gap-3 shrink-0">
                    <button 
                      onClick={(e) => toggleBookmark(topic.id, e)}
                      className="p-2 rounded-full hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-slate-800 transition-colors"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-6 h-6 text-[#FF9933]" />
                      ) : (
                        <Bookmark className="w-6 h-6 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
                      )}
                    </button>
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400 dark:text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 dark:text-slate-500" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-slate-100 dark:border-slate-800/50 pt-6">
                    {topic.simple_explanation && (
                      <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-5 rounded-2xl flex items-start gap-4">
                        <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-2">Simple Explanation</h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
                            {topic.simple_explanation}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="prose dark:prose-invert max-w-none">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#FF9933]" />
                        Detailed Legal Context
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap mb-8 text-sm md:text-base">
                        {topic.content}
                      </p>

                      {topic.example && (
                        <div className="mb-8 bg-slate-50 dark:bg-[#1E293B] p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                          <h4 className="font-bold text-slate-900 dark:text-white mb-2">Example / Scenario</h4>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {topic.example}
                          </p>
                        </div>
                      )}

                      {topic.faqs && topic.faqs.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-[#FF9933]" />
                            Frequently Asked Questions
                          </h3>
                          <div className="space-y-4">
                            {topic.faqs.map((faq: any, idx: number) => (
                              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700/50">
                                <p className="font-bold text-slate-900 dark:text-white text-sm mb-2">{faq.question}</p>
                                <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 text-sm leading-relaxed">{faq.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {topic.related_laws && topic.related_laws.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                            <LinkIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            Related Laws
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {topic.related_laws.map((law: string, i: number) => (
                              <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                                {law}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {topic.related_judgments && topic.related_judgments.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                            <Book className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            Related Judgments
                          </h3>
                          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
                            {topic.related_judgments.map((judgment: string, i: number) => (
                              <li key={i}>{judgment}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex flex-wrap gap-2">
                       {topic.tags?.map((tag: string) => (
                          <button 
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTag(tag);
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </button>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!isLoading && !isError && filteredTopics.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
              <Book className="w-12 h-12 text-slate-300 dark:text-slate-500 dark:text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No topics found</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters.</p>
              {(searchQuery || activeTag || activeCategory !== 'all') && (
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTag(null);
                    setActiveCategory("all");
                  }}
                  className="mt-4 text-[#FF9933] font-medium hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
