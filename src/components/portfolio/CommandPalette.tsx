'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Code,
  User,
  FolderGit2,
  GraduationCap,
  Mail,
  FileText,
  Github,
  Linkedin,
  Sparkles,
  X,
  Command,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResume: () => void;
  onToggleTheme: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenResume,
  onToggleTheme,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const actions = [
    {
      id: 'home',
      title: 'Go to Home',
      category: 'Navigation',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      perform: () => {
        document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      },
    },
    {
      id: 'about',
      title: 'About Priyanshu Rai',
      category: 'Navigation',
      icon: <User className="w-4 h-4 text-indigo-400" />,
      perform: () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      },
    },
    {
      id: 'skills',
      title: 'View Skills & Stack',
      category: 'Navigation',
      icon: <Code className="w-4 h-4 text-purple-400" />,
      perform: () => {
        document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      },
    },
    {
      id: 'projects',
      title: 'Explore Featured Projects',
      category: 'Navigation',
      icon: <FolderGit2 className="w-4 h-4 text-emerald-400" />,
      perform: () => {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      },
    },
    {
      id: 'education',
      title: 'Education & Qualifications',
      category: 'Navigation',
      icon: <GraduationCap className="w-4 h-4 text-amber-400" />,
      perform: () => {
        document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      },
    },
    {
      id: 'contact',
      title: 'Get in Touch / Contact',
      category: 'Navigation',
      icon: <Mail className="w-4 h-4 text-rose-400" />,
      perform: () => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        onClose();
      },
    },
    {
      id: 'resume',
      title: 'View & Download Resume',
      category: 'Action',
      icon: <FileText className="w-4 h-4 text-sky-400" />,
      perform: () => {
        onOpenResume();
        onClose();
      },
    },
    {
      id: 'github',
      title: 'Visit GitHub Profile',
      category: 'External Link',
      icon: <Github className="w-4 h-4 text-slate-300" />,
      perform: () => {
        window.open('https://github.com/priyanshurai10', '_blank');
        onClose();
      },
    },
    {
      id: 'linkedin',
      title: 'Connect on LinkedIn',
      category: 'External Link',
      icon: <Linkedin className="w-4 h-4 text-blue-400" />,
      perform: () => {
        window.open('https://linkedin.com/in/priyanshu-rai2114722ab', '_blank');
        onClose();
      },
    },
    {
      id: 'theme',
      title: 'Toggle Dark / Light Theme',
      category: 'Preferences',
      icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
      perform: () => {
        onToggleTheme();
        onClose();
      },
    },
  ];

  const filteredActions = actions.filter((action) =>
    action.title.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-xl bg-slate-900/90 dark:bg-slate-950/95 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.2)] overflow-hidden text-slate-100"
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 border-b border-slate-800">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full py-4 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm font-sans"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
              {filteredActions.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No actions found for "{query}"
                </div>
              ) : (
                filteredActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.perform}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/20 border border-transparent transition-all group text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-slate-800/80 group-hover:bg-cyan-500/20 transition-colors">
                        {action.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-cyan-300">
                          {action.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {action.category}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 group-hover:text-cyan-400">
                      Jump →
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-2">
                <Command className="w-3 h-3 text-cyan-400" />
                <span>Quick Navigation</span>
              </div>
              <div>Press ESC to exit</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
