from app.agents.legal import LegalAnalysisResult

def get_fallback_legal_response(query: str, mother_mode: bool = False) -> LegalAnalysisResult:
    q = query.lower().strip()
    
    # 0. Greetings / General Conversation
    greetings = ['hi', 'hello', 'hey', 'namaste', 'helo', 'hola', 'greetings', 'who are you', 'what is this', 'about', 'help']
    if any(q == g or q.startswith(g + " ") for g in greetings) or len(q) < 4:
        if mother_mode:
            return LegalAnalysisResult(
                response=(
                    "Namaste beta! Main **Nyaya AI** hoon, tumhara pyara legal assistant. "
                    "Main yahan tumhari madad karne ke liye hoon taaki tum aasani se kisi bhi kanooni matter, notice, "
                    "ya police complaint ko bilkul aasan bhasha me samajh sako. "
                    "Mujhe batao beta, aaj kya dikkat hai? Tumhe kis chiz ke baare me janna hai?"
                ),
                laws_cited=[],
                sections_cited=[],
                next_steps=[
                    "Apne sawal ko simple Hindi ya Hinglish me likhein (jaise: 'FIR kaise likhein' ya 'makan malik deposit nahi de raha').",
                    "Aap toggle par click karke 'Expert' ya 'Mother' Mode ke beech switch kar sakte hain."
                ]
            )
        else:
            return LegalAnalysisResult(
                response=(
                    "Hello! Welcome to **Nyaya AI**, India's Multilingual Legal Operating System. "
                    "I am designed to help ordinary citizens comprehend contracts, court notices, consumer issues, FIRs, and general legal procedures in simple language. "
                    "Please state your query or describe your situation (e.g., 'What are my rights under arrest?' or 'Landlord deposit dispute') to begin."
                ),
                laws_cited=[],
                sections_cited=[],
                next_steps=[
                    "Type a query about Indian law in English, Hindi, or Hinglish.",
                    "Toggle 'Mother Mode' at the top for simpler, jargon-free explanations."
                ]
            )

    # 1. Landlord / Tenant Disputes
    if any(k in q for k in ['landlord', 'deposit', 'rent', 'tenant', 'agreement', 'makan malik', 'kiraya']):
        if mother_mode:
            return LegalAnalysisResult(
                response=(
                    "Mummy, chinta mat karo! Landlord aapka security deposit bina vajah nahi rakh sakta. "
                    "Kanoon kehta hai ki lease khatam hone par unhe deposit wapas dena hoga. "
                    "Sirf agar ghar me kuch sach me tuta ho toh uska paisa kat sakta hai, normal purane hone (wear and tear) ka paisa nahi kat sakta. "
                    "Aap Rent Authority ke paas iski shikayat kar sakti hain, ye bilkul aasan hai aur isme koi kharch nahi hota. "
                    "Aapke paas rent agreement aur payment receipts hain, isliye aap bilkul safe hain."
                ),
                laws_cited=["Model Tenancy Act, 2021", "Transfer of Property Act, 1882"],
                sections_cited=["Section 9 — Model Tenancy Act", "Section 108 — Transfer of Property Act"],
                next_steps=[
                    "Makan malik ko ek pyara sa written notice bhejein ki aap deposit wapas chahte hain.",
                    "Agar wo na mane toh Rent Authority me complaint file karein.",
                    "Apne saare rent receipts aur agreement ko ek file me secure rakhein."
                ]
            )
        else:
            return LegalAnalysisResult(
                response=(
                    "Under Section 108 of the **Transfer of Property Act, 1882**, a landlord is legally obligated to return "
                    "the security deposit upon the termination of the lease, subject only to deductions for actual damages. "
                    "Deductions for normal wear and tear are unlawful. Furthermore, under the **Model Tenancy Act, 2021** "
                    "(Section 9), the security deposit for residential properties is capped at a maximum of two months' rent, "
                    "and must be refunded within one month of the tenant vacating the premises. If the landlord arbitrarily "
                    "withholds the deposit, you can file a petition before the Rent Authority/Rent Court."
                ),
                laws_cited=["Transfer of Property Act, 1882", "Model Tenancy Act, 2021"],
                sections_cited=["Section 108 — Transfer of Property Act", "Section 9 — Model Tenancy Act"],
                next_steps=[
                    "Send a formal written notice to the landlord demanding the refund of the security deposit within 15 days.",
                    "If non-compliant, file a dispute resolution application before the Rent Authority.",
                    "Gather all proofs of tenancy, including the registered rent agreement and bank statements."
                ]
            )
            
    # 2. FIR Filing
    elif any(k in q for k in ['fir', 'police', 'complaint', 'thana', 'report', 'police station']):
        if mother_mode:
            return LegalAnalysisResult(
                response=(
                    "Mummy, police ko FIR likhni hi padegi, wo mana nahi kar sakte! "
                    "Naye kanoon (BNSS) ke mutabik agar koi bada crime hua hai, toh police thane me FIR darj karna mandatory hai. "
                    "Agar wo mana karein, toh hum SP (Superintendent of Police) ko letter likh sakte hain ya online bhi file kar sakte hain. "
                    "Ek aur achhi baat: hum kisi bhi police station me FIR likhwa sakte hain (jise Zero FIR kehte hain), chahe crime kahi bhi hua ho."
                ),
                laws_cited=["Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023"],
                sections_cited=["Section 173 — BNSS (mandatory FIR registration)"],
                next_steps=[
                    "Ek saaf paper par complaint ki details likhkar nearest police station jayein.",
                    "Police officer se FIR ki copy maangein — ye bilkul free milti hai.",
                    "Agar thane me na likhe, toh speed post se SP officer ko apni shikayat bhejein."
                ]
            )
        else:
            return LegalAnalysisResult(
                response=(
                    "Under **Section 173 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023** (which replaced Section 154 of the CrPC), "
                    "it is mandatory for a police officer to register a First Information Report (FIR) for any cognizable offense. "
                    "Refusing to do so is a punishable offense under Section 166A of the IPC/BNS. Furthermore, under the 'Zero FIR' protocol, "
                    "a police station must record the complaint regardless of jurisdiction and subsequently transfer it to the concerned station. "
                    "If the police refuse to register the FIR, you can write to the Superintendent of Police (SP) or file a magistrate application."
                ),
                laws_cited=["Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023", "Indian Penal Code / BNS"],
                sections_cited=["Section 173 — BNSS", "Section 166A — IPC/BNS"],
                next_steps=[
                    "Draft a clear written complaint with dates, times, and description of the incident.",
                    "Submit it to the Station House Officer (SHO) and demand a stamped acknowledgement copy.",
                    "If refused, dispatch the complaint to the District Superintendent of Police (SP) via Registered Post."
                ]
            )
            
    # 3. Arrest / Police custody
    elif any(k in q for k in ['arrest', 'jail', 'custody', 'police station', 'police pakda']):
        if mother_mode:
            return LegalAnalysisResult(
                response=(
                    "Mummy, ghabrao mat, hamare samvidhan me arrest hone par bahut saare rights diye gaye hain. "
                    "Sabse pehle, police ko arrest karne ka sachha reason batana hoga. "
                    "Aur police kisi ko bhi 24 ghante se jyada lockup me nahi rakh sakti — unhe magistrate ke samne pesh karna hi hoga. "
                    "Mahilayon ko suraj dubne ke baad aur suraj ugne se pehle arrest nahi kiya ja sakta, aur sirf female police officer hi unhe touch kar sakti hai. "
                    "Hame turant apne lawyer se baat karne ka right hai."
                ),
                laws_cited=["Constitution of India", "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023"],
                sections_cited=["Article 22 — Constitution of India", "Section 47 — BNSS (Right to Bail)"],
                next_steps=[
                    "Arrest karne wale police officer se unka ID card aur arrest warrant (agar non-cognizable hai) maangein.",
                    "Apne kisi family member ya vakeel ko turant call karke arrest ki information dein.",
                    "Police custody me chup rahein aur bolein ki main sirf apne vakeel ki presence me baat karunga/karungi."
                ]
            )
        else:
            return LegalAnalysisResult(
                response=(
                    "Under **Article 22 of the Constitution of India**, any arrested person has the fundamental right to be informed "
                    "of the grounds of arrest, the right to consult and be defended by a legal practitioner of their choice, and "
                    "the right to be produced before the nearest Magistrate within 24 hours of arrest. "
                    "Furthermore, as per the Supreme Court's guidelines in *D.K. Basu v. State of West Bengal*, the arresting officer "
                    "must wear clear identification, prepare an arrest memo signed by at least one witness, and allow a medical check. "
                    "Women cannot be arrested after sunset and before sunrise except under exceptional circumstances with prior magistrate permission."
                ),
                laws_cited=["Constitution of India", "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023"],
                sections_cited=["Article 22 — Constitution of India", "Section 47 — BNSS (Bail availability)", "D.K. Basu Guidelines"],
                next_steps=[
                    "Request the Arrest Memo and ensure it includes the time, date, and name of a witnessing relative.",
                    "Demand a medical examination to document physical status at the time of arrest.",
                    "Contact a relative or legal aid advocate immediately to arrange bail."
                ]
            )

    # 4. Consumer Complaint
    if any(k in q for k in ['consumer', 'complaint', 'shopkeeper', 'dukan', 'defect', 'refund', 'product', 'quality', 'seller']):
        if mother_mode:
            return LegalAnalysisResult(
                response=(
                    "Mummy, agar kisi dukan-dar ya company ne aapko galat ya kharab saman becha hai, toh darna bilkul nahi hai! "
                    "**Consumer Protection Act, 2019** ke mutabik aapke paas 'Consumer Rights' (Grahak Adhikar) hain. "
                    "Aap asani se consumer helpline me call karke shikayat darj kara sakti hain jo bilkul free hai. "
                    "Agar wo replacement ya paise dene se mana karein, toh hum e-daakhil portal par online complaint file kar sakte hain, "
                    "aur court ke chakkar lagane ki bhi zaroori nahi padegi."
                ),
                laws_cited=["Consumer Protection Act, 2019"],
                sections_cited=["Section 2(7) — Consumer Rights", "Section 34 — District Commission Jurisdiction"],
                next_steps=[
                    "National Consumer Helpline number **1915** par call karke apni shikayat register karein.",
                    "Saman ki bill, photo, ya defective product ki video sambhal ke rakhein.",
                    "Seller ko written message ya email bhejein ki aap refund ya replacement chahte hain."
                ]
            )
        else:
            return LegalAnalysisResult(
                response=(
                    "Under the **Consumer Protection Act, 2019**, any buyer experiencing product defects, deficient services, "
                    "or unfair trade practices is protected as a 'Consumer' (Section 2(7)). "
                    "A consumer is entitled to replacement, refund, or compensation. If a retailer or service provider refuses to resolve "
                    "the issue, you have the right to lodge a complaint with the National Consumer Helpline or file a formal case "
                    "online via the e-Daakhil portal with the District Consumer Commission under Section 34 of the Act."
                ),
                laws_cited=["Consumer Protection Act, 2019"],
                sections_cited=["Section 2(7) — Definition of Consumer", "Section 34 — District Consumer Commission Jurisdiction"],
                next_steps=[
                    "Lodge a complaint on the National Consumer Helpline website (consumerhelpline.gov.in) or call 1915.",
                    "Send a formal pre-litigation notice via Registered Post or Email to the merchant, giving them 15 days to resolve.",
                    "If unresolved, draft and file a consumer petition on the e-Daakhil portal."
                ]
            )

    # 5. Cyber Fraud / Online Scam
    if any(k in q for k in ['online fraud', 'cyber', 'scam', 'money lost', 'hack', 'upi', 'phishing', 'otp', 'fraud', 'bank']):
        if mother_mode:
            return LegalAnalysisResult(
                response=(
                    "Mummy, chinta mat karo! Agar online account se paise kat gaye hain ya koi scam hua hai, toh hume turant action lena hoga. "
                    "Bharat sarkar ka helpline number **1930** hai, jispar call karke hum bank transaction ko freeze karwa sakte hain. "
                    "Iski complaint hum **cybercrime.gov.in** par bhi online file kar sakte hain. "
                    "Aapke saare screenshots aur bank sms proofs hume safe rakhne honge."
                ),
                laws_cited=["Information Technology Act, 2000", "Bharatiya Nyaya Sanhita (BNS), 2023"],
                sections_cited=["Section 66D — IT Act (Cheating by Personation)", "Section 318 — BNS (Cheating)"],
                next_steps=[
                    "Turant helpline number **1930** par call karke transaction freeze karne ki request karein.",
                    "Official portal **cybercrime.gov.in** par jaakar full detail me online complaint file karein.",
                    "Apne bank ko inform karein aur card/account block karwayein."
                ]
            )
        else:
            return LegalAnalysisResult(
                response=(
                    "In the event of financial cyber fraud or online scams, time is critical. Under the **Information Technology Act, 2000** "
                    "(Section 66D) and the **Bharatiya Nyaya Sanhita (BNS), 2023** (Section 318), cheating by personation and online theft "
                    "are cognizable offenses. Your first priority is to report the incident to freeze the stolen funds. "
                    "A complaint must be registered immediately via the National Cyber Crime Portal or the toll-free helpline."
                ),
                laws_cited=["Information Technology Act, 2000", "Bharatiya Nyaya Sanhita (BNS), 2023"],
                sections_cited=["Section 66D — IT Act", "Section 318 — BNS (Cheating)"],
                next_steps=[
                    "Call the National Cyber Crime Helpline at **1930** within the first 2 hours ('golden hour') of the transaction.",
                    "Submit a formal complaint online at cybercrime.gov.in along with transaction IDs, screenshots, and bank statements.",
                    "Submit a written dispute form (Chargeback form) at your bank branch to claim liability protection."
                ]
            )

    # 6. Property Dispute
    if any(k in q for k in ['property', 'dispute', 'land', 'kabza', 'encroachment', 'will', 'registry', 'partition']):
        if mother_mode:
            return LegalAnalysisResult(
                response=(
                    "Mummy, property ke disputes thode lambe chalte hain par darna nahi hai. "
                    "Agar koi hamari jameen ya ghar par jabardasti kabza karne ki koshish kare, toh hamare paas rights hain. "
                    "Hum police me complaint kar sakte hain aur civil court me 'Injunction Order' (kabza rokne ka order) maang sakte hain. "
                    "Hume bas registry ke papers aur property tax ki receipts sambhal kar rakhni hongi."
                ),
                laws_cited=["Code of Civil Procedure, 1908", "Specific Relief Act, 1963"],
                sections_cited=["Section 9 — Code of Civil Procedure", "Section 6 — Specific Relief Act"],
                next_steps=[
                    "Tehsildar ya local SDM office me boundary measurement aur encroachment ki complaint karein.",
                    "Civil court me permanent injunction suit file karein taaki property status safe rahe.",
                    "Property registry, mutation copy, aur current bills/receipts ka set taiyar karein."
                ]
            )
        else:
            return LegalAnalysisResult(
                response=(
                    "Property and land disputes are governed under the **Code of Civil Procedure, 1908** (Section 9) and the "
                    "**Specific Relief Act, 1963**. If there is an issue of unauthorized possession or illegal encroachment, "
                    "Section 6 of the Specific Relief Act allows dispossesed owners to recover possession by filing a civil suit. "
                    "Additionally, you can petition the civil court for a temporary or permanent injunction to protect title interests."
                ),
                laws_cited=["Code of Civil Procedure, 1908", "Specific Relief Act, 1963"],
                sections_cited=["Section 9 — CPC (Civil Juris)", "Section 6 — Specific Relief Act (Recovery of Possession)"],
                next_steps=[
                    "Verify mutation records (Jamabandi/Khatauni) at the local Land Revenue department.",
                    "File a suit for Declaration of Title and Possession or seek an Injunction Order from the local Civil Judge.",
                    "Lodge a police complaint if there is an active threat of criminal trespass under BNS."
                ]
            )

    # 7. Employment / Salary Delay
    if any(k in q for k in ['salary', 'company', 'boss', 'job', 'payment', 'salary delay', 'work', 'labor', 'employee']):
        if mother_mode:
            return LegalAnalysisResult(
                response=(
                    "Mummy, agar company salary dene me nakhre kar rahi hai, toh ye bilkul gair-kanooni hai. "
                    "Kanoon kehta hai ki employee ko unka kaam karne par salary milni hi chahiye. "
                    "Hum company ke boss ko formal written warning (legal notice) bhej sakte hain. "
                    "Agar fir bhi na dein, toh labor commissioner office me iski complaint kar sakte hain jo turant action lete hain."
                ),
                laws_cited=["Payment of Wages Act, 1936", "Industrial Disputes Act, 1947"],
                sections_cited=["Section 15 — Payment of Wages Act", "Section 2A — Industrial Disputes Act"],
                next_steps=[
                    "Company boss ko formal legal notice bhejein aur 15 din ka time dein salary release karne ke liye.",
                    "Labor Commissioner office me written complaint submit karein.",
                    "Apne offer letter, bank statements, aur attendance/email proof ko collect karein."
                ]
            )
        else:
            return LegalAnalysisResult(
                response=(
                    "Non-payment or delayed payment of salary is a serious violation. Under the **Payment of Wages Act, 1936** "
                    "(Section 15), an employee can file an application for recovery of delayed wages along with compensation. "
                    "For disputes regarding wrongful termination or contract breach, remedies lie under the **Industrial Disputes Act, 1947**. "
                    "A formal legal notice is typically the first step before initiating labor commissioner or labor court proceedings."
                ),
                laws_cited=["Payment of Wages Act, 1936", "Industrial Disputes Act, 1947"],
                sections_cited=["Section 15 — Payment of Wages", "Section 2A — Industrial Disputes Act"],
                next_steps=[
                    "Send a legal notice for non-payment of dues through an advocate, demanding payment within 15 days.",
                    "Lodge a complaint with the local Labor Commissioner/Labor Conciliation Officer.",
                    "Compile job records including the employment contract, payslips, appraisal letters, and email threads."
                ]
            )

    # General fallback
    if mother_mode:
        return LegalAnalysisResult(
            response=(
                "Namaste! Mujhe aapki problem samajh aa gayi hai. Kanoon hamari madad ke liye hai, isliye bilkul chinta mat karo. "
                "Bharat me har nagarik ke paas fundamental rights hote hain jo unhe kisi bhi shoshan (exploitation) se bachate hain. "
                "Mujhe thodi aur details batao jaise ki: kab kya hua tha? Kya koi paper signed hai? "
                "Taki main aapko aur behtar bata saku ki aage kya karna hai."
            ),
            laws_cited=["Constitution of India"],
            sections_cited=["Article 14 — Right to Equality", "Article 21 — Right to Life & Liberty"],
            next_steps=[
                "Saare documents aur proofs ko sambhal ke rakhein.",
                "Mujhe dispute ki aur details batayein (jaise dates, amount, etc.).",
                "Kisi qualified local vakeel se milkar legal consultation lein."
            ]
        )
    else:
        return LegalAnalysisResult(
            response=(
                "Thank you for contacting Nyaya AI. I have registered your query regarding this legal issue. "
                "Under Indian Jurisprudence, every citizen is guaranteed protection of their rights and interests. "
                "To provide you with specific statutory references (such as from the BNS, BNSS, or civil acts), "
                "please share additional facts regarding your case (such as written contracts, specific timeline, or notifications received). "
                "Please note that under the law, preserving documentary evidence is essential for establishing any legal claim."
            ),
            laws_cited=["Constitution of India"],
            sections_cited=["Article 21 — Protection of Life and Personal Liberty"],
            next_steps=[
                "Organize and preserve all written communications, contracts, and receipts related to the dispute.",
                "Provide more specific details of your query to Nyaya AI for specialized analysis.",
                "Consult a legal professional for formal representation."
            ]
        )
