import { IconInterface } from "../type"

const TransactionIcon = ({ width = 25, height = 25, stroke }: IconInterface) => {
    return <svg width={width} height={height} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.8335 4.99984V7.0165C18.8335 8.33317 18.0002 9.1665 16.6835 9.1665H13.8335V3.3415C13.8335 2.4165 14.5918 1.6665 15.5168 1.6665C16.4252 1.67484 17.2585 2.0415 17.8585 2.6415C18.4585 3.24984 18.8335 4.08317 18.8335 4.99984Z" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.1665 5.83317V17.4998C2.1665 18.1915 2.94984 18.5832 3.49984 18.1665L4.92484 17.0998C5.25817 16.8498 5.72484 16.8832 6.02484 17.1832L7.40817 18.5748C7.73317 18.8998 8.2665 18.8998 8.5915 18.5748L9.9915 17.1748C10.2832 16.8832 10.7498 16.8498 11.0748 17.0998L12.4998 18.1665C13.0498 18.5748 13.8332 18.1832 13.8332 17.4998V3.33317C13.8332 2.4165 14.5832 1.6665 15.4998 1.6665H6.33317H5.49984C2.99984 1.6665 2.1665 3.15817 2.1665 4.99984V5.83317Z" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10.8418H10.5" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 7.5083H10.5" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.49609 10.8335H5.50358" stroke={ stroke || "#818898"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.49609 7.5H5.50358" stroke={ stroke || "#818898"} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>   
}

export default TransactionIcon