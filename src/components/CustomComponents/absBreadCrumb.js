import React from 'react'
import { Breadcrumb } from 'semantic-ui-react'

const AbsBreadCrumb = ({ clickHandler, items, currPage }) => {

    return (
        <Breadcrumb>
            {
                items.map(item => {
                    if (currPage >= item.pageNum) {
                        if (currPage === item.pageNum) {
                            return (
                                <Breadcrumb.Section key={item.text} link active >{item.text}</Breadcrumb.Section>
                            )
                        } else {
                            return (
                                <Breadcrumb.Section key={item.text} link onClick={(e) => clickHandler(e, item.pageNum)}>{item.text}</Breadcrumb.Section>
                            )
                        }
                    } else {
                        return (
                            <></>
                        )
                    }
                })
            }
        </Breadcrumb>
    )

}

export default AbsBreadCrumb