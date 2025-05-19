'use client'
import React, { useState, useEffect } from 'react'
import { NavbarButton } from '../elements/button/NavbarButton'
import HomeIcon from '@/public/icons/navbar/HomeIcon'
import { usePathname } from 'next/navigation';
import SettingsIcon from '@/public/icons/navbar/SettingsIcon'

export const BPRNavbar = () => {
    // For BPR users, we only show Home and Settings
    const navItems = React.useMemo(() => [
        { text: 'Beranda', icon: HomeIcon, route: ["/bpr"] },
        { text: 'Pengaturan', icon: SettingsIcon, route: ["/pengaturan"] },
    ], []);

    const [activeItem, setActiveItem] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const activeMenuItem = navItems.find(item => 
            item.route.some(r => r === pathname) // Check if pathname exists in the route array
        );
        
        if (activeMenuItem) {
            setActiveItem(activeMenuItem.text);
        } else if (pathname === "/") {
            // Default to Beranda if on root path
            setActiveItem("Beranda");
        }
    }, [pathname, navItems]);

    const handleItemClick = (title: string) => {
        setActiveItem(prev => (prev === title ? prev : title));
    };

    return (
        <div className="bg-white fixed bottom-0 w-full sm:w-[420px] py-3 pb-7 shadow-[0_-4px_6px_0px_rgba(0,0,0,0.1)]">
            <div className="grid grid-cols-2 px-2 gap-1">
                {navItems.map((item) => (
                    <NavbarButton
                        key={item.text}
                        isActive={activeItem === item.text}
                        toggleButton={() => handleItemClick(item.text)}
                        icon={item.icon}
                        text={item.text}
                        route={item.route[0]} // Use first route as default navigation
                    />
                ))}
            </div>
        </div>
    );
};