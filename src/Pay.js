/*
	https://developer.authorize.net/api/reference/features/acceptjs.html

	This component allows the user to pay the site through an Authorize.net call
		
		a payment looks like this:
		
		{
			authData: {
				clientKey: process.env.TRANSACTION_KEY,
				apiLoginID: process.env.API_LOGIN_ID
			},
			cardData: {
				cardNumber: "",	//	CC number
				month: "",		//	expiration month
				year: "",		//	expiration year
				cardCode: ""	//	cvv code
			}
		}


		
*/

import React from 'react'
import PropTypes from "prop-types"

import { db } from './utilities'

const authData = {
	clientKey: process.env.TRANSACTION_KEY,
	apiLoginID: process.env.API_LOGIN_ID
}

const url = ""

localStyles = {
	bodyStyle: {
		
	},
	titleStyle: {
		
	}
}

export default class Pay extends React.Component {
	static propTypes = {
		auth: PropTypes.object,
		title: PropTypes.string,
		paymentReturned: PropTypes.func
	}

	constructor (props) {
		super(props)

		this.pay = this.pay.bind(this)
		this.dispatchCallback = this.dispatchCallback.bind(this)
	}

	state = { nonce: '' }

	async componentWillMount () {

	}

	async dispatchCallback(response) {
		const { messages, opaqueData } = response
		if ( messages.resultCode === "Ok" ) {
			console.log("successful dispatch to authorize.net", ...messages.message)
			r = await fetch(url, opaqueData)
			console.log("response returned from server: ", r.message)
			this.props.paymentReturned(r)
		}
		else if ( messages.resultCode === "Error" ) {
			console.log("error sending payment to authorize.net", ...messages.message)
			this.props.paymentReturned({ status: "Error", message: "error sending payment to authorize.net" })
		}
	}

	async pay (form) {
		let cardData = form.value
		let paymentData = { cardData, authData }
		
		await Accept.dispatchData(paymentData, this.dispatchCallback)
	}

	render () {
		let { pay } this
		let { bodyStyle, titleStyle } = localStyles
		
		return (
			<div style={ bodyStyle } >
				<h3 style={ titleStyle } >{ title }</h3>
				<div>
					<form onSubmit={ pay } >
						<input type="text" name="cardNumber" placeholder="Card Number" />
						<input type="text" name="month" placeholder="2 digit Expiration Month" />
						<input type="text" name="year" placeholder="4-digit Expiration Year" />
						<input type="text" name="cardCode" placeholder="CVV Value" />
					</form>
				</div>
			</div>
		)
	}
}