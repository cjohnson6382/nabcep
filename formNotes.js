


// this is the beginning of a parent component that uses the form-rendering SampleComponent
// 	it just has the props for the SampleComponent instance and a very basic functional component that renders the SampleComponent

// we should have this in the codebase already, I just don't want to include it right now
// 	you should assume that this function's signature is as follows:
/*
	message :: string => null
*/
// when you invoke the flashError function, 
// 	it will display your string message at the top center of the browser for 10 seconds (or until the user clicks on it) and 
// 	log the message to the database in an 'errors' collection
import flashError from './someErrorClass'
import SampleComponent from './SampleComponent'

import { db } from './utilities'

const sampleForm = {
	"$id": "https://example.com/address.schema.json",
	"$schema": "http://json-schema.org/draft-07/schema#",
	"description": "An address",
	"type": "object",
	"properties": {
		"name": {
			"type": "string",
			// the pattern is a javascript Regular Expression; see the link below for a refresher if you need it:
			// 	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
			"pattern": "house|dog"
		},
		"extended-address": {
			"type": "string"
		},
		"street-address": {
			"type": "string"
		},
		"locality": {
			"type": "string"
		},
		"region": {
			"type": "string"
		},
		"postal-code": {
			"type": "string"
		},
		"country-name": {
			"type": "string"
		}
	},
	"required": [ "locality", "region", "country-name" ]
}

// the jsondata that we get back from the child has been validated
// 	we therefore insert it directly into the database
// 	don't worry about the database insertion code here for now
const submit = jsondata => {
	// if the form already has an ID on it, then the user is modifying this application
	// 	if that is the case, then get a document reference for the existing application
	//	otherwise, create a new document reference in the applications collection
	const docRef = jsondata.id ? db.collection("applications").doc(jsondata.id) : db.collection("applications").doc()

	// all await statements must be wrapped in try/catch blocks
	try {
		await docRef.set(jsondata, { merge: true })	
	}
	catch (e) {
		const verb = jsondata.id ? "update" : "create"
		// have to stringify the error before displaying it with text interpolation, or it displays as "[Object]" in the error message
		flashError(`failed to ${verb} application with ID ${jsondata.id}; an error occurred: ${JSON.stringify(e)}`)
	}
}

// this is a 'functional component'; it's just a normal javascript function in ES6 fat arrow notation
// 	it returns a JSX component that React can render
// 	functional components are also referred to as 'stateless', because they do not have component state
// 	they are much easier to test than stateful components, 
// 	and they are very reliable because any given function input always leads to the same result
export const ParentComponent = () => {
	const props = { formdata: sampleForm, submit }

	return (
		<SampleComponent { ...props } />
	) 
}
	


// this is the beginning of the SampleComponent file

import React from 'react'
import PropTypes from 'prop-types'

// see the note above about the flashError function
import flashError from './someErrorClass'

// this is your reference for JSON Schema: 
// 	https://json-schema.org/understanding-json-schema/
import { Validator } from 'jsonschema'
const validator = new Validator()

export default class SampleComponent {
	static propTypes = {
		formdata: PropTypes.object.isRequired,
		submit: PropTypes.func.isRequired
	}

	constructor (props) {
		super(props)

		this.chnage = this.change.bind(this)
	}

	state = {}

	componentWillMount () {
		const { formdata } = this.props
		const fields = Object.keys(formdata.properties)

		// we will be using a React Controlled Form for this; which means all the form fields will be stored in component state
		this.setState({ fields })
	}

	change (e) {
		this.setState({ [e.target.attributes.name.value]: e.target.value })
	}

	submit () {
		const { formdata, submit } = this.props
		const { fields } = this.state

		// I don't remember precisely how the validate function works; 
		// 	I think it returns null if validation is sucessful, and otherwise returns an error
		const valid = validator.validate(fields, formdata)
		valid ? 
			flashError(`your form failed to validate: ${JSON.stringify(valid)}`)
				:
			submit(fields) 
	}

	render () {
		const { properties } = formdata

		/*
			this code is very speculative right now; I noticed that the HTML5 validation code looks the same as the JSONSchema validation code

			I'm going to try just spreading the entire JSONSchema for a field onto the field as its attributes.
			The idea is that we get individual field validation in realtime, and the submit function for this component validates the entire form

			This looks more like what I had originally proposed for this component: HTML5 validation on fields, then a secondary validation on the JSON form as a whole
				- this is because I realized that JSONSchema does not seem validate individual fields, it only validates the entire JSON
		*/
		return (
			{
				<form onSubmit={ this.submit } >
					<input type="submit" />
					Object.entries(properties).map(([name, values]) => (
						<div style={ { display: "flex", flexFlow: "row nowrap" } } >
							<input { ...values } name={ name } placeholder={ name } onChange={ this.change } style={ { padding: "1rem" } } value={ this.state[name] } >
						</div>
					) )
				</form>
			}
		)
	}
}