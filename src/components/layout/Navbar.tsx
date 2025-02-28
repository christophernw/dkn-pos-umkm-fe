'use client'
import React, { useState } from 'react'
import { NavbarButton } from '../elements/button/NavbarButton'
import HomeIcon from '@/public/icons/navbar/HomeIcon'
import TransactionIcon from '@/public/icons/navbar/TransactionIcon'
import ProductIcon from '@/public/icons/navbar/ProductIcon'
import SettingsIcon from '@/public/icons/navbar/SettingsIcon'
import ReportIcon from '@/public/icons/navbar/ReportIcon'


export const Navbar = () => {
    const [activeButton, setActiveButton] = useState("")

    const navItems = [
        { text: 'Home', icon: HomeIcon, route: "/" },
        { text: 'Transaction', icon: TransactionIcon, route: "/" },
        { text: 'Product', icon: ProductIcon, route: "/daftarProduk" },
        { text: 'Report', icon: ReportIcon, route: "/" },
        { text: 'Setting', icon: SettingsIcon, route: "/" },
    ]

    return (
        <div className="bg-white fixed bottom-0 w-full sm:w-[402px] py-3 pb-7 shadow-[0_-4px_6px_0px_rgba(0,0,0,0.1)]">
            <div className="flex gap-4 justify-center ">
                {navItems.map((item, index) => (
                    <NavbarButton
                        key={index}
                        isActive={activeButton === item.text}
                        toggleButton={() => setActiveButton(item.text)}
                        icon={item.icon}
                        text={item.text}
                        route={item.route}
                    />
                ))}
            </div>
        </div>
    )
}
