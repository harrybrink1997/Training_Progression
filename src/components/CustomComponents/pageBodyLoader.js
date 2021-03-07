import React from 'react'

const PageBodyLoader = (props) => {
    return (
        <div className='pageBodyLoaderContainer'>
            {props.children}
        </div>
    )
}

export default PageBodyLoader