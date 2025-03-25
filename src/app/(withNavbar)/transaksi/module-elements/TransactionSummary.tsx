import React from 'react'
import { SummaryCard } from './SummaryCard'

export const TransactionSummary = () => {
  return (
    <div className="grid grid-cols-2 gap-2">
        <SummaryCard 
            title='Pemasukan'
            nominal={50000}
            percentage={2.3}
        />
        <SummaryCard 
            title='Pengeluaran'
            nominal={20000}
            percentage={2.3}
        />
    </div>
  )
}
