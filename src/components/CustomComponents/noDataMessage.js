import React from 'react'

const NoDataMessage = (props) => {
    return (
        <div className="noDataMessageContainer">
            {props.children}
        </div>
    )
}

export default NoDataMessage