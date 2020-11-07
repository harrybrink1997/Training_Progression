import React from 'react'
import { Form } from 'react-bootstrap'

export const ProgramFormSelect = () => {

    return (
        <Form.Group controlId="exampleForm.ControlSelect2">
            <Form.Label>Past Programs</Form.Label>
            <Form.Control as="select" multiple>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
            </Form.Control>
        </Form.Group>
    )
}