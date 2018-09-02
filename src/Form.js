import React from 'react'
import PropTypes from "prop-types"

const fieldTypes = {
	radio: change => r => (
		<div>
			{ r.options.map((c, i) => <div key={ i } style={ { display: "flex", flexDirection: "row", alignItems: "center" } } >
				<input type="radio" name={ r.name } value={ c.value } onChange={ change } />
				<div style={ { padding: "0 0 0 1em" } } >{ c.value }</div>
			</div> ) }
		</div>
	),
	text: change => () => <input type="text" onChange={ change } />,
	select: change => s => (
		<select onChange={ change } >
			{ s.options.map((c, i) => <option key={ i } value={ c.value } >{ c.name }</option>) }
		</select>
	),
	color: change => () => <input type="color" onChange={ change } />,
	date: change => () => <input type="date" onChange={ change } />,
	email: change => () => <input type="email" onChange={ change } />,
	password: change => () => <input type="password" onChange={ change } />,
	number: change => () => <input type="number" onChange={ change } />
}

const Field = ({ title, type, data, change }) => {
	let c = change(title)
	return (
		<div style={ { display: "flex", flexDirection: "row", padding: "1em 1em 1em 1em", alignItems: "center" } } >
			<label style={ { padding: "0 0.5em 0 0", alignItems: "center", display: "flex" } } >{ title }</label>
			{ fieldTypes[type](c)(data) }
		</div>
	)
}

const Form = ({ auth, submit, submitName, fields, title, bodyStyle, titleStyle, change }) => (
	<div style={ bodyStyle } >
		<h3 style={ titleStyle } >{ title }</h3>
		<form onSubmit={ submit } style={ { padding: "1em" } } >
			{ fields.map((f, i) => <Field key={ i } { ...{ ...f, change } } />) }
			<input style={ { background: "linear-gradient(#3979d2, #154c94)", color: "white", borders: "none", padding: "0.3em" } } type="submit" value={ submitName || "Submit" } />
		</form>
	</div>
)

Form.propTypes = {
	auth: PropTypes.object,
	submit: PropTypes.func.isRequired,
	submitName: PropTypes.string,
	fields: PropTypes.array.isRequired,
	title: PropTypes.string,
	titleStyle: PropTypes.object,
	bodyStyle: PropTypes.object
}

export default Form