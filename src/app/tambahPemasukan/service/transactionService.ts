import config from "@/src/config";
import { CreateTransactionRequest } from "../types/transaction";

export const TransactionService = {
    async createTransaction(transactionData: CreateTransactionRequest, accessToken: string) {
        
      const response = await fetch(`${config.apiUrl}/transaksi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(transactionData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create transaction');
      }
  
      return await response.json();
    }
  };