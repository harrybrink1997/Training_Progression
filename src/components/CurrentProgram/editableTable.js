import React from 'react'

const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    passTableDataUpStream
}) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)
    const ref = React.createRef()

    const onChange = e => {
        setValue(e.target.value)
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
        passTableDataUpStream(index, id, value, ref)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
        setValue(initialValue)
        console.log(initialValue)
    }, [initialValue])

    return <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={e => e.currentTarget.select()}
    />
}

const utilizeFocus = () => {
    const ref = React.createRef()
    const setFocus = () => { ref.current && ref.current.focus() }

    return { setFocus, ref }
}

export { EditableCell, utilizeFocus }