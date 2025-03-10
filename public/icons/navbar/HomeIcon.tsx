import { IconInterface } from "../type"

const HomeIcon = ({ width = 25, height = 25, stroke }: IconInterface) => {
    return <svg width={width} height={height} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.0165 2.36664L3.52484 5.86664C2.77484 6.44997 2.1665 7.69164 2.1665 8.63331V14.8083C2.1665 16.7416 3.7415 18.325 5.67484 18.325H15.3248C17.2582 18.325 18.8332 16.7416 18.8332 14.8166V8.74997C18.8332 7.74164 18.1582 6.44997 17.3332 5.87497L12.1832 2.26664C11.0165 1.44997 9.1415 1.49164 8.0165 2.36664Z" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5 14.9917V12.4917V14.9917Z" fill="white"/>
    <path d="M10.5 14.9917V12.4917" stroke={ stroke || "#818898"} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    
}

export default HomeIcon

