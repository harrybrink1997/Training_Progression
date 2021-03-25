import React from 'react'
import styled, { css, keyframes } from 'styled-components';

const spinAnimation = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
    `

export const SpinLoader = styled.div`
    animation: ${spinAnimation} 1s linear infinite;
    transform: translateZ(0);
    border-top: 2px solid #333333;
    border-right: 2px solid #333333;
    border-bottom: 2px solid #333333;
    border-left: 4px solid #191919;
    background: transparent;
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
`

const BounceAnimation = keyframes`
    0% { margin-bottom: 0; }
    25% { margin-bottom: 0.2em; }
    50% { margin-bottom: 0.4em; }
    75% { margin-bottom: 0.2em; }
    100% { margin-bottom: 0; }
`;
const DotWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`;

const Dot = styled.div`
  background-color: #333333;
  border-radius: 50%;
  width: 0.4em;
  height: 0.4em;
  margin: 0 2px;
  animation: ${BounceAnimation} 0.5s linear infinite;
  animation-delay: ${props => props.delay};
`;
export const LoadingDots = (props) => {
    return (
        <DotWrapper>
            <Dot delay="0s" />
            <Dot delay=".1s" />
            <Dot delay=".2s" />
        </DotWrapper>
    )
}