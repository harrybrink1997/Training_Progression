import React from 'react'
import { Icon } from 'semantic-ui-react'

const ErrorBanner = (props) => {
    return (
        <div className='errorBannerContainer'>
            <div className='errorBanner'>
                <div>
                    <Icon
                        name='warning sign'
                        size='large'
                    />
                </div>
                <div>
                    {props.children}
                </div>
                <div className='errorBannerClose' onClick={() => props.clickHandler()}>
                    X
                </div>
            </div>
        </div>
    )
}

export default ErrorBanner