# Document Analysis Specification

## Feature Description
The Document Analysis engine allows users to upload legal documents (PDF, DOCX, PNG, JPG, JPEG) to extract raw text via OCR or digital parsing and perform zero-hallucination analysis (summarization, risk scoring, extraction of key clauses, and recommended next steps).

## User Flow
1. **File Selection & Validation**:
   - User drops a document file in the UI.
   - Client checks file size and extension.
2. **Upload & Integrity Verification**:
   - File is sent to backend.
   - Backend performs magic bytes validation.
3. **Text Extraction (OCR/Parser)**:
   - Extract raw text using PDF/DOCX parses or image OCR.
   - Calculate OCR confidence score.
4. **AI Legal Analysis**:
   - Query LLM with safe prompt structures.
   - Parse summary, key points, risk levels, and legal actions.
   - Display results to the user.

## Business Rules
- **No File, No Analysis**: UI and API must explicitly reject analysis requests if no file has been successfully uploaded.
- **Strict Hallucination Control**: AI analysis prompts must bind responses strictly to the document text. The engine must never invent clauses, dates, or names that do not appear in the source file.
- **Human In the Loop (High Risk)**: Users must explicitly confirm any document sharing or legal filing actions initiated from the summary.

## Validation Rules
- **Extensions**: Whitelist is strictly `.pdf`, `.docx`, `.png`, `.jpg`, `.jpeg`.
- **File Size**: Absolute cap of 10MB per file.
- **Magic Bytes**: Check magic headers (e.g. `%PDF-` for PDFs, `PK\x03\x04` for DOCX).

## Error Handling
- **Low OCR Confidence**: If average text extraction character confidence is below 80%, flag a warning indicator: *"Low OCR confidence detected. Please verify extracted names and dates manually."*
- **Spoofed Extensions**: Block files that fail magic bytes validation, return `400 Bad Request`, and write a security audit event.

## Database Requirements
- Table: `documents`
  - Stores metadata, filename, type, size, upload path, and encrypted raw text.
- Table: `document_analyses`
  - Stores JSON structures of key clauses, risk levels, risk scores, summary, and action items.

## API Requirements
- `POST /api/v1/documents/upload`: Accepts file payload, runs integrity checks, saves to storage, and extracts text.
- `POST /api/v1/documents/analyze/{doc_id}`: Initiates LLM query, calculates risk ratings, and stores the results.

## Edge Cases
- **Non-Text Images**: If an uploaded PNG contains zero readable text, the system must abort and display: *"Document extraction failed. No readable text found. Please upload a clear image."*
- **Password-Protected Files**: Detect locked PDFs early, block extraction, and return a user-friendly error.

## Acceptance Criteria
- [x] Integrity middleware halts spoofed files.
- [x] Extraction failures are reported cleanly.
- [x] Hallucination prevention rules are hardcoded in system prompts.

---

## BDD Test Cases

### File Upload & Integrity Check Scenario
```gherkin
Given user selects a spoofed file "malware.exe" renamed as "agreement.pdf"
When user attempts to upload the file
Then the backend integrity scanner should run a magic bytes check
And detect that the file header signature is not a PDF
And block the upload with a 400 Bad Request response
And log a blocked security event in the audit trail
```

### Low OCR Confidence Scenario
```gherkin
Given user uploads a blurry image of a rental agreement
When the OCR engine processes the image
And the character confidence score evaluates to 72%
Then the analysis output should display the document details
And show a warning alert: "Low OCR confidence detected"
```

### Zero-File Analysis Block Scenario
```gherkin
Given user makes a direct API call to the document analysis endpoint with a blank document ID
When the backend processes the request
Then it should reject the request with a 422 Unprocessable Entity code
And never execute the LLM model
```
