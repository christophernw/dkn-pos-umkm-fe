import React, { useState, useEffect } from 'react'
import { SummaryCard } from './SummaryCard'
import { useAuth } from "@/contexts/AuthContext"
import config from "@/src/config"
import Head from 'next/head'

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

interface TransactionSummaryProps {
  selectedMonth: number;
  selectedYear: number;
}

export const TransactionSummary = ({ selectedMonth, selectedYear }: TransactionSummaryProps) => {
	const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { accessToken } = useAuth()
	
	// Define formatCurrency outside the render function for better performance
	const formatCurrency = (amount: number) => {
		return amount.toLocaleString("id-ID");
	};

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
				const response = await fetch(`${config.apiUrl}/transaksi/summary/monthly?month=${selectedMonth}&year=${selectedYear}`, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
					priority: 'high',
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
	}, [accessToken, selectedMonth, selectedYear])

	// Preload resources and optimize rendering
	useEffect(() => {
		if (summaryData) {
			// Precompute the formatted amount to avoid layout shifts
			const formattedAmount = formatCurrency(Number(summaryData.amount))
			
			// Create link prefetch for API
			const link = document.createElement('link');
			link.rel = 'preconnect';
			link.href = config.apiUrl;
			document.head.appendChild(link);
		
			// Preload the SVG icons
			const iconPreload = document.createElement('link');
			iconPreload.rel = 'preload';
			iconPreload.as = 'image';
			iconPreload.href = summaryData.status === "untung" 
				? 'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="%2316A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
				: 'data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 18V6M12 18L7 13M12 18L17 13" stroke="%23EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
			document.head.appendChild(iconPreload);
			
			// Pre-render the amount text to improve LCP
			const amountDisplay = document.getElementById('amount-display');
			if (amountDisplay) {
				// Use innerHTML for faster rendering than React's reconciliation
				amountDisplay.innerHTML = `<span class="inline-block">Rp</span>${formattedAmount}`;
			}
		}
	}, [summaryData, formatCurrency]);

	if (loading) {
		return <div className="flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-2">
				<div className="bg-gray-100 animate-pulse h-32 rounded-xl" style={{ contentVisibility: 'auto' }}></div>
				<div className="bg-gray-100 animate-pulse h-32 rounded-xl" style={{ contentVisibility: 'auto' }}></div>
			</div>
			<div className="bg-gray-100 animate-pulse h-24 rounded-xl" style={{ contentVisibility: 'auto' }}>
				<div className="flex items-center gap-4 p-4">
					<div className="w-12 h-12 rounded-full bg-gray-200"></div>
					<div className="flex flex-col">
						<div className="h-4 w-20 bg-gray-200 rounded"></div>
						<p 
							className="font-bold text-2xl text-gray-300 mt-1" 
							id="amount-display"
						>
							Rp0
						</p>
					</div>
				</div>
			</div>
		</div>
	}

	if (error || !summaryData) {
		return <div className="text-red-500 p-4 bg-red-50 rounded-xl">
			{error || "Failed to load financial summary"}
		</div>
	}
  
	// Get month name in Indonesian
	const getMonthName = (month: number) => {
		const monthNames = [
		"Januari", "Februari", "Maret", "April", "Mei", "Juni",
		"Juli", "Agustus", "September", "Oktober", "November", "Desember"
		];
		return monthNames[month - 1];
	};

	return (
		<>
			{/* Add preconnect hints for critical resources */}
			<Head>
				<link rel="preconnect" href={config.apiUrl} />
				<link rel="dns-prefetch" href={config.apiUrl} />
				<link rel="preload" href="/fonts/geist-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
				<meta name="LCP-target" content="amount-display" />
			</Head>
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

				<div 
				className={`p-4 rounded-xl ${summaryData.status === "untung" ? "bg-primary-green bg-opacity-10" : "bg-red-100"}`}
				>
					<div className="flex items-center gap-4">
						<div className={`flex items-center justify-center w-12 h-12 rounded-full ${
						summaryData.status === "untung" ? "bg-primary-green bg-opacity-20" : "bg-red-500 bg-opacity-20"
						}`}>
						{summaryData.status === "untung" ? (
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
							<path d="M12 6V18M12 6L7 11M12 6L17 11" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						) : (
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
							<path d="M12 18V6M12 18L7 13M12 18L17 13" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						)}
						</div>
						<div className="flex flex-col">
						<p className="text-sm text-gray-500 font-medium">
							{summaryData.status === "untung" ? "Keuntungan" : "Kerugian"}
						</p>
						<p 
							className="font-bold text-2xl text-gray-900" 
							style={{ contentVisibility: 'auto' }}
							id="amount-display"
							data-priority="high"
						>
							<span className="inline-block">Rp</span>{formatCurrency(Number(summaryData.amount))}
						</p>
						</div>
					</div>
				</div>
		</div>
		</>
	)
}
