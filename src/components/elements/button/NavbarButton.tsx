'use client'

import { IconInterface } from '@/public/icons/type';
import Link from 'next/link';
import React from 'react'

interface NavbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isActive: boolean;
    toggleButton: () => void;
    icon: React.FC<IconInterface>;
    text: string
    route: string
}


export const NavbarButton = ({isActive, toggleButton, icon: Icon, text, route} : NavbarButtonProps) => {
  return (
    <div>
        <div className={`rounded-3xl py-3 px-3 ${isActive ? "bg-[#3554C1]" : "bg-white"}`}>
                <Link href={route} onClick={toggleButton} className="flex flex-col text-sm items-center">
                    <Icon stroke={isActive ? "white" : "black"} />
                    <div className={`${isActive ? "text-white" : "text-black"}`}>{text}</div>
                </Link>
        </div>
    </div>
    )
}

