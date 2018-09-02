import React from 'react'
import TestRenderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import Table from './Table'

jest.unmock('./utilities')
import * as utilities from './utilities'

const propz = {
	auth: {},
	query: {
		table: "thing",
		options: {
			orderBy: [
				"name",
				"desc"
			],
			where: [
				{ field: "name", operator: "=", value: "none" }
			]
		}
	},
	keyField: "name",
	features: {
		striped: true,
		hover: true
	},
	columns: [
		{ dataField: "name", text: "Name Label", sort: true, events: { onClick: jest.fn() } },
		{ dataField: "value", text: "Value Label" },
		{ dataField: "item", text: "Item Label" },
		{ dataField: "thing", text: "Thing Label" }
	]
}


const resources = {
	docs: [
		{ data: () => ({ name: "first", id: "1" }), id: "1" },
		{ data: () => ({ name: "second", id: "2" }), id: "2" },
		{ data: () => ({ name: "third", id: "3" }), id: "3" }
	]
}


const firestoreQuery = ({
	where: (field, operator, value) => {
		expect({ field, operator, value }).toEqual(propz.query.options.where[0])
		return firestoreQuery
	},
	orderBy: o => {
		expect(o).toEqual(propz.query.options.orderBy[0])
		return firestoreQuery
	},
	get: () => resources,
	onSnapshot: f => f(resources),
	doc: id => console.log("doc id", id)
})

utilities.db = {
	collection: jest.fn().mockImplementation(
		collection => {
			expect(collection).toEqual(propz.query.table)
			return firestoreQuery
		}
	)
}

describe('Table', () => {
	let t = null

	it('renders', () => {
		t = shallow(<Table { ...propz } />)
	})
	
	it('renders correctly', () => {
		let r = resources.docs.map(doc => doc.data())
		expect(t.state().data).toEqual(r)
	})

})