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
        <div className={`rounded-full px-3 py-3 ${isActive ? "bg-[#3554C1]" : "bg-white"}`}>
                <Link href={route} onClick={toggleButton} className="flex gap-2 text-sm items-center">
                    <Icon stroke={isActive ? "white" : "black"} />
                    <div className={`${isActive ? "text-white" : "hidden"}`}>{text}</div>
                </Link>
        </div>
    </div>
    )
}

