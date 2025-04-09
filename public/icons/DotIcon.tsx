

import { IconInterface } from "./type"

export const DotIcon = ({width=6, height=6, className}: IconInterface) => {
    return <svg width={width} height={height} className={className} viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="3" cy="3" r="3" fill="#C1C7D0"/>
    </svg>
}