import React from 'react'
import styled, { css } from 'styled-components';
import { SpinLoader, LoadingDots } from './loader'

export const removeDefaultButtonStyle = css`
    border: none;
    padding: 0;
    font-family: inherit;
    font-weight: normal;
    background-color: unset;
    outline: none;
`

export const BaseButton = styled.button`
    ${removeDefaultButtonStyle}
    cursor: pointer;
    border-radius: .28571429rem;
    text-align: center;
    line-height: 1em;
    min-height: 1em;
    height: 100%;
    font-weight: 700;
    padding: .78571429em 1.5em .78571429em;
    &:hover {
        transform: scale(1.05)
    }
`

const PrimaryButtonStyledComponent = styled(BaseButton)`
    background-color: ${props => props.inverted ? 'transparent' : '#BB86FC'};
    color: ${props => props.inverted ? '#BB86FC' : 'black'};
    display: flex;
    justify-content: center;
    border: ${props => props.inverted ? '3px solid #BB86FC' : 'none'};
    &:hover {
        transform: ${props => props.loading ? 'none' : 'inherit'};
        box-shadow: ${props => props.loading ? 'none' : '0 0 5px #BB86FC'};
    }
    `

export const SecondaryButton = styled(BaseButton)`
    background-color: ${props => props.inverted ? 'transparent' : '#868cfc'};
    color: ${props => props.inverted ? '#868cfc' : 'black'};
    border: ${props => props.inverted ? '3px solid #868cfc' : 'none'};
    &:hover {
        transform: ${props => props.loading ? 'none' : 'inherit'};
        box-shadow: ${props => props.loading ? 'none' : '0 0 5px #868cfc'};
    }
`

export const PrimaryButton = (props) => {
    return (
        <PrimaryButtonStyledComponent
            inverted={props.inverted}
            loading={props.loading}
        >
            {props.loading ? <SpinLoader /> : props.children}
        </PrimaryButtonStyledComponent>
    )
}