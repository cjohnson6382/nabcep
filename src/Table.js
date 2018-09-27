/*
	https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html

	This component gets data from a collection based on the user's query and puts it in a table
		the table is built according to the 'columns' object, which is a react-bootstrap-table columns array:
		
		[
			{
				dataField: "name",
				text: "Name Label",
				sort: true,
				events: {
					onClick: e => console.log("clicked on a name field", e.target.value)
				}
			},
			{
				dataField: "date",
				text: "Date Label",
				sort: true
			},
			{
				dataField: "price",
				text: "Price Label",
			}
		]
		
		the table will also get features from the 'features' object:
		
		{
			bootstrap4: true,
			defaultSorted: [{ dataField: "name", order: "desc" }],
			striped: true,
			hover: true,
			condensed: true,
			noDataIndication: true,
			pagination: true
		}
		
*/

import React from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'

import PropTypes from "prop-types"

import EmptyTable from './EmptyTable'

import { db } from './utilities'

export default class Table extends React.Component {
	static propTypes = {
		auth: PropTypes.object,
		query: PropTypes.object.isRequired,
		keyField: PropTypes.string.isRequired,
		features: PropTypes.object,
		columns: PropTypes.array.isRequired,
		title: PropTypes.string
	}

	constructor (props) {
		super(props)

		this.getData = this.getData.bind(this)
		this.validateQuery = this.validateQuery.bind(this)
		this.makeQuery = this.makeQuery.bind(this)
		this.addFilter = this.addFilter.bind(this)
		this.addOrder = this.addOrder.bind(this)
	}

	state = { data: [] }

	async componentWillMount () {
		let { features } = this.props
		
		if (features.pagination) features.pagination = paginationFactory()
		// the 'if' condition checks for the truthiness of 'pagination'; if it's false but still exists, 
			// then the table library will attempt to render it
			// this throws an error, so it should be avoided
		else delete features.pagination
		if (features.noDataIndication) features.noDataIndication = () => <EmptyTable />
		
		try {
			await this.setState({ features })
			await this.getData(this.props.query)			
		}
		catch (e) { console.log("something broke while mounting a table: ", e)}

		// let { auth } = this.props
		// if (auth.sunkaizenUser) {
		// 		// let r = await db.collection("organizations").doc(auth.currentUser.uid).get()
		// 		// let user = r.data()
		// 		this.setState({ user: auth.sunkaizenUser })
		// }
		// else {
		// 		auth.sunkaizenUserSubscribe(user => this.setState({ user }))
		// }
	}

	async getData (query) {
		this.validateQuery(query)

		// fields
		let { options, table } = query

		let { orderBy, where } = options
		let baseRef= db.collection(table)
		
		let dbQuery = this.makeQuery(baseRef, where, orderBy)
		
		dbQuery.onSnapshot(d => {
			let data = d.docs.map(doc => doc.data())
			
			this.setState({ data })
		})
	}

	validateQuery (query) {
		let { options } = query

		let colFields = this.props.columns.map(c => c.dataField)
		
		if (!colFields.includes(this.props.keyField)) { throw new Error("keyField is not in the columns provided for this table or doesn't exist at all: ", this.props.keyField) }
		
		let { orderBy, where } = options
		if (where && Object.keys(where).length > 0) {
			let comparisons = where.filter(w => w.operator.includes('<') || w.operator.includes('>') ? w.field : false)
			if (comparisons.length > 0 && !(orderBy[0] in comparisons)) {
				throw new Error("this is not a valid Firestore query because it has a filter that uses a comparison operator and an orderBy clause on a different field")
			}
		}
		
		return true

	}

	addFilter (query, { field, operator, value }) { return query.where(field, operator, value) }
	addOrder (query, order) { return query.orderBy(...order) }

	makeQuery (baseRef, where = [], orderBy = []) {
		const q = where.reduce((a, f) => this.addFilter(a, f), baseRef)
		// const r = orderBy.reduce((a, o) => this.addOrder(a, o), q)
		// can only include one orderBy clause right now
		const r = this.addOrder(q, orderBy)
		
		return r
	}

	componentWillUnmount () {
		this.setState({ data: {} })
	}

	render () {
		let { columns = {}, keyField = "", title = "", titleStyle = {}, bodyStyle = {} } = this.props
		let { data = {}, features = {} } = this.state
		let tableProps = Object.assign({}, { data, columns, keyField }, features)
		
		return (
			<div style={ bodyStyle } >
				<h3 style={ titleStyle } >{ title }</h3>
				<BootstrapTable { ...tableProps } />
			</div>
		)
	}
}