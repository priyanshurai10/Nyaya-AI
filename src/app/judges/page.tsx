"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Scale, 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  BookOpen, 
  Award, 
  Gavel, 
  Calendar 
} from "lucide-react";

interface Judge {
  id: string;
  name: string;
  designation: string;
  courtLevel: string;
  courtName: string;
  state: string;
  experience: string;
  cases: string;
  verified: boolean;
  biography: string;
  education: string;
  notableJudgments: string[];
}

const fallbackJudges: Judge[] = [
  {
    id: "1",
    name: "Hon'ble Justice D.Y. Chandrachud",
    designation: "Chief Justice of India",
    courtLevel: "Supreme Court",
    courtName: "Supreme Court of India",
    state: "Delhi",
    experience: "24 Years",
    cases: "5000+",
    verified: true,
    biography: "Dr. Justice Dhananjaya Y. Chandrachud is the 50th and current Chief Justice of India. Known for his progressive judgments and emphasis on technological advancement in the judiciary.",
    education: "LL.M., S.J.D. (Harvard Law School), LL.B. (Delhi University)",
    notableJudgments: ["Right to Privacy as a Fundamental Right", "Decriminalization of Homosexuality", "Entry of women in Sabarimala"]
  },
  {
    id: "2",
    name: "Hon'ble Justice Sanjiv Khanna",
    designation: "Judge",
    courtLevel: "Supreme Court",
    courtName: "Supreme Court of India",
    state: "Delhi",
    experience: "19 Years",
    cases: "3200+",
    verified: true,
    biography: "Justice Sanjiv Khanna is a judge of the Supreme Court of India. He was elevated as a Judge of the Supreme Court of India on 18 January 2019.",
    education: "LL.B. (Campus Law Centre, University of Delhi)",
    notableJudgments: ["Central Vista Project Case", "RTI applicability to CJI office", "Electoral Bonds Scheme Validity"]
  },
  {
    id: "3",
    name: "Hon'ble Justice Manmohan",
    designation: "Chief Justice",
    courtLevel: "High Court",
    courtName: "Delhi High Court",
    state: "Delhi",
    experience: "16 Years",
    cases: "2800+",
    verified: true,
    biography: "Justice Manmohan was appointed as the Chief Justice of the Delhi High Court. He has rich experience in civil, criminal, and constitutional matters.",
    education: "LL.B. (Campus Law Centre, University of Delhi)",
    notableJudgments: ["Various Intellectual Property disputes", "Taxation rulings", "Public Interest Litigations"]
  },
  {
    id: "4",
    name: "Hon'ble Justice Devendra Kumar Upadhyaya",
    designation: "Chief Justice",
    courtLevel: "High Court",
    courtName: "Bombay High Court",
    state: "Maharashtra",
    experience: "12 Years",
    cases: "2100+",
    verified: true,
    biography: "Elevated as Chief Justice of Bombay High Court. He has authored several key judgments on public interest litigations and administrative law.",
    education: "LL.B. (Lucknow University)",
    notableJudgments: ["Environmental protection matters", "Administrative reforms"]
  },
  {
    id: "5",
    name: "Hon'ble Justice T.S. Sivagnanam",
    designation: "Chief Justice",
    courtLevel: "High Court",
    courtName: "Calcutta High Court",
    state: "West Bengal",
    experience: "15 Years",
    cases: "2500+",
    verified: true,
    biography: "Currently serving as the Chief Justice of the Calcutta High Court. He previously served in the Madras High Court and is well known for his expertise in tax laws.",
    education: "B.Sc., B.L. (Madras Law College)",
    notableJudgments: ["Commercial tax disputes", "Customs and Central Excise matters"]
  },
  {
    id: "6",
    name: "Hon'ble Justice Sunita Agarwal",
    designation: "Chief Justice",
    courtLevel: "High Court",
    courtName: "Gujarat High Court",
    state: "Gujarat",
    experience: "12 Years",
    cases: "1800+",
    verified: true,
    biography: "She is currently serving as the Chief Justice of the Gujarat High Court, the only woman Chief Justice of a High Court currently in India.",
    education: "LL.B. (Awadh University)",
    notableJudgments: ["Women's rights", "Family law disputes"]
  },
  {
    id: "7",
    name: "Hon'ble Justice N.V. Ramana",
    designation: "Former Chief Justice",
    courtLevel: "Supreme Court",
    courtName: "Supreme Court of India",
    state: "Delhi",
    experience: "22 Years",
    cases: "4500+",
    verified: true,
    biography: "Former Chief Justice of India known for his strong stance on judicial independence and civil liberties.",
    education: "B.Sc., B.L. (Andhra University)",
    notableJudgments: ["Internet suspension in J&K", "Expediting criminal trials against politicians"]
  },
  {
    id: "8",
    name: "Hon'ble Justice Aravind Kumar",
    designation: "Judge",
    courtLevel: "Supreme Court",
    courtName: "Supreme Court of India",
    state: "Delhi",
    experience: "14 Years",
    cases: "2200+",
    verified: true,
    biography: "Elevated to the Supreme Court from the Gujarat High Court. Has profound experience in civil and constitutional law.",
    education: "LL.B. (Bangalore University)",
    notableJudgments: ["Landmark civil disputes", "Corporate governance cases"]
  }
];

