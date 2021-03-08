import React from 'react'

export const BPT = (props) => {
    return (
        <b className="lightPurpleText">{props.children}</b>
    )
}

export const PT = (props) => {
    return (
        <span className="lightPurpleText">{props.children}</span>
    )
}