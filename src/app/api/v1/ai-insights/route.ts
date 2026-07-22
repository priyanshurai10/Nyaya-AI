import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface InsightResult {
  possible_issues: string[];
  applicable_laws: string[];
  process_steps: string[];
  documents_required: string[];
  estimated_timeline: string;
  next_steps: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { situation } = body;

    if (!situation || typeof situation !== 'string' || !situation.trim()) {
      return NextResponse.json(
        { error: 'Legal situation description is required' },
        { status: 400 }
      );
    }

    const text = situation.trim();

    // 1. Try Groq AI for real-time intelligent analysis
    if (GROQ_API_KEY) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content: `You are an expert Indian Legal AI Advisor. Analyze the user's legal situation under Indian law (including Bharatiya Nyaya Sanhita BNS, BNSS, Bharatiya Sakshya Adhiniyam BSA, Consumer Protection Act 2019, Transfer of Property Act, Indian Contract Act, IT Act 2000, etc.).

Return ONLY a valid raw JSON object with NO markdown formatting, NO backticks, NO extra text:
{
  "possible_issues": ["Issue 1 with detail", "Issue 2 with detail"],
  "applicable_laws": ["Law Act Section 1", "Law Act Section 2"],
  "process_steps": ["1. Step 1 description", "2. Step 2 description", "3. Step 3 description", "4. Step 4 description"],
  "documents_required": ["Document 1", "Document 2", "Document 3"],
  "estimated_timeline": "Realistic timeline (e.g. 15-45 days for notice, 6-18 months for civil court)",
  "next_steps": ["Action 1", "Action 2", "Action 3"]
}`
              },
              {
                role: "user",
                content: `Legal Situation: "${text}"`
              }
            ]
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const rawContent = groqData.choices?.[0]?.message?.content || "";
          const cleanedContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed: InsightResult = JSON.parse(cleanedContent);
          
          if (parsed.possible_issues && parsed.applicable_laws && parsed.process_steps) {
            return NextResponse.json(parsed);
          }
        }
      } catch (err) {
        console.warn("Groq AI call failed, falling back to Context-Aware Engine:", err);
      }
    }

    // 2. Smart Context-Aware Fallback Engine (No generic delivery text!)
    const lower = text.toLowerCase();
    let result: InsightResult;

    if (lower.includes("landlord") || lower.includes("rent") || lower.includes("deposit") || lower.includes("flat") || lower.includes("tenant")) {
      result = {
        possible_issues: [
          "Unlawful Detention of Security Deposit: Failure to refund deposit post-vacation without itemized damage claims.",
          "Constructive Eviction & Illegal Lockout: Restricting access to property without due process of law.",
          "Breach of Lease Covenant: Violation of terms agreed in standard tenancy agreement."
        ],
        applicable_laws: [
          "Model Tenancy Act / State Rent Control Act",
          "Indian Contract Act, 1872 - Section 73 (Damages for Breach)",
          "Bharatiya Nyaya Sanhita (BNS) 2023 - Section 329 (Criminal Trespass)",
          "Transfer of Property Act, 1882 - Section 108"
        ],
        process_steps: [
          "1. Issue formal written demand notice via Registered Post / Email giving 15 days deadline.",
          "2. Lodge a police complaint under BNS Section 329 if locked out or belongings seized.",
          "3. File a summary suit for recovery of money under Order 37 of CPC in Civil Court.",
          "4. Approach Rent Authority / District Consumer Forum for unfair trade practice."
        ],
        documents_required: [
          "Original Rent / Lease Agreement & Renewal Slips",
          "Bank Transfer Slips / UPI Receipts of Security Deposit & Rent",
          "Written Handover Intimation / Vacating Email Notice",
          "Photos/Videos of Flat condition upon vacating"
        ],
        estimated_timeline: "15-30 days for Demand Notice response; 3-6 months for Rent Authority decree.",
        next_steps: [
          "Gather all bank transaction proofs showing initial deposit paid.",
          "Send statutory legal notice drafted by an advocate.",
          "Do not resort to illegal force; maintain paper trail."
        ]
      };
    } else if (lower.includes("salary") || lower.includes("employer") || lower.includes("job") || lower.includes("company") || lower.includes("termination") || lower.includes("notice period")) {
      result = {
        possible_issues: [
          "Non-Payment / Withholding of Earned Salary: Violation of employment agreement and labour statutes.",
          "Wrongful Termination: Dismissal without mandatory notice or due inquiry process.",
          "PF & ESI Non-Remittance: Default in depositing deducted statutory contributions."
        ],
        applicable_laws: [
          "Payment of Wages Act, 1936 - Section 15",
          "Industrial Disputes Act, 1947 / Industrial Relations Code 2020",
          "State Shops and Commercial Establishments Act",
          "Indian Contract Act, 1872 - Section 73"
        ],
        process_steps: [
          "1. Send formal internal representation to HR / Management requesting immediate clearance.",
          "2. Issue a legal notice through an advocate giving 15 days to settle dues.",
          "3. File a complaint before the Labour Commissioner / Conciliation Officer.",
          "4. File a claim under Payment of Wages Act for recovery with 10x penalty."
        ],
        documents_required: [
          "Appointment Letter & Salary Slip Copies",
          "Bank Statements reflecting last salary credit dates",
          "Resignation / Termination Email Correspondence",
          "Form 16 / PF Member Passbook statement"
        ],
        estimated_timeline: "15 days for legal notice; 2-4 months for Labour Commissioner conciliation.",
        next_steps: [
          "Download official PF statement from EPFO portal to check deposit status.",
          "Send legal demand notice to directors & HR head.",
          "File grievance on Samadhan Labour portal."
        ]
      };
    } else if (lower.includes("property") || lower.includes("land") || lower.includes("encroachment") || lower.includes("boundary") || lower.includes("plot")) {
      result = {
        possible_issues: [
          "Encroachment & Illegal Possession: Unauthorized construction or occupation of land.",
          "Cloud on Title: Disputed land boundary or fraudulent registry entry.",
          "Criminal Trespass: Entering private land with intent to intimidate or usurp."
        ],
        applicable_laws: [
          "Specific Relief Act, 1963 - Section 5 & 6 (Recovery of Possession)",
          "Bharatiya Nyaya Sanhita (BNS) 2023 - Section 329 & 331 (Trespass & Forgery)",
          "Bharatiya Nagarik Suraksha Sanhita (BNSS) - Section 164 (Dispute concerning land/water)",
          "State Land Revenue Code"
        ],
        process_steps: [
          "1. Submit application to District Collector / Tehsildar for official land survey and measurement.",
          "2. File an FIR under BNS Sections for Criminal Trespass and Illegal Demolition.",
          "3. File a Civil Suit for Mandatory Injunction & Recovery of Possession in District Court.",
          "4. Apply for interim stay order (Temporary Injunction under Order 39 Rules 1 & 2)."
        ],
        documents_required: [
          "Registered Sale Deed / Title Deed",
          "Khasra / Khatauni / Revenue Records & Mutation Copy",
          "Government Land Demarcation & Survey Report",
          "Photographs & Geo-tagged Video Evidence of Encroachment"
        ],
        estimated_timeline: "1-3 months for land survey; 7-14 days for interim stay order in Civil Court.",
        next_steps: [
          "Apply immediately to Revenue Inspector for official measurement.",
          "File application for temporary injunction to stop ongoing construction.",
          "Lodge written complaint with Station House Officer (SHO)."
        ]
      };
    } else if (lower.includes("cheat") || lower.includes("fraud") || lower.includes("online") || lower.includes("scam") || lower.includes("cyber") || lower.includes("bank") || lower.includes("money")) {
      result = {
        possible_issues: [
          "Cyber Financial Fraud & Identity Theft: Unauthorized bank debit / phishing scam.",
          "Cheating & Dishonest Inducement: Misrepresenting facts to fraudulently obtain money.",
          "Criminal Breach of Trust: Misappropriation of entrusted funds."
        ],
        applicable_laws: [
          "Information Technology (IT) Act, 2000 - Section 66D (Cheating by Impersonation)",
          "Bharatiya Nyaya Sanhita (BNS) 2023 - Section 318 (Cheating) & Section 316 (Breach of Trust)",
          "RBI Circular on Zero Liability for Unauthorized Electronic Banking Transactions"
        ],
        process_steps: [
          "1. Immediately call 1930 (Cyber Crime Helpline) and report transaction to block funds.",
          "2. Submit formal written complaint at national cybercrime portal (cybercrime.gov.in).",
          "3. Intimate Bank Branch in writing within 3 days for zero-liability protection.",
          "4. Lodge FIR with local Cyber Crime Police Station."
        ],
        documents_required: [
          "Bank Statement showing disputed debit entry",
          "SMS / Email transaction alerts received",
          "Screenshots of chat history, caller IDs, or phishing links",
          "Cyber Complaint Acknowledgement Copy"
        ],
        estimated_timeline: "Immediate 24-48 hours for 1930 helpline freeze; 30-90 days for bank resolution.",
        next_steps: [
          "Report immediately on National Cyber Crime Portal (cybercrime.gov.in).",
          "Submit copy of portal acknowledgment to Bank Manager within 72 hours.",
          "Obtain cyber police acknowledgement slip."
        ]
      };
    } else {
      result = {
        possible_issues: [
          "Civil / Statutory Liability: Potential violation of codified legal rights.",
          "Procedural Delay Risk: Statutory limitation deadlines for filing legal remedies.",
          "Lack of Written Documentation: Need for evidentiary proof under BSA 2023."
        ],
        applicable_laws: [
          "Bharatiya Nyaya Sanhita (BNS) 2023",
          "Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023",
          "Bharatiya Sakshya Adhiniyam (BSA) 2023",
          "Indian Contract Act, 1872 & Limitation Act, 1963"
        ],
        process_steps: [
          "1. Consolidate chronological timeline of events and communications.",
          "2. Serve formal written legal notice specifying facts, claims, and 15-day remedy period.",
          "3. Seek pre-institution mediation or conciliation where applicable.",
          "4. File appropriate petition/suit before competent Judicial Magistrate or Civil Court."
        ],
        documents_required: [
          "All relevant written contracts, agreements, or written communications",
          "Proof of payments, bank statements, or official receipts",
          "Government photo ID & address proof"
        ],
        estimated_timeline: "15-30 days for legal notice response; 6-12 months for formal judicial proceedings.",
        next_steps: [
          "Prepare a detailed written timeline of all events.",
          "Consult a specialist advocate to draft a legal notice.",
          "Maintain copies of all notices sent by Registered Post with AD."
        ]
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Insights API Error:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
