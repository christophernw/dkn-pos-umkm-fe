import React, { useState, useEffect } from 'react'
import { SummaryCard } from './SummaryCard'
import { useAuth } from "@/contexts/AuthContext"
import config from "@/src/config"

interface SummaryData {
	pemasukan: {
		amount: number;
		change: number;
	};
	pengeluaran: {
		amount: number;
		change: number;
	};
	status: "untung" | "rugi";
	amount: number;
}

export const TransactionSummary = () => {
	const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { accessToken } = useAuth()

	useEffect(() => {
		const fetchSummaryData = async () => {
			if (!accessToken) {
				setError("Authentication required")
				setLoading(false)
				return
			}

			setLoading(true);
			setError(null);

			try {
				const response = await fetch(`${config.apiUrl}/transaksi/summary/monthly`, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				})

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`)
				}

				const data = await response.json()
				setSummaryData(data)
			} catch (err) {
				console.error("Error fetching summary data:", err)
				setError("Failed to load summary data")
			} finally {
				setLoading(false)
			}
		}

		fetchSummaryData()
	}, [accessToken])

	if (loading) {
		return <div className="flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-2">
				<div className="bg-gray-100 animate-pulse h-32 rounded-xl"></div>
				<div className="bg-gray-100 animate-pulse h-32 rounded-xl"></div>
			</div>
			<div className="bg-gray-100 animate-pulse h-24 rounded-xl"></div>
		</div>
	}

	if (error || !summaryData) {
		return <div className="text-red-500 p-4 bg-red-50 rounded-xl">
			{error || "Failed to load financial summary"}
		</div>
	}

	const formatCurrency = (amount: number) => {
		return amount.toLocaleString("id-ID");
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-2">
				<SummaryCard 
					title='Pemasukan'
					nominal={summaryData.pemasukan.amount}
					percentage={summaryData.pemasukan.change}
				/>
				<SummaryCard 
					title='Pengeluaran'
					nominal={summaryData.pengeluaran.amount}
					percentage={summaryData.pengeluaran.change}
				/>
			</div>

			{/* Large Summary Card for Profit/Loss */}
			<div 
			className={`p-4 rounded-xl ${summaryData.status === "untung" ? "bg-primary-green bg-opacity-10" : "bg-red-100"}`}
			>
			<div className="flex items-center gap-4">
				<div className={`flex items-center justify-center w-12 h-12 rounded-full ${
				summaryData.status === "untung" ? "bg-primary-green bg-opacity-20" : "bg-red-500 bg-opacity-20"
				}`}>
				{summaryData.status === "untung" ? (
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				) : (
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 18V6M12 18L7 13M12 18L17 13" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				)}
				</div>
				<div className="flex flex-col">
				<p className="text-sm text-gray-500 font-medium">
					{summaryData.status === "untung" ? "Keuntungan" : "Kerugian"}
				</p>
				<p className="font-bold text-2xl text-gray-900">Rp{formatCurrency(Number(summaryData.amount))}</p>
				</div>
			</div>
			</div>
	</div>
	)
}
