import { IconInterface } from "./type"

export const PlusIcon = ({width=24, height=24, className, stroke}: IconInterface) => {
    return <svg width={width} height={height} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 12H18" stroke={stroke ?? "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 18V6" stroke={stroke ?? "white"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
}