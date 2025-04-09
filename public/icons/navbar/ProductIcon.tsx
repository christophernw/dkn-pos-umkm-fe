import { IconInterface } from "../type"

const ProductIcon = ({ width = 25, height = 25, stroke }: IconInterface) => {
    return <svg width={width} height={height} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.1416 6.2002L10.4999 10.4585L17.8082 6.22517" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5 18.008V10.4497" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.77501 2.0665L4.32502 4.54153C3.31668 5.09986 2.4917 6.49985 2.4917 7.64985V12.3582C2.4917 13.5082 3.31668 14.9082 4.32502 15.4665L8.77501 17.9415C9.72501 18.4665 11.2833 18.4665 12.2333 17.9415L16.6834 15.4665C17.6917 14.9082 18.5167 13.5082 18.5167 12.3582V7.64985C18.5167 6.49985 17.6917 5.09986 16.6834 4.54153L12.2333 2.0665C11.275 1.53317 9.72501 1.53317 8.77501 2.0665Z" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.6666 11.0332V7.98321L6.7583 3.4165" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    
}

export default ProductIcon

