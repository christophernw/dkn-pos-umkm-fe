import { IconInterface } from "../type"

const TransactionIcon = ({ width = 25, height = 25, stroke }: IconInterface) => {
    return <svg width={width} height={height} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.99984 18.3332H12.9998C17.1665 18.3332 18.8332 16.6665 18.8332 12.4998V7.49984C18.8332 3.33317 17.1665 1.6665 12.9998 1.6665H7.99984C3.83317 1.6665 2.1665 3.33317 2.1665 7.49984V12.4998C2.1665 16.6665 3.83317 18.3332 7.99984 18.3332Z" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.4167 15.4168C14.3333 15.4168 15.0833 14.6668 15.0833 13.7502V6.25016C15.0833 5.3335 14.3333 4.5835 13.4167 4.5835C12.5 4.5835 11.75 5.3335 11.75 6.25016V13.7502C11.75 14.6668 12.4917 15.4168 13.4167 15.4168Z" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.58317 15.4165C8.49984 15.4165 9.24984 14.6665 9.24984 13.7498V10.8332C9.24984 9.9165 8.49984 9.1665 7.58317 9.1665C6.6665 9.1665 5.9165 9.9165 5.9165 10.8332V13.7498C5.9165 14.6665 6.65817 15.4165 7.58317 15.4165Z" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
}

export default TransactionIcon