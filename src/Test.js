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
		title: "Demo Table",
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
	
	const uploaderProps = {
		auth: {},
		type: "test",
		title: "Test Uploader"
	}
	
	return (
		<div style={ { display: "flex", flexDirection: "column" } } >
			<h3 style={ { background: "#f8981d", padding: "0.5em", margin: "0 4em 0 4em" } } >{ title }</h3>
			<div style={ { display: "flex", flexDirection: "row" } } >
				<div style={ { padding: "1em", flex: 3 } } ><Table { ...props } /></div>
				<div style={ { padding: "1em", flex: 2 } } ><Form { ...formProps } /></div>
			</div>
			<div><Uploader { ...uploaderProps } /></div>
		</div>
	)
}

export default Test