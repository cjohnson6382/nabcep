import React from 'react'

import PropTypes from 'prop-types'

const googleSignInBadge = './google.png'

const localStyles = {
	body: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		padding: "1em",
		backgroundColor: "transparent"
	}
}

export default class Login extends React.Component {
	static propTypes = { auth: PropTypes.object }

	constructor (props) {
		super(props)

		this.register = this.register.bind(this)
	}

	state = { show: false }

	register (e) {
		console.log("showing registration overlay")
		this.setState({ show: true })
	}

	render () {
		return (
			<div style={ localStyles.body } >
				<div onClick={ e => this.props.auth.providerLogin("google") } >
					<img alt="Google Login" src={ googleSignInBadge } />
				</div>
			</div>
		)
	}
}