export const vaultItems = [
  {
    id: "vault-1",
    filename: "Property_Sale_Deed_Agreement.pdf",
    file_type: "application/pdf",
    upload_path: "/uploads/Property_Sale_Deed_Agreement.pdf",
    vault_category: "Property",
    file_size: 2450000,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "vault-2",
    filename: "Employment_Contract_2025.docx",
    file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    upload_path: "/uploads/Employment_Contract_2025.docx",
    vault_category: "Contracts",
    file_size: 1120000,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "vault-3",
    filename: "Rent_Deposit_Bank_Receipt.jpg",
    file_type: "image/jpeg",
    upload_path: "/uploads/Rent_Deposit_Bank_Receipt.jpg",
    vault_category: "Financial",
    file_size: 450000,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];
