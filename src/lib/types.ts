export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language?: string;
  motherMode?: boolean;
}

export interface DocumentAnalysis {
  type: 'fir' | 'notice' | 'agreement' | 'employment' | 'loan' | 'property' | 'will' | 'divorce' | 'insurance';
  summary: string;
  motherModeSummary: string;
  sections: AnalysisSection[];
  riskScore: number;
  riskyClause: string[];
  missingInfo: string[];
  recommendations: string[];
}

export interface AnalysisSection {
  title: string;
  content: string;
  risk: 'low' | 'medium' | 'high';
}

export interface CaseData {
  id: string;
  title: string;
  type: string;
  strength: 'strong' | 'moderate' | 'weak';
  timeline: TimelineEvent[];
  evidence: Evidence[];
  roadmap: RoadmapStep[];
  estimatedCost: string;
  estimatedDuration: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: 'evidence' | 'action' | 'hearing' | 'milestone';
}

export interface Evidence {
  id: string;
  type: 'whatsapp' | 'email' | 'screenshot' | 'pdf' | 'photo' | 'other';
  name: string;
  status: 'uploaded' | 'analyzed' | 'verified';
  relevance: 'high' | 'medium' | 'low';
}

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed';
  estimatedTime: string;
}

export interface JudgeSimulation {
  caseTitle: string;
  plaintiffArguments: string[];
  defendantArguments: string[];
  judgeAnalysis: string;
  verdict: string;
  confidence: number;
  reasoning: string;
}

export interface DraftTemplate {
  id: string;
  title: string;
  titleHi: string;
  description: string;
  icon: string;
  category: string;
  fields: DraftField[];
}

export interface DraftField {
  name: string;
  label: string;
  labelHi: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  placeholder: string;
  required: boolean;
  options?: string[];
}
