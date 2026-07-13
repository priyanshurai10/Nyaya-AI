'use client';

import Link from 'next/link';

interface Agent {
  number: number;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const agents: Agent[] = [
  { number: 1, name: 'Chat Agent', icon: '💬', description: 'Handles natural conversations, context management, and response generation in 12 Indian languages', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
  { number: 2, name: 'Language Agent', icon: '🌐', description: 'Real-time translation, language detection, and multilingual response synthesis across Hindi, Tamil, Bengali & more', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
  { number: 3, name: 'Document Agent', icon: '📄', description: 'Scans, analyzes, and extracts key information from legal documents, contracts, and agreements', color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30' },
  { number: 4, name: 'Legal Research Agent', icon: '🔍', description: 'Searches Indian law databases, finds relevant sections, case law, and legal precedents', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
  { number: 5, name: 'Risk Agent', icon: '🛡️', description: 'Detects scams, fraudulent patterns, and assesses legal risk in documents and transactions', color: 'from-red-500/20 to-red-600/10 border-red-500/30' },
  { number: 6, name: 'Evidence Agent', icon: '🔬', description: 'Analyzes evidence documents, assesses relevance, and builds evidence chains for case strategy', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
  { number: 7, name: 'Timeline Agent', icon: '📅', description: 'Generates chronological case timelines from documents, events, and communication records', color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30' },
  { number: 8, name: 'Strategy Agent', icon: '🧠', description: 'Builds legal strategy based on case analysis, precedents, and success probability estimation', color: 'from-[#FF9933]/20 to-[#FF8800]/10 border-[#FF9933]/30' },
  { number: 9, name: 'Draft Agent', icon: '✍️', description: 'Generates legal documents — complaints, notices, applications, and affidavits in proper format', color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30' },
  { number: 10, name: 'Judge Agent', icon: '⚖️', description: 'Simulates judicial perspective — predicts outcomes, evaluates arguments, and suggests improvements', color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30' },
];

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className={`bg-gradient-to-br ${agent.color} border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300 group`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-gray-500 dark:text-white/50 bg-white dark:bg-[#111827]/5 px-2 py-1 rounded-lg">
          AGENT-{String(agent.number).padStart(2, '0')}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-[#138808]" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#138808] animate-ping opacity-75" />
          </div>
          <span className="text-[10px] text-[#138808] font-medium">Active</span>
        </div>
      </div>

      {/* Icon & Name */}
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">{agent.icon}</div>
      <h3 className="text-base font-bold text-white group-hover:text-[#FF9933] transition-colors">{agent.name}</h3>
      <p className="text-xs text-gray-400 dark:text-white/40 mt-2 leading-relaxed">{agent.description}</p>
    </div>
  );
}

function FlowDiagram() {
  return (
    <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-[#FF9933] mb-6 text-center">🔄 Agent Pipeline Architecture</h3>

      {/* Flow layout */}
      <div className="flex flex-col items-center justify-center gap-4">
        {/* User Input */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-5 py-3 text-center w-full max-w-sm">
          <div className="text-lg">👤 User Query</div>
          <div className="text-[10px] text-gray-400 dark:text-white/40 mt-1">Natural Language / Voice Input</div>
        </div>

        {/* Down Arrow */}
        <div className="text-gray-500 dark:text-white/50 text-lg">↓</div>

        {/* Chat / Router */}
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl px-5 py-3 text-center w-full max-w-sm">
          <div className="text-lg">💬 Chat Agent / Router</div>
          <div className="text-[10px] text-gray-400 dark:text-white/40 mt-1">Parses Intent & Language Routing</div>
        </div>

        {/* Down Arrow */}
        <div className="text-gray-500 dark:text-white/50 text-lg">↓</div>

        {/* Specialist Agents Pool */}
        <div className="bg-white dark:bg-[#111827]/5 border border-white/10 rounded-xl p-4 w-full max-w-lg text-center">
          <div className="text-xs font-bold text-gray-300 mb-2">🧠 Specialist Pipeline Dispatch</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded p-1.5">📄 Document</div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-1.5">🔍 Research</div>
            <div className="bg-red-500/10 border border-red-500/20 rounded p-1.5">🛡️ Risk</div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded p-1.5">🔬 Evidence</div>
            <div className="bg-teal-500/10 border border-teal-500/20 rounded p-1.5">📅 Timeline</div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded p-1.5">✍️ Draft</div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded p-1.5">⚖️ Judge</div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded p-1.5">🌐 Language</div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="text-gray-500 dark:text-white/50 text-lg">↓</div>

        {/* Unified Output */}
        <div className="bg-[#138808]/20 border border-[#138808]/30 rounded-xl px-5 py-3 text-center w-full max-w-sm">
          <div className="text-lg text-[#138808]">✅ Unified Response</div>
          <div className="text-[10px] text-gray-400 dark:text-white/40 mt-1">Translated & Fact-Checked Legal Aid</div>
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 p-6 md:p-12 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF9933]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#138808]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
              🤖 Nyaya AI Multi-Agent Mesh
            </h1>
            <p className="text-sm text-gray-400 dark:text-white/40 mt-1">
              Coordinated specialized autonomous agents working in harmony to decode Indian Law.
            </p>
          </div>
          <Link
            href="/"
            className="self-start sm:self-auto px-4 py-2 bg-white dark:bg-[#111827]/5 hover:bg-white dark:bg-[#111827]/10 border border-white/10 rounded-xl text-xs font-semibold transition-all hover:border-white/20"
          >
            ← Back to Terminal
          </Link>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {agents.map((agent) => (
            <AgentCard key={agent.number} agent={agent} />
          ))}
        </div>

        {/* Flow Diagram */}
        <FlowDiagram />
      </div>
    </div>
  );
}
