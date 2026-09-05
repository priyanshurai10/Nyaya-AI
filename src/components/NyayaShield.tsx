'use client';

import { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, FileText, Phone, Scale } from 'lucide-react';

export default function NyayaShield() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);

  const topics = [
    {
      id: 1,
      title: "Police Arrest Rights",
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      content: [
        "Right to know the grounds of arrest (Section 50 CrPC / 50 BNSS).",
        "Right to inform a relative or friend immediately.",
        "Right to be produced before a Magistrate within 24 hours.",
        "Right to a lawyer during interrogation (Section 41D CrPC).",
        "Women cannot be arrested after sunset and before sunrise, except in exceptional circumstances."
      ]
    },
    {
      id: 2,
      title: "Traffic Police Stop",
      icon: <ShieldAlert className="w-5 h-5 text-orange-500" />,
      content: [
        "Traffic police CANNOT physically confiscate your car keys.",
        "Only an officer of rank Sub-Inspector (SI) or above can fine you for major offenses.",
        "You have the right to ask for the officer's identification.",
        "You cannot be forced to pay a bribe; demand an e-challan or court challan.",
        "If detained, you have the right to remain silent until your lawyer arrives."
      ]
    },
    {
      id: 3,
      title: "Domestic Violence",
      icon: <Scale className="w-5 h-5 text-purple-500" />,
      content: [
        "Right to reside in the shared household (matrimonial home).",
        "Right to obtain protection orders against the abuser.",
        "Right to free legal aid from the State Legal Services Authority.",
        "You can file a Zero FIR at ANY police station, regardless of jurisdiction.",
        "National Women Helpline: 1091, Domestic Abuse Helpline: 181"
      ]
    },
    {
      id: 4,
      title: "Important Helplines",
      icon: <Phone className="w-5 h-5 text-green-500" />,
      content: [
        "National Emergency (Police/Fire/Ambulance): 112",
        "Women Helpline: 1091",
        "Cyber Crime Helpline: 1930",
        "Anti-Poison Helpline: 1066",
        "Senior Citizen Helpline: 14567"
      ]
    }
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-3 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-transform hover:scale-105 active:scale-95 group"
        title="Nyaya Shield - Emergency Rights"
      >
        <ShieldAlert className="w-6 h-6 animate-pulse" />
        <span className="font-bold hidden md:block">Nyaya Shield</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-red-50 dark:bg-red-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nyaya Shield (न्याय कवच)</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Know your emergency legal rights instantly.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {!selectedTopic ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {topics.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/50 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all text-center group"
                    >
                      <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {topic.icon}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{topic.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    className="text-sm font-semibold text-[#FF9933] hover:underline flex items-center gap-1"
                  >
                    ← Back to Topics
                  </button>
                  
                  {topics.filter(t => t.id === selectedTopic).map(topic => (
                    <div key={topic.id} className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        {topic.icon}
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{topic.title}</h3>
                      </div>
                      <ul className="space-y-4">
                        {topic.content.map((point, idx) => (
                          <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300">
                            <span className="text-red-500 font-bold">•</span>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
              Disclaimer: This is for immediate reference and does not constitute formal legal counsel. In extreme emergencies, always dial 112.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
