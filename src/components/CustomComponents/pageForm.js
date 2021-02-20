import React from 'react'

const PageForm = (props) => {
    return (
        <div className='centred-info'>
            <div className='pageForm pageContainerLevel1 half-width'>
                {props.children}
            </div>
        </div>
    )
}

export default PageForm