export interface TransactionItem {
    product_id: number;
    quantity: number;
    harga_jual_saat_transaksi: number;
    harga_modal_saat_transaksi: number;
  }
  
  export type CreateTransactionRequest = {
    transaction_type: 'Penjualan' | 'Pembelian' | string;
    category: 'Penjualan Barang' | 'Pembelian Stok' | string;
    total_amount: number;
    total_modal: number;
    amount: number;
    status?: string;
    items: TransactionItem[];
  }