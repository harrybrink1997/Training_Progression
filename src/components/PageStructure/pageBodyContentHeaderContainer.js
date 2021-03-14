import React, { useState } from 'react'

const PageBodyContentHeaderContainerHeader = ({ children }) => {
    return (
        <div className='pageBodyContentHeaderContainerMainHeader'>
            {children}
        </div>
    )
}

const PageBodyContentHeaderContainerSubHeader1 = ({ children }) => {
    return (
        <div className='pageBodyContentHeaderContainerSubHeader1'>
            {children}
        </div>
    )
}

const PageBodyContentHeaderContainerButtons = ({ children }) => {
    return (
        <div className='centred-info'>
            {children}
        </div>
    )
}

const PageBodyContentHeaderContainer = ({ children }) => {
    return (
        <div className="pageContainerLevel1 pageBodyContentHeaderContainer">
            {children}
        </div>
    )
}


PageBodyContentHeaderContainer.Header = PageBodyContentHeaderContainerHeader
PageBodyContentHeaderContainer.SubHeader1 = PageBodyContentHeaderContainerSubHeader1
PageBodyContentHeaderContainer.Buttons = PageBodyContentHeaderContainerButtons
export default PageBodyContentHeaderContainer