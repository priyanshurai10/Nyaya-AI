import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { situation } = body;

    if (!situation) {
      return NextResponse.json(
        { error: 'Situation description is required' },
        { status: 400 }
      );
    }

    // Hardcoded robust mock response
    const mockResponse = {
      possible_issues: [
        "Breach of Contract: The failure to deliver goods on time may constitute a material breach.",
        "Damages for Delay: Financial losses incurred due to the delay might be recoverable.",
        "Force Majeure Applicability: Assessing if unforeseen events excuse the delay."
      ],
      applicable_laws: [
        "Indian Contract Act, 1872 - Section 73 (Compensation for loss or damage caused by breach of contract)",
        "Sale of Goods Act, 1930 - Section 11 (Stipulations as to time)",
        "Specific Relief Act, 1963"
      ],
      process_steps: [
        "1. Send a formal Legal Notice demanding performance or compensation.",
        "2. Wait for the stipulated reply period (usually 15-30 days).",
        "3. Explore Mediation or Arbitration if there is an ADR clause in the contract.",
        "4. File a Civil Suit for breach of contract and damages in the competent court."
      ],
      documents_required: [
        "Original Executed Contract / Agreement",
        "All correspondence (Emails, letters, messages) regarding delivery dates",
        "Invoices, receipts, and proof of payment",
        "Evidence of financial loss suffered due to the delay (e.g., lost contracts, extra expenses)"
      ],
      estimated_timeline: "6 to 18 months for initial court proceedings; 1-3 months for arbitration/mediation.",
      next_steps: [
        "Gather and organize all relevant documents and communications.",
        "Consult with a civil litigation lawyer to draft a strong legal notice.",
        "Avoid making any statements to the other party that might waive your rights."
      ]
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json(mockResponse);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
