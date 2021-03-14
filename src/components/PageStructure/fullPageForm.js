import React from 'react'

const FullPageFormFooter = ({ }) => {

}

const FullPageFormButtons = ({ children }) => {
    return (
        <div className="fullPageFormButtons">
            {children}
        </div>
    )
}

const FullPageFormError = ({ children }) => {
    return (
        <div className="fullPageFormError">
            {children}
        </div>
    )

}

const FullPageFormContent = ({ children }) => {
    return (
        <div className="fullPageFormContent">
            {children}

        </div>
    )

}

const FullPageFormHeader = ({ children }) => {
    return (
        <div className="fullPageFormHeader">
            {children}
        </div>
    )

}
const FullPageFormSubHeader = ({ children }) => {
    return (
        <div className="fullPageFormSubHeader">
            {children}
        </div>
    )

}

const FullPageForm = ({ children }) => {
    return (
        <div className="fullPageForm pageContainerLevel1">
            {children}
        </div>
    )
}

FullPageForm.Header = FullPageFormHeader
FullPageForm.SubHeader = FullPageFormSubHeader
FullPageForm.Error = FullPageFormError
FullPageForm.Content = FullPageFormContent
FullPageForm.Buttons = FullPageFormButtons

export default FullPageForm