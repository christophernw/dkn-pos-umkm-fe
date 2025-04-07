"use client"
import { useRouter } from 'next/navigation'
import React from 'react'

export const Header = () => {
    const router = useRouter();
    return (
    <div className="px-3">
        <header className="flex flex-row justify-center my-5">
            <div className="container mx-auto flex items-center justify-between">
            <div onClick={() => router.back()} aria-label="back">
                <button aria-label="back" type="button" className="bg-white hover:bg-gray-200 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2">
                <svg
                    className="w-4 h-4 transform scale-x-[-1]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                >
                <path
                    stroke="black"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                />
                </svg>
                </button>
            </div>
            <p className="text-lg font-semibold">Transaksi #562003</p>
            <div className='px-6'/>
            </div>
        </header>
    </div>
    )
}
