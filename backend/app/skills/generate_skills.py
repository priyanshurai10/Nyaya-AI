import os

SKILLS = [
    {
        "id": "fir_skill",
        "name": "FIR Filing & Rights Guidance",
        "description": "Guides citizens in drafting, registering, and understanding First Information Reports (FIR) under the Bharatiya Nagarik Suraksha Sanhita (BNSS) / CrPC.",
        "triggers": ["fir", "police", "complaint", "thana", "police station", "register complaint", "zero fir", "f.i.r.", "police report"],
        "positive": [
            "How to file an FIR at the police station?",
            "Police refused to write my complaint, what to do?",
            "What is a Zero FIR?"
        ],
        "negative": [
            "My landlord did not refund my security deposit.",
            "I want to file a consumer court case."
        ],
        "workflow": [
            "1. Gather detailed facts: Date, time, location, persons involved, and description of the incident.",
            "2. Determine if the offence is Cognizable (police must register FIR) or Non-Cognizable (police log in diary).",
            "3. Draft a clear written complaint to the Station House Officer (SHO).",
            "4. Go to the police station or use State Police e-portal for e-FIR.",
            "5. If refused, escalate to the Superintendent of Police (SP) under Section 173(4) BNSS / 154(3) CrPC.",
            "6. If still unresolved, file a petition before the Judicial Magistrate under Section 175(3) BNSS / 156(3) CrPC."
        ],
        "risk_logic": "Check for: Delay in reporting (causes suspicion), non-cognizable classification (police will not investigate without court order), and refusal of free FIR copy.",
        "output_format": "Provide: Summary of rights, specific BNSS sections, step-by-step filing guide, and a draft complaint template.",
        "references": ["Section 173 BNSS (Section 154 CrPC) - Registration of FIR", "Section 175 BNSS (Section 156 CrPC) - Magistrate powers", "Section 166A IPC/BNS - Punishment for public servant refusing to file FIR"],
        "assets": ["Written complaint template to SHO", "Escalation letter format to SP", "Magistrate petition template under Section 156(3)"]
    },
    {
        "id": "legal_notice_skill",
        "name": "Legal Notice Drafting & Reply",
        "description": "Assists users in understanding legal notices they have received, drafting responses, or issuing a legal notice for claims.",
        "triggers": ["legal notice", "notice", "demand notice", "notice reply", "respond to notice", "send notice", "issue notice"],
        "positive": [
            "I received a legal notice from my landlord.",
            "How to draft a legal notice for unpaid salary?",
            "Is it mandatory to reply to a legal notice?"
        ],
        "negative": [
            "Police arrested my brother without warrant.",
            "What is the stamp duty on land?"
        ],
        "workflow": [
            "1. Read the notice carefully to identify the sender, cause of action, and demands.",
            "2. Calculate the response deadline (typically 15 or 30 days).",
            "3. Gather matching evidence (agreements, receipts, emails).",
            "4. Draft a point-by-point reply notice denying false claims and asserting counter-rights.",
            "5. Send via Registered Post AD or Speed Post, and retain proof of delivery."
        ],
        "risk_logic": "Check for: Exceeding deadline (adverse inference in court), admitting liability implicitly, and ignoring notice (court can pass ex-parte orders).",
        "output_format": "Provide: Specific claims summary, deadlines list, reply strategy, and standard response template.",
        "references": ["Section 80 CPC - Notice against government", "Section 138 Negotiable Instruments Act - Cheque bounce notice", "Indian Contract Act, 1872 - Breach of terms notice"],
        "assets": ["Standard Reply template", "Cheque Bounce Reply template", "Demand Notice template"]
    },
    {
        "id": "rent_agreement_skill",
        "name": "Rent Agreement Analysis",
        "description": "Reviews rent agreements and leases, identifies unfavorable clauses, and assesses tenant security deposits.",
        "triggers": ["rent agreement", "lease", "tenant agreement", "security deposit", "kirayanama", "lease deed", "rent clause"],
        "positive": [
            "Check my rent agreement for hidden charges.",
            "Is a 3-month security deposit standard in Delhi?",
            "What happens if my lease agreement is not registered?"
        ],
        "negative": [
            "My wife has filed for divorce.",
            "How to apply for an online passport?"
        ],
        "workflow": [
            "1. Identify parties (Lessor/Landlord and Lessee/Tenant) and property details.",
            "2. Verify rent amount, payment due dates, and escalation clauses.",
            "3. Check security deposit amount and refund terms.",
            "4. Identify eviction triggers, notice periods, and lock-in duration.",
            "5. Advise on registration (mandatory for leases exceeding 11 months under Registration Act, 1908)."
        ],
        "risk_logic": "Check for: High security deposit (above state standard), lack of eviction notice period, high late-payment interest, and unregistered lease exceeding 11 months.",
        "output_format": "Provide: Summary of lease terms, risk score (0-100), flagged clauses list, and negotiation guidelines.",
        "references": ["Section 107 Transfer of Property Act - Registration requirement", "Model Tenancy Act, 2021 - Security deposit cap", "State Rent Control Acts"],
        "assets": ["Standard Rent Agreement template", "Security Deposit Demand template", "Termination Notice template"]
    },
    {
        "id": "consumer_complaint_skill",
        "name": "Consumer Rights & Complaints",
        "description": "Guides citizens on filing complaints against defective goods or deficient services before the Consumer Forum.",
        "triggers": ["consumer complaint", "consumer forum", "consumer court", "defective product", "refund deny", "unfair trade", "e-daakhil", "shopkeeper fraud"],
        "positive": [
            "Amazon delivered a broken phone and is refusing refund.",
            "How to file a case in the District Consumer Commission?",
            "Airline canceled my ticket and won't compensate."
        ],
        "negative": [
            "My relative is arrested by the police.",
            "I need an employment contract format."
        ],
        "workflow": [
            "1. Identify if the user is a 'Consumer' under the Act (purchased goods/services for personal use).",
            "2. Draft a formal grievance letter to the seller/merchant giving 15 days to resolve.",
            "3. If unresolved, determine jurisdiction (District: up to ₹50 Lakh, State: ₹50 Lakh - ₹2 Crore).",
            "4. Register on the e-Daakhil portal (edaakhil.nic.in).",
            "5. Draft the petition explaining the deficiency, attach proof (bill, emails, photographs), and file."
        ],
        "risk_logic": "Check for: Commercial use exclusion, limitation period (must file within 2 years of cause of action), and lack of purchase bill or invoice.",
        "output_format": "Provide: Legal rights summary, draft pre-litigation notice, and e-Daakhil filing checklist.",
        "references": ["Consumer Protection Act, 2019 - Section 2(7) (Definition)", "Consumer Protection Act, 2019 - Section 34 (Jurisdiction)", "Limitation Act - Section 69"],
        "assets": ["Pre-litigation Notice to Seller", "Consumer Court Petition template", "e-Daakhil user guide checklist"]
    },
    {
        "id": "cybercrime_skill",
        "name": "Cybercrime Recovery & Reporting",
        "description": "Helps victims of online scams, UPI fraud, phishing, and financial cybercrimes report cases and recover funds.",
        "triggers": ["cybercrime", "cyber fraud", "online scam", "upi fraud", "money lost online", "otp hack", "scam", "phishing", "cyber cell", "hacked"],
        "positive": [
            "I lost Rs. 40,000 to an online job scam yesterday.",
            "Someone hacked my bank account via OTP.",
            "Where to report UPI cyber fraud?"
        ],
        "negative": [
            "How to divide ancestral property?",
            "What is a Zero FIR?"
        ],
        "workflow": [
            "1. Urge immediate reporting: Call National Cyber Crime Helpline 1930 within the 'golden hour' (first 2 hours).",
            "2. Advise calling the bank immediately to freeze the beneficiary account / block cards.",
            "3. Take screenshots of transaction SMS, UPI IDs, payment proofs, and chat records.",
            "4. File a formal complaint online at cybercrime.gov.in or visit the local Cyber Crime Cell.",
            "5. Collect the acknowledgment report and submit a chargeback dispute form at the home bank."
        ],
        "risk_logic": "Check for: Delay in reporting (decreases chance of freezing funds), sharing of sensitive credentials (may affect bank liability policy), and unofficial helpline scams.",
        "output_format": "Provide: Immediate checklist, 1930 helpline guidance, screenshot collection list, and draft dispute application to the bank.",
        "references": ["Information Technology Act, 2000 - Section 66D", "BNS, 2023 - Section 318 (Cheating)", "RBI Circular on Customer Liability in Unauthorized Electronic Transactions"],
        "assets": ["Bank Card Block application", "Bank Dispute Chargeback template", "Cyber Cell written complaint format"]
    },
    {
        "id": "rti_skill",
        "name": "RTI Application Filing",
        "description": "Enables citizens to file Right to Information (RTI) applications to obtain official records from government authorities.",
        "triggers": ["rti", "right to information", "rti application", "file rti", "public information officer", "pio", "government records"],
        "positive": [
            "How to file an RTI to get road repair budget?",
            "Format of RTI for checking exam copy marks.",
            "Where to submit an RTI application?"
        ],
        "negative": [
            "Notice for cheque bounce received.",
            "How to apply for bail?"
        ],
        "workflow": [
            "1. Identify the public authority holding the information (e.g., Municipal Corp, Board of Education).",
            "2. Draft concise, clear questions focusing on records, documents, and logs rather than opinions.",
            "3. Address the application to the Public Information Officer (PIO) of that department.",
            "4. Attach the prescribed fee (usually Rs. 10 via postal order, stamp, or online payment).",
            "5. If no response in 30 days, file the First Appeal under Section 19(1) of the RTI Act."
        ],
        "risk_logic": "Check for: Vague or hypothetical questions (PIO can reject), personal/private third-party information (exempt under Sec 8(1)(j)), and national security exemptions.",
        "output_format": "Provide: PIO address tips, fee guidelines, draft RTI questions template, and First Appeal format.",
        "references": ["Right to Information Act, 2005 - Section 6 (Filing)", "Right to Information Act, 2005 - Section 8 (Exemptions)", "RTI Act - Section 19 (Appeals)"],
        "assets": ["Standard RTI Application format", "First Appeal petition template", "Fee payment instructions card"]
    },
    {
        "id": "property_dispute_skill",
        "name": "Property Dispute Resolution",
        "description": "Advises users on resolving land encroachment, property partition, title disputes, and boundary issues.",
        "triggers": ["property dispute", "land dispute", "encroachment", "partition suit", "illegal construction", "boundary dispute", "civil court", "title dispute"],
        "positive": [
            "My relatives are not giving me my share of ancestral land.",
            "Neighbor has illegally built a fence on my boundary.",
            "How to file a property partition suit?"
        ],
        "negative": [
            "UPI transaction failed and money debited.",
            "Notice for late rent payment."
        ],
        "workflow": [
            "1. Review property titles, sales deeds, mutation records, and tax receipts.",
            "2. Obtain fresh land survey measurements from licensed revenue officers.",
            "3. Send a formal legal warning/notice to the encroaching party.",
            "4. File a Civil Suit for Partition or Declaration of Title & Possession.",
            "5. Apply for a Temporary Injunction (Stay Order) under Order 39 Rules 1 & 2 of CPC."
        ],
        "risk_logic": "Check for: Limitation period (12 years for recovery of possession under Limitation Act), lack of registered deeds/mutation records, and immediate threats of dispossession.",
        "output_format": "Provide: Property rights review, civil suit checklist, temporary injunction guide, and legal notice template.",
        "references": ["Specific Relief Act, 1963 - Section 6", "Code of Civil Procedure, 1908 - Order 39", "Limitation Act, 1963 - Article 65"],
        "assets": ["Encroachment Legal Notice template", "Civil Partition Suit format", "Application for Temporary Injunction"]
    },
    {
        "id": "employment_law_skill",
        "name": "Employment Law & Disputes",
        "description": "Helps workers resolve salary delays, arbitrary terminations, bond disputes, PF withholding, and contract issues.",
        "triggers": ["employment law", "salary delay", "wrongful termination", "notice period", "provident fund", "gratuity", "harassment", "bond agreement", "termination"],
        "positive": [
            "My employer has not paid my salary for 3 months.",
            "Can a company enforce a 2-year employment bond?",
            "Fired without notice or severance pay."
        ],
        "negative": [
            "How to file a divorce case?",
            "Landlord eviction notice."
        ],
        "workflow": [
            "1. Read the employment contract carefully regarding notice period, salary terms, and bonds.",
            "2. Send a formal written email/demand letter to HR and the Managing Director.",
            "3. If ignored, draft and send a legal notice demanding outstanding dues within 15 days.",
            "4. File a complaint with the local Labor Commissioner/Conciliation Officer.",
            "5. If unresolved, proceed to file a petition before the Labor Court or Civil Court."
        ],
        "risk_logic": "Check for: Validity of employment bond (unreasonable restrictiveness is void under Section 27 Contract Act), notice period compliance, and lack of payslips or bank transfer records.",
        "output_format": "Provide: Employee rights summary, bond enforceability guide, labor officer list, and draft notice template.",
        "references": ["Payment of Wages Act, 1936 - Section 15", "Indian Contract Act, 1872 - Section 27 (Non-compete)", "Industrial Disputes Act, 1947"],
        "assets": ["Salary Demand notice template", "Reply to Employment Bond warning", "Labor Commissioner Complaint format"]
    },
    {
        "id": "court_notice_skill",
        "name": "Court Notice & Summons Reply",
        "description": "Assists users who have received official summons or notices from civil or criminal courts to file a proper legal reply.",
        "triggers": ["court notice", "summons", "civil summons", "criminal summons", "appear in court", "ex-parte", "negotiable instruments", "subpoena"],
        "positive": [
            "I got a summons from the magistrate court for cheque bounce.",
            "What if I don't appear in court after receiving notice?",
            "Notice for civil recovery suit appearance."
        ],
        "negative": [
            "My UPI payment got hacked.",
            "Where to submit an RTI?"
        ],
        "workflow": [
            "1. Examine the summons stamp, case number, court name, and signature for validity.",
            "2. Identify the date, time, and specific bench you must appear before.",
            "3. Gather all evidence contesting the claims of the petition.",
            "4. Hire an advocate or prepare to represent yourself (party-in-person).",
            "5. Draft and file a Written Statement (Civil) or Reply Affidavit (Criminal) on the date of hearing."
        ],
        "risk_logic": "Check for: Inaction (leads to ex-parte decree / arrest warrant), tight timelines (usually 30 days for Written Statement), and jurisdiction discrepancies.",
        "output_format": "Provide: Summary of court guidelines, case details sheet, ex-parte protection warning, and Written Statement draft template.",
        "references": ["Code of Civil Procedure, 1908 - Order VIII (Written Statement)", "Section 138 Negotiable Instruments Act", "BNSS, 2023 - Section 64 (Service of Summons)"],
        "assets": ["Written Statement template", "Vakalatnama format", "Adjournment petition format"]
    },
    {
        "id": "bail_guidance_skill",
        "name": "Bail & Custody Guidance",
        "description": "Provides step-by-step guidance on applying for regular bail or anticipatory bail, and understanding police arrest procedures.",
        "triggers": ["bail", "anticipatory bail", "arrest warrant", "police arrest", "custody", "bailable", "non-bailable", "police lockup"],
        "positive": [
            "How to file for anticipatory bail for Section 498A?",
            "My brother is arrested in an assault case, how to get bail?",
            "What is the difference between bailable and non-bailable offences?"
        ],
        "negative": [
            "Makan malik deposit nahi de raha.",
            "Consumer complaint registration."
        ],
        "workflow": [
            "1. Identify the FIR details and the specific sections applied by the police.",
            "2. Classify offences as Bailable (bail is a right at the police station) or Non-Bailable (discretion of court).",
            "3. If arrest is feared: File an Anticipatory Bail application in Sessions Court or High Court under Sec 482 BNSS / 438 CrPC.",
            "4. If already arrested: File a Regular Bail application under Sec 480 BNSS / 437 CrPC (Magistrate) or Sec 483 BNSS / 439 CrPC (Sessions).",
            "5. Arrange matching surety bonds and local sureties as requested by the court."
        ],
        "risk_logic": "Check for: Flight risk, tampering with witnesses, severity of charges, and delay in seeking anticipatory bail.",
        "output_format": "Provide: Arrest rights checklist (DK Basu), bail options analysis, surety bond requirements, and draft anticipatory bail petition.",
        "references": ["Section 480 BNSS (Section 437 CrPC) - Regular Bail", "Section 482 BNSS (Section 438 CrPC) - Anticipatory Bail", "D.K. Basu guidelines on Arrest"],
        "assets": ["Anticipatory Bail application template", "Surety Bond undertaking format", "Memo of Appearance format"]
    },
    {
        "id": "traffic_violation_skill",
        "name": "Traffic Violations & Challan",
        "description": "Guides citizens on paying traffic challans, handling license suspensions, and contesting illegal traffic fines.",
        "triggers": ["traffic violation", "challan", "traffic fine", "license suspend", "speeding ticket", "drunken driving", "traffic police"],
        "positive": [
            "I got an online speed challan from Delhi Traffic Police.",
            "How to challenge an incorrect traffic fine?",
            "License suspended for red light jumping, what to do?"
        ],
        "negative": [
            "How to get anticipatory bail?",
            "RTI filing fee."
        ],
        "workflow": [
            "1. Fetch challan details using registration number on the Parivahan e-Challan website (echallan.parivahan.gov.in).",
            "2. Verify the date, time, vehicle photo, and section under Motor Vehicles Act.",
            "3. If correct: Pay the fine online or attend Virtual Traffic Court to pay reduced fine.",
            "4. If incorrect or disputed: Refuse online payment and let it be sent to physical Traffic Court to contest before magistrate.",
            "5. For license suspensions: File representation at the regional RTO."
        ],
        "risk_logic": "Check for: Defaulting payment (leads to court summons or vehicle block in registry), compoundable vs non-compoundable offences (drunken driving requires court appearance).",
        "output_format": "Provide: MV Act sections, online payment steps, contestation template, and Virtual Court guide.",
        "references": ["Motor Vehicles Act, 1988 (Amended 2019)", "Section 185 MV Act - Drunken driving", "Section 112 MV Act - Overspeeding"],
        "assets": ["Contestation letter template to Traffic ACP", "RTO representation format for license release"]
    },
    {
        "id": "divorce_family_law_skill",
        "name": "Divorce & Family Disputes",
        "description": "Provides guidance on mutual consent divorce, maintenance claims, child custody, domestic violence petitions, and marriage registration.",
        "triggers": ["divorce", "maintenance", "alimony", "child custody", "domestic violence", "family dispute", "marriage registration", "guardianship"],
        "positive": [
            "What is the procedure for mutual consent divorce?",
            "How much maintenance can a wife claim?",
            "Filing custody case for 6-year-old child."
        ],
        "negative": [
            "Landlord cut off my water supply.",
            "Cheque bounce case reply."
        ],
        "workflow": [
            "1. Identify the applicable personal law based on religion (Hindu, Muslim, Christian, Special Marriage Act).",
            "2. For Mutual Divorce: Draft joint petition, file, attend first motion, wait 6 months cooling-off (unless waived), attend second motion.",
            "3. For Maintenance: File application under Section 144 BNSS / 125 CrPC or personal laws.",
            "4. For Domestic Violence: File petition under Protection of Women from Domestic Violence Act, 2005.",
            "5. Apply for interim custody of children if needed."
        ],
        "risk_logic": "Check for: Hiding income in assets statements (affidavit of assets is mandatory), desertion timelines (usually minimum 1 year separation required), and jurisdiction of family court.",
        "output_format": "Provide: Applicable personal law summary, step-by-step mutual divorce steps, maintenance estimation calculator, and draft petition template.",
        "references": ["Section 13B Hindu Marriage Act, 1955 - Mutual Divorce", "Section 144 BNSS (Section 125 CrPC) - Maintenance", "Domestic Violence Act, 2005"],
        "assets": ["Mutual Consent Divorce Joint Petition template", "Maintenance application format", "Affidavit of Assets and Liabilities format"]
    },
    {
        "id": "property_registration_skill",
        "name": "Property Registration & Stamp Duty",
        "description": "Guides users on stamp duty calculation, registration of sale deeds, gift deeds, wills, and mutation of property records.",
        "triggers": ["property registration", "stamp duty", "sale deed", "gift deed", "will registration", "sub-registrar", "registry", "property mutation"],
        "positive": [
            "How much is the stamp duty for a sale deed in Uttar Pradesh?",
            "How to register a gift deed?",
            "Steps for mutation of flat in Delhi."
        ],
        "negative": [
            "Fired from company without notice.",
            "Applying for anticipatory bail."
        ],
        "workflow": [
            "1. Obtain the circle rates for the specific locality from municipal/state registration portal.",
            "2. Calculate property value based on area, and compute required Stamp Duty (typically 4-8%) and Registration Fees (typically 1%).",
            "3. Buy e-stamp papers and draft the Sale/Gift Deed containing clear title declarations.",
            "4. Book an appointment online at the Sub-Registrar office.",
            "5. Attend the office with two witnesses, complete biometric authentication, and collect the registered deed copy.",
            "6. File for Mutation (Namantaran) in land revenue records to update municipal ownership."
        ],
        "risk_logic": "Check for: Under-valuation of property (constitutes tax evasion and leads to penalty), lack of encumbrance clearance, and delay in property mutation.",
        "output_format": "Provide: Circle rate calculation, stamp duty checklist, registration day guide, and draft sale deed format.",
        "references": ["Indian Stamp Act, 1899", "Registration Act, 1908", "State Land Revenue Acts"],
        "assets": ["Standard Sale Deed draft template", "Standard Gift Deed draft template", "Will draft template"]
    },
    {
        "id": "tenant_rights_skill",
        "name": "Tenant Eviction & Harassment Protection",
        "description": "Helps tenants defend against illegal evictions, utilities cut-off, security deposit withholding, and landlord harassment.",
        "triggers": ["tenant rights", "eviction notice", "tenant eviction", "landlord harassment", "utility cut", "deposit refund", "illegal eviction"],
        "positive": [
            "My landlord has cut my electricity to evict me.",
            "Can a landlord evict me without 30 days notice?",
            "Landlord refuses to return Rs. 1 Lakh security deposit."
        ],
        "negative": [
            "Traffic violation e-challan.",
            "How to file RTI query."
        ],
        "workflow": [
            "1. Review the active rent agreement to check the notice period and eviction clauses.",
            "2. Note: Under Rent Control Acts and Model Tenancy Act, arbitrary eviction is illegal during lease term.",
            "3. If utilities (water/power) are cut: File emergency petition before Rent Authority for immediate restoration.",
            "4. File a police complaint for criminal trespass or intimidation if landlord attempts forceful entry.",
            "5. Send a formal legal notice for the recovery of security deposit."
        ],
        "risk_logic": "Check for: Forceful dispossession threats, utilities disconnect (violates basic tenant laws), and failure to document payment of rent.",
        "output_format": "Provide: Tenant rights sheet, emergency utility restoration format, and security deposit demand notice.",
        "references": ["Model Tenancy Act, 2021 - Section 20 (Eviction)", "Model Tenancy Act, 2021 - Section 12 (Utilities)", "State Rent Control Acts"],
        "assets": ["Notice to Landlord for utilities restoration", "Security Deposit Recovery notice", "Eviction suit contestation statement"]
    },
    {
        "id": "women_safety_rights_skill",
        "name": "Women's Safety & Rights",
        "description": "Provides legal recourse and guidance on domestic violence, workplace sexual harassment (POSH), dowry harassment, equal wages, and maternity benefits.",
        "triggers": ["women safety", "domestic abuse", "posh", "harassment at work", "dowry", "maternity leave", "equal wages", "domestic violence"],
        "positive": [
            "Where to file a complaint for harassment at my corporate office?",
            "My in-laws are demanding dowry and abusing me.",
            "Am I eligible for paid maternity leave under Indian law?"
        ],
        "negative": [
            "Rent agreement stamp duty calculation.",
            "UPI transaction scam refund."
        ],
        "workflow": [
            "1. For Workplace Harassment: File complaint to the Internal Complaints Committee (ICC) under the POSH Act within 3 months.",
            "2. For Domestic Violence / Dowry: Register complaint with local Protection Officer or Police (Section 85/80 BNS / 498A IPC).",
            "3. Advise on absolute rights: Right to free legal aid, right to not be arrested at night, right to privacy during statement.",
            "4. For Maternity: Ensure eligibility (worked 80 days in past 12 months) and apply for 26 weeks paid leave."
        ],
        "risk_logic": "Check for: Retaliation at workplace (POSH Act protects against this), immediate safety threats (advise calling helpline 1091 / 181), and destruction of evidence.",
        "output_format": "Provide: Safety helplines card, POSH filing steps, BNS domestic abuse section summary, and draft POSH complaint.",
        "references": ["POSH Act, 2013 - Prevention of Sexual Harassment", "Section 85 BNS (Section 498A IPC) - Cruelty by Husband/In-laws", "Maternity Benefit Act, 1961"],
        "assets": ["Workplace POSH Complaint draft", "Police Domestic Abuse complaint format", "Emergency Protection Order application format"]
    }
]

