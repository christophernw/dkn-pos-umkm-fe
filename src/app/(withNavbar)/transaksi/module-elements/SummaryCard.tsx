import { CoinIcon } from '@/public/icons/CoinIcon'
import { StockIcon } from '@/public/icons/StockIcon'
import { IconInterface } from '@/public/icons/type';
import React from 'react'

interface SummaryCardProps {
    title: string,
    nominal: number, 
    percentage: number, 
    logo?: React.FC<IconInterface>;
}

export const SummaryCard = ({title, nominal, percentage, logo}: SummaryCardProps) => {
  const renderIcon = () => {
    if (logo) return React.createElement(logo);
    if (title === "Pemasukan") return <CoinIcon />;
    if (title === "Pengeluaran") return <StockIcon />;
    return <CoinIcon />;
  };
  
  const getPercentageColorClass = () => {
    if (title === "Pemasukan") {
      return percentage >= 0 ? "bg-primary-green" : "bg-red-500";
    } else if (title === "Pengeluaran") {
      return percentage >= 0 ? "bg-red-500" : "bg-primary-green";
    }
    return "bg-primary-green"; // default fallback
  };

  return (
    <div className="bg-white p-3 rounded-xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
            <div className="bg-primary-blue p-3 rounded-full">
                {renderIcon()}
            </div>
            <p>{title}</p>
        </div>
        <div className="flex flex-col gap-1">
            <p className="font-bold text-xl">Rp{Number(nominal).toLocaleString("id-ID")}</p>
            <div className="flex gap-1 items-center">
                <p className={`${getPercentageColorClass()} rounded-full text-white w-fit px-1 text-xs`}>{percentage}%</p>
                <p className="text-xs">vs bulan lalu.</p>
            </div>
        </div>
    </div>
  )
}