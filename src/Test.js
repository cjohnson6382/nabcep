import React from 'react'
import Table from './Table'
import Form from './Form'
import Uploader from './Uploader'


const Test = ({ title }) => {
	const formProps = {
		auth: {},
		submit: f => {
			f.preventDefault()
			console.log("form submitted", f.target)
		},
		submitName: "Test Form Submit",
		fields: [
			{ title: "field1", type: "text" },
			{ title: "field2", type: "radio", data: { name: "field2", options: [ { value: "first" }, { value: "second" } ] } },
			{ title: "field3", type: "select", data: { options: [ { name: "option1", value: "first" }, { name: "option2", value: "second" } ] } }
		],
		title: "Test Form",
		titleStyle: {
			padding: "1em",
			background: "linear-gradient(#b4b4b4, #cacaca)"
		},
		bodyStyle: {
			background: "#e5e5e5"
		},
		change: v => e => console.log("value changed", v, e.target.value)
	}
	
	const props = {
		auth: {},
		title: "Demo Table (striped, hover, click 'Name Label' to sort)",
		titleStyle: {
			background: "linear-gradient(#b4b4b4, #cacaca)",
			padding: "1em"
		},
		bodyStyle: {
			background: "#e5e5e5"
		},
		query: {
			table: "test",
			options: {
				orderBy: [
					"name",
					"desc"
				]
			}
		},
		keyField: "name",
		features: {
			striped: true,
			hover: true
		},
		columns: [
			{ dataField: "name", text: "Name Label", sort: true, events: { onClick: e => console.log("clicked on name field", e.target.value) } },
			{ dataField: "thing", text: "Thing Label" },
			{ dataField: "datum", text: "Datum Label" },
		]
	}
	
	const table2props = {
		auth: {},
		title: "No Hover Table",
		titleStyle: {
			background: "linear-gradient(#b4b4b4, #cacaca)",
			padding: "1em"
		},
		bodyStyle: {
			background: "#e5e5e5"
		},
		query: {
			table: "test",
			options: {
				orderBy: [
					"name",
					"desc"
				]
			}
		},
		keyField: "name",
		features: {
			striped: true
		},
		columns: [
			{ dataField: "name", text: "The Name Label", sort: true, events: { onClick: e => console.log("clicked on name field", e.target.value) } },
			{ dataField: "thing", text: "The Thing Label" },
			{ dataField: "datum", text: "The Datum Label" },
		]
	}
	
	const table3props = {
		auth: {},
		title: "Not Striped Table",
		titleStyle: {
			background: "linear-gradient(#b4b4b4, #cacaca)",
			padding: "1em"
		},
		bodyStyle: {
			background: "#e5e5e5"
		},
		query: {
			table: "test",
			options: {
				orderBy: [
					"name",
					"desc"
				]
			}
		},
		keyField: "name",
		features: {
			hover: true
		},
		columns: [
			{ dataField: "name", text: "The Name Label", sort: true, events: { onClick: e => console.log("clicked on name field", e.target.value) } },
			{ dataField: "thing", text: "The Thing Label" },
			{ dataField: "datum", text: "The Datum Label" },
		]
	}
	
	const table4props = {
		auth: {},
		title: "Paginated Table",
		titleStyle: {
			background: "linear-gradient(#b4b4b4, #cacaca)",
			padding: "1em"
		},
		bodyStyle: {
			background: "#e5e5e5"
		},
		query: {
			table: "test",
			options: {
				orderBy: [
					"name",
					"desc"
				]
			}
		},
		keyField: "name",
		features: {
			striped: true,
			hover: true,
			pagination: true
		},
		columns: [
			{ dataField: "name", text: "The Name Label", sort: true, events: { onClick: e => console.log("clicked on name field", e.target.value) } },
			{ dataField: "thing", text: "The Thing Label" },
			{ dataField: "datum", text: "The Datum Label" },
		]
	}
	
	const uploaderProps = {
		auth: {},
		type: "test",
		title: "Test Uploader"
	}
	
	return (
		<div style={ { border: "0.1em solid #ff8a19", display: "flex", flexDirection: "column", background: "transparent" } } >
			<div style={ { display: "flex", borderLeft: "1em solid #f05401", background: "#f8981d", padding: "1em" } } ><h3 style={ { alignSelf: "flex-start", fontWeight: "bold", margin: "0 1em 0 1em" } } >{ title }</h3></div>
			<div style={ { display: "flex", flexDirection: "row" } } >
				<div style={ { padding: "2em", flex: 3 } } ><Table { ...props } /></div>
				<div style={ { padding: "2em", flex: 2 } } ><Form { ...formProps } /></div>
			</div>
			<div style={ { display: "flex", flexDirection: "row" } } >
				<div style={ { padding: "2em", flex: 3 } } ><Table { ...table2props } /></div>
				<div style={ { padding: "2em", flex: 3 } } ><Table { ...table3props } /></div>
				<div style={ { padding: "2em", flex: 3 } } ><Table { ...table4props } /></div>
			</div>
			<div><Uploader { ...uploaderProps } /></div>
		</div>
	)
}

export default Test