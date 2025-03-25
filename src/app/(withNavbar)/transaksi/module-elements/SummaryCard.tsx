import { CoinIcon } from '@/public/icons/CoinIcon'
import { IconInterface } from '@/public/icons/type';
import React from 'react'

interface SummaryCardProps {
    title: string,
    nominal: number, 
    percentage: number, 
    logo?: React.FC<IconInterface>;
}

export const SummaryCard = ({title, nominal, percentage, logo}: SummaryCardProps) => {
  return (
    <div className="bg-white p-3 rounded-xl flex flex-col gap-3">
        <div className="flex items-center gap-2">
            <div className="bg-primary-blue p-3 rounded-full">
                {logo ? React.createElement(logo) : <CoinIcon />}
            </div>
            <p>{title}</p>
        </div>
        <div className="flex flex-col gap-1">
            <p className="font-bold text-xl">Rp{nominal}</p>
            <div className="flex gap-1 items-center">
                <p className="bg-primary-green rounded-full text-white w-fit px-1 text-xs">{percentage}%</p>
                <p className="text-xs">vs bulan lalu.</p>
            </div>
        </div>
    </div>
  )
}
