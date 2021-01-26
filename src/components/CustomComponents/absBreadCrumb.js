import React from 'react'
import { Breadcrumb } from 'semantic-ui-react'

const AbsBreadCrumb = ({ clickHandler, items, currPage }) => {


    return (
        <Breadcrumb>
            {
                items.map(item => {
                    if (currPage >= item.pageNum) {
                        if (item.exclusions) {
                            var currPageInExclusions = false
                            for (var page in item.exclusions) {
                                var pageNum = item.exclusions[page]

                                if (pageNum === currPage) {
                                    currPageInExclusions = true
                                }
                            }

                            if (!currPageInExclusions) {
                                if (currPage === item.pageNum) {
                                    return (
                                        <Breadcrumb.Section key={item.text} link active >{item.text}</Breadcrumb.Section>
                                    )
                                } else {
                                    return (
                                        <>
                                            <Breadcrumb.Section key={item.text} link onClick={(e) => clickHandler(e, item.pageNum)}>{item.text}</Breadcrumb.Section>

                                            <Breadcrumb.Divider>/</Breadcrumb.Divider>
                                        </>
                                    )
                                }
                            }
                        } else {
                            if (currPage === item.pageNum) {
                                return (
                                    <Breadcrumb.Section key={item.text} link active >{item.text}</Breadcrumb.Section>
                                )
                            } else {
                                return (
                                    <>
                                        <Breadcrumb.Section key={item.text} link onClick={(e) => clickHandler(e, item.pageNum)}>{item.text}</Breadcrumb.Section>

                                        <Breadcrumb.Divider>/</Breadcrumb.Divider>
                                    </>
                                )
                            }
                        }
                    }
                })
            }
        </Breadcrumb>
    )

}

export default AbsBreadCrumb