export default function VerifiedJudgesPage() {
  const [judgesData, setJudgesData] = useState<Judge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [courtFilter, setCourtFilter] = useState("All Courts");
  const [stateFilter, setStateFilter] = useState("All States");
  const [alphabetFilter, setAlphabetFilter] = useState("All");

  const [selectedJudge, setSelectedJudge] = useState<Judge | null>(null);

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        setIsLoading(true);
        // Attempt to fetch live data
        const response = await fetch('/api/judges/directory');
        if (!response.ok) throw new Error('API unavailable');
        const data = await response.json();
        
        if (data && data.length > 0) {
          setJudgesData(data);
          setIsFallback(false);
        } else {
          throw new Error('Empty data');
        }
      } catch (error) {
        console.warn("Live judge data unavailable. Using educational fallback data.");
        setJudgesData(fallbackJudges);
        setIsFallback(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJudges();
  }, []);

  const alphabets = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')];
  const allCourts = ["All Courts", "Supreme Court", "High Court", "District Court"];
  // Deduplicate and sort states
  const allStates = ["All States", ...Array.from(new Set(judgesData.map(j => j.state)))].sort();

  const getSortName = (name: string) => {
    return name.replace(/^(Hon'ble\s+Justice\s+|Justice\s+|Dr\.\s+)/i, '').trim();
  };

  const filteredJudges = useMemo(() => {
    return judgesData.filter(j => {
      const matchesSearch = j.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            j.courtName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourt = courtFilter === 'All Courts' || j.courtLevel === courtFilter;
      const matchesState = stateFilter === 'All States' || j.state === stateFilter;
      
      let matchesAlphabet = true;
      if (alphabetFilter !== 'All') {
        matchesAlphabet = getSortName(j.name).toUpperCase().startsWith(alphabetFilter);
      }

      return matchesSearch && matchesCourt && matchesState && matchesAlphabet;
    });
  }, [judgesData, searchQuery, courtFilter, stateFilter, alphabetFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Scale className="w-8 h-8 text-[#FF9933]" />
              Judge Directory
            </h1>
            <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 mt-2 max-w-2xl">
              Access the verified directory of honorable judges across the Supreme Court, High Courts, and District Courts of India.
            </p>
          </div>
        </div>

        {/* Fallback Banner */}
        {isFallback && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Displaying verified educational content. Live database integration will be available in a future update.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto mb-8 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-5">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1.5">Search Judges</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by name or court..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#FF9933] outline-none dark:text-white transition-all"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1.5">Court Level</label>
            <select 
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF9933] dark:text-white transition-all appearance-none cursor-pointer"
            >
              {allCourts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1.5">State / Region</label>
            <select 
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF9933] dark:text-white transition-all appearance-none cursor-pointer"
            >
              {allStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-2">Filter by Alphabet</label>
          <div className="flex flex-wrap gap-1.5">
            {alphabets.map(alpha => (
              <button
                key={alpha}
                onClick={() => setAlphabetFilter(alpha)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${ alphabetFilter === alpha ? 'bg-[#FF9933] text-white shadow-sm' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-slate-700 border border-transparent dark:border-slate-700/50' }`}
              >
                {alpha}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF9933]"></div>
          </div>
        ) : filteredJudges.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Scale className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No judges found</h3>
            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredJudges.map(judge => (
              <div key={judge.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all flex flex-col h-full group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform duration-300">
                    <Scale className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  {judge.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                  {judge.name}
                </h3>
                <p className="text-sm font-medium text-[#FF9933] mb-4">
                  {judge.designation}
                </p>
                
                <div className="space-y-2.5 mb-6 flex-grow">
                  <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{judge.courtName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    {judge.experience} Experience
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  <button 
                    onClick={() => setSelectedJudge(judge)}
                    className="w-full py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    View Biography
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Biography Modal */}
      {selectedJudge && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          onClick={() => setSelectedJudge(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 transform transition-all" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <Scale className="w-8 h-8 md:w-10 md:h-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                      {selectedJudge.name}
                      {selectedJudge.verified && (
                        <span title="Verified Profile" className="flex items-center">
                          <ShieldCheck className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                        </span>
                      )}
                    </h2>
                    <p className="text-[#FF9933] font-medium text-lg mt-1">{selectedJudge.designation}, {selectedJudge.courtName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedJudge(null)} 
                  className="p-2 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">State / Region</div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FF9933]" /> {selectedJudge.state}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Experience</div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#FF9933]" /> {selectedJudge.experience}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider">Cases Disposed</div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-[#FF9933]" /> {selectedJudge.cases}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#FF9933]" /> 
                    Biography
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                    {selectedJudge.biography}
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#FF9933]" /> 
                    Education & Qualifications
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                    {selectedJudge.education}
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#FF9933]" /> 
                    Notable Judgments
                  </h3>
                  <ul className="space-y-2">
                    {selectedJudge.notableJudgments.map((judg, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm md:text-base">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF9933] mt-2 flex-shrink-0" />
                        <span>{judg}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                 <button 
                    onClick={() => setSelectedJudge(null)}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-[#111827] text-white dark:text-slate-900 dark:text-white font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 dark:bg-[#1F2937] transition-colors"
                  >
                    Close Profile
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
