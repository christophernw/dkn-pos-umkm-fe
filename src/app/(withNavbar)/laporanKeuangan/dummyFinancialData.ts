// src/app/(withNavbar)/laporan-keuangan/dummyFinancialData.ts

export const dummyFinancialData = {
    summary: {
      total_income: 5250000,
      total_expense: 3175000,
      total_profit: 2075000,
      transaction_count: 28
    },
    income_by_category: [
      { category: "Penjualan Barang", amount: 3750000, percentage: 71 },
      { category: "Pendapatan Jasa/Komisi", amount: 850000, percentage: 16 },
      { category: "Penambahan Modal", amount: 500000, percentage: 10 },
      { category: "Pendapatan Lain-Lain", amount: 150000, percentage: 3 }
    ],
    expense_by_category: [
      { category: "Pembelian Stok", amount: 1800000, percentage: 57 },
      { category: "Biaya Operasional", amount: 675000, percentage: 21 },
      { category: "Gaji Karyawan", amount: 500000, percentage: 16 },
      { category: "Pengeluaran Lain-Lain", amount: 200000, percentage: 6 }
    ],
    monthly_data: [
      { month: "Januari 2023", income: 1200000, expense: 850000, profit: 350000 },
      { month: "Februari 2023", income: 1450000, expense: 925000, profit: 525000 },
      { month: "Maret 2023", income: 1350000, expense: 800000, profit: 550000 },
      { month: "April 2023", income: 1250000, expense: 600000, profit: 650000 }
    ]
  };
  
  export function getFilteredFinancialData(startDate: string, endDate: string) {
    // In a real implementation, you would filter based on dates
    // For this dummy data, we're just returning the same data
    
    // You could implement simple date filtering like this:
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Filter monthly data as an example
    const filteredMonthlyData = dummyFinancialData.monthly_data.filter(item => {
      // Assuming month format is "Month Year" like "Januari 2023"
      const [month, year] = item.month.split(" ");
      const monthIndex = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ].indexOf(month);
      
      if (monthIndex === -1) return false;
      
      const itemDate = new Date(parseInt(year), monthIndex, 1);
      return itemDate >= start && itemDate <= end;
    });
    
    return {
      ...dummyFinancialData,
      monthly_data: filteredMonthlyData
    };
  }