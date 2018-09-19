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
import styles from './styles'

import { authorizenetConfigDev } from './config'

const authData = {
	clientKey: authorizenetConfigDev.REACT_APP_CLIENT_KEY,
	apiLoginID: authorizenetConfigDev.REACT_APP_API_LOGIN_ID
}

const url = "https://us-central1-nabcep-270f4.cloudfunctions.net/api/pay/"

const localStyles = {
	bodyStyle: {
		padding: "2em"
	},
	titleStyle: {
		padding: "1em"
	},
	payForm: {
		display: "flex",
		flexDirection: "column"
	},
	labelStyle: {
		padding: "0 0.5em 0 0",
		flex: 1,
		fontWeight: "bold"
	},
	fieldStyle: {
		flex: 2,
		padding: "0.3em",
		borderRadius: "0.3em",
		border: "none"
	},
	inputStyle: {
		display: "flex",
		alignItems: "center",
		padding: "0.5em"
	},
	buffer: {
		flex: 2
	},
	statusMessage: {
		fontWeight: "bold",
		background: "black",
		color: "white",
		borderRadius: "0.5em",
		padding: "1em",
		margin: "1em"
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
		this.change = this.change.bind(this)
		this.dispatchCallback = this.dispatchCallback.bind(this)
	}

	state = { amount: "", cardNumber: "", year: "", month: "", cardCode: "", status: null }

	// async componentWillMount () {

	// }

	async dispatchCallback(response) {
		const { amount } = this.state
		
		const { messages, opaqueData } = response
		if ( messages.resultCode === "Ok" ) {
			console.log("successful dispatch to authorize.net", ...messages.message)
			
			let options = {
				method: "POST",
				mode: "cors",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(Object.assign({}, { opaqueData, amount: Number(amount), refId: `refId${amount}` } ))
			}
			
			let r = await fetch(url, options)
			let payment = await r.json()

			const pRef = db.collection("payments").doc(this.state.paymentId)
			pRef.set({ payment }, { merge: true })
			this.setState({ status: payment, amount: "", cardNumber: "", year: "", month: "", cardCode: "" })
			
			setTimeout(() => this.setState({ status: null }), 10000)
			
			this.props.paymentReturned(payment)
		}
		else if ( messages.resultCode === "Error" ) {
			console.log("error sending payment to authorize.net", ...messages.message)
			this.props.paymentReturned({ status: "Error", message: "error sending payment to authorize.net" })
		}
	}

	change (e) { this.setState({ [e.target.attributes.name.value]: e.target.value }) }

	async pay (e) {
		e.preventDefault()

		let { cardNumber, year, month, cardCode } = this.state
		
		let cardData = { cardNumber, year, month, cardCode }
		let paymentData = { cardData, authData }
		
		const pRef = db.collection("payments").doc()

		await this.setState({ paymentId: pRef.id })
		await pRef.set(paymentData)
		
		await window.Accept.dispatchData(paymentData, this.dispatchCallback)
	}

	render () {
		let { pay, change } = this
		let { bodyStyle, titleStyle, payForm, labelStyle, fieldStyle, inputStyle, buffer } = localStyles
		let { button } = styles
		let { title } = this.props
		let { status } = this.state
		
		return (
			<div style={ bodyStyle } >
				<h3 style={ titleStyle } >{ title }</h3>
				<div>
					<form onSubmit={ pay } style={ payForm } >
						<h4 style={ { alignSelf: "flex-start" } } >Amount</h4>
						<div style={ inputStyle } >
							<label style={ labelStyle } >Amount</label>
							<input style={ fieldStyle } type="text" id="amount" name="amount" placeholder="Amount in 000.00 form" value={ this.state.amount } onChange={ e => change(e) } />
						</div>
						<h4 style={ { alignSelf: "flex-start" } } >Credit Card Information</h4>
						<div style={ inputStyle } >
							<label style={ labelStyle } >Card Number</label>
							<input style={ fieldStyle } type="text" id="cardNumber" name="cardNumber" placeholder="Card Number" value={ this.state.cardNumber } onChange={ e => change(e) } />
						</div>
						<div style={ inputStyle } >
							<label style={ labelStyle } >Month</label>
							<input style={ fieldStyle } type="text" id="month" name="month" placeholder="2 digit Expiration Month" value={ this.state.month } onChange={ e => change(e) } />
						</div>
						<div style={ inputStyle } >
							<label style={ labelStyle } >Year</label>
							<input style={ fieldStyle } type="text" id="year" name="year" placeholder="4-digit Expiration Year" value={ this.state.year } onChange={ e => change(e) } />
						</div>
						<div style={ inputStyle } >
							<label style={ labelStyle } >CVV</label>
							<input style={ fieldStyle } type="text" id="cardCode" name="cardCode" placeholder="CVV Value" value={ this.state.cardCode } onChange={ e => change(e) } />
						</div>
						<div style={ { display: "flex" } } >
							<div style={ buffer } ></div>
							<input type="submit" value="Pay" style={ { ...button, flex: 1 } } />
							<div style={ buffer } ></div>
						</div>
					</form>
				</div>
				{ status && <div style={ localStyles.statusMessage } ><pre style={ { color: "white", textAlign: "left" } } >{ JSON.stringify(status, null, 2) }</pre></div> }
			</div>
		)
	}
}