def generate():
    base_dir = os.path.dirname(__file__)
    
    # Write __init__.py for package resolution
    with open(os.path.join(base_dir, "__init__.py"), "w", encoding="utf-8") as f:
        f.write("# Nyaya AI Reusable Agent Skills Package\n")
        
    for s in SKILLS:
        skill_dir = os.path.join(base_dir, s["id"])
        os.makedirs(skill_dir, exist_ok=True)
        os.makedirs(os.path.join(skill_dir, "references"), exist_ok=True)
        os.makedirs(os.path.join(skill_dir, "assets"), exist_ok=True)
        
        # Create placeholders
        with open(os.path.join(skill_dir, "references", "placeholder.txt"), "w", encoding="utf-8") as f:
            f.write(f"References for {s['name']}\nIncludes:\n" + "\n".join([f"- {ref}" for ref in s["references"]]) + "\n")
            
        with open(os.path.join(skill_dir, "assets", "placeholder.txt"), "w", encoding="utf-8") as f:
            f.write(f"Assets and templates for {s['name']}\nTemplates:\n" + "\n".join([f"- {asset}" for asset in s["assets"]]) + "\n")
            
        # Create SKILL.md
        skill_md_path = os.path.join(skill_dir, "SKILL.md")
        triggers_yaml = "\n".join([f"  - {t}" for t in s["triggers"]])
        positive_yaml = "\n".join([f"  - \"{p}\"" for p in s["positive"]])
        negative_yaml = "\n".join([f"  - \"{n}\"" for n in s["negative"]])
        workflow_steps_md = "\n".join([f"{step}" for step in s["workflow"]])
        references_md = "\n".join([f"- {ref}" for ref in s["references"]])
        assets_md = "\n".join([f"- {asset}" for asset in s["assets"]])
        
        content = f"""---
id: {s["id"]}
name: {s["name"]}
description: {s["description"]}
triggers:
{triggers_yaml}
positive_examples:
{positive_yaml}
negative_examples:
{negative_yaml}
---

# {s["name"]}

## Description
{s["description"]}

## Trigger Keywords & Triggers
The skill triggers when the query contains words like: {", ".join(s["triggers"])}.

### Positive Examples
{positive_yaml}

### Negative Examples
{negative_yaml}

## Workflow Steps
{workflow_steps_md}

## Risk Detection Logic
{s["risk_logic"]}

## Output Format
{s["output_format"]}

## References Structure
{references_md}

## Assets Structure
{assets_md}
"""
        with open(skill_md_path, "w", encoding="utf-8") as f:
            f.write(content)
            
    print(f"SUCCESS: Generated {len(SKILLS)} reusable agent skills in backend/app/skills/")

if __name__ == "__main__":
    generate()
