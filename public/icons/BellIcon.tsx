import { IconInterface } from "./type"

export const BellIcon = ({width=18, height=18, className}: IconInterface) => {
    return (
        <svg 
            width={width} 
            height={height} 
            className={className} 
            viewBox="0 0 18 18" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Bell icon"
        >
            <path d="M12.6473 14.6663H3.31396C1.31396 14.6663 1.31396 13.7663 1.31396 12.6663V11.9997C1.31396 11.633 1.61396 11.333 1.98063 11.333H13.9806C14.3473 11.333 14.6473 11.633 14.6473 11.9997V12.6663C14.6473 13.7663 14.6473 14.6663 12.6473 14.6663Z" stroke="#3554C1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.813 8.66634V11.333H2.17969V8.66634C2.17969 6.10634 3.98635 3.96634 6.39302 3.45301C6.75302 3.37301 7.12635 3.33301 7.51302 3.33301H8.47969C8.86635 3.33301 9.24635 3.37301 9.60635 3.45301C12.013 3.97301 13.813 6.10634 13.813 8.66634Z" stroke="#3554C1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.66683 2.99967C9.66683 3.15967 9.64683 3.30634 9.60683 3.45301C9.24683 3.37301 8.86683 3.33301 8.48016 3.33301H7.5135C7.12683 3.33301 6.7535 3.37301 6.3935 3.45301C6.3535 3.30634 6.3335 3.15967 6.3335 2.99967C6.3335 2.07967 7.08016 1.33301 8.00016 1.33301C8.92016 1.33301 9.66683 2.07967 9.66683 2.99967Z" stroke="#3554C1" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 7.33301H6" stroke="#3554C1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}