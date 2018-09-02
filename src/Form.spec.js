import React from 'react'
import TestRenderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import Form from './Form'

// jest.unmock('./utilities')
// import * as utilities from './utilities'

const propz = {
	auth: {},
	submit: jest.fn(),
	submitName: "submit",
	fields: [
		{ title: "field1", type: "text" },
		{ title: "field2", type: "radio", data: { options: [ { value: "first" }, { value: "second" } ] } },
		{ title: "field3", type: "select", data: { options: [ { name: "option1", value: "first" }, { name: "option2", value: "second" } ] } }
	],
	title: "test form",
	titleStyle: {
		padding: "1em",
		background: "linear-gradient(#b4b4b4, #cacaca, #b4b4b4)"
	},
	bodyStyle: {
		background: "#e5e5e5"
	},
	change: jest.fn()
}


describe('Form', () => {
	let f = null

	it('renders', () => {
		f = TestRenderer.create(<Form { ...propz } />)
		
		const tree = f.toJSON()
		expect(tree).toMatchSnapshot()
	})
	
	// it('renders correctly', () => {
	// 	expect(t.state().data).toEqual(r)
	// })

})