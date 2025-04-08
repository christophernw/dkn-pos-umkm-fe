import { IconInterface } from "./type"

export const StockIcon = ({width=18, height=18, className}: IconInterface) => {
    return (
        <svg 
            width={width} 
            height={height} 
            className={className} 
            viewBox="15 15 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Stock icon"
        >
            <rect width="100%" height="100%" rx="23" fill="#EFF5FF"/>
            <path d="M16.3779 19.5801L23.0004 23.4126L29.5779 19.6026" stroke="#3554C1" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23.0005 30.2068V23.4043" stroke="#3554C1" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21.448 15.86L17.443 18.0875C16.5355 18.59 15.793 19.85 15.793 20.885V25.1225C15.793 26.1575 16.5355 27.4175 17.443 27.92L21.448 30.1475C22.303 30.62 23.7054 30.62 24.5604 30.1475L28.5655 27.92C29.473 27.4175 30.2155 26.1575 30.2155 25.1225V20.885C30.2155 19.85 29.473 18.59 28.5655 18.0875L24.5604 15.86C23.6979 15.38 22.303 15.38 21.448 15.86Z" stroke="#3554C1" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M26.7498 23.9292V21.1842L19.6323 17.0742" stroke="#3554C1" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}