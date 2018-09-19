import React from 'react';
import { registerUsername } from './Auth'


const Register = ({ history }) => {
	const submit = async e => {
		e.preventDefault()
		await registerUsername(e.target.name.value)
		history.push("/")
	}

	return (
		<form style={ { padding: "1em" } } onSubmit={ submit } >
			<div style={ { padding: "1em 0 1em 0" } } >Choose a Username to Display on Your Posts</div>
			<input type="text" style={ { margin: "0 1em 0 0" } } name="name" placeholder="What do we call you?" />
			<input type="submit" />
		</form>
	)
}

export default Register