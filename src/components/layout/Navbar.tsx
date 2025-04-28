'use client'
import React, { useState, useEffect } from 'react'
import { NavbarButton } from '../elements/button/NavbarButton'
import HomeIcon from '@/public/icons/navbar/HomeIcon'
import { usePathname } from 'next/navigation';
import TransactionIcon from '@/public/icons/navbar/TransactionIcon'
import ProductIcon from '@/public/icons/navbar/ProductIcon'
import SettingsIcon from '@/public/icons/navbar/SettingsIcon'
import ReportIcon from '@/public/icons/navbar/ReportIcon'

export const Navbar = () => {
    const navItems = React.useMemo(() => [
        { text: 'Produk', icon: ProductIcon, route: ["/informasi", "/semuaBarang"] },
        { text: 'Transaksi', icon: TransactionIcon, route: ["/transaksi"] },
        { text: 'Beranda', icon: HomeIcon, route: ["/"] },
        { text: 'Laporan', icon: ReportIcon, route: ["/report"] },
        { text: 'Pengaturan', icon: SettingsIcon, route: ["/pengaturan"] },
    ], []);

    const [activeItem, setActiveItem] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const activeMenuItem = navItems.find(item => 
            item.route.some(r => r === pathname) // Cek apakah pathname ada di dalam array route
        );
        
        if (activeMenuItem) {
            setActiveItem(activeMenuItem.text);
        }
    }, [pathname, navItems]);

    const handleItemClick = (title: string) => {
        setActiveItem(prev => (prev === title ? prev : title));
    };

    return (
        <div className="bg-white fixed bottom-0 w-full sm:w-[420px] py-3 pb-7 shadow-[0_-4px_6px_0px_rgba(0,0,0,0.1)]">
            <div className="grid grid-cols-5 px-2 gap-1">
                {navItems.map((item) => (
                    <NavbarButton
                        key={item.text}
                        isActive={activeItem === item.text}
                        toggleButton={() => handleItemClick(item.text)}
                        icon={item.icon}
                        text={item.text}
                        route={item.route[0]} // Ambil route pertama sebagai navigasi default
                    />
                ))}
            </div>
        </div>
    );
};
