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
	},
	head: {
		display: "flex",
		borderLeft: "1em solid #f05401",
		background: "#f8981d", padding: "1em"
	},
	titleStyle: { alignSelf: "flex-start", fontWeight: "bold", margin: "0 1em 0 1em" },
	box: { padding: "0.5em", display: "flex", flexFlow: "row wrap" },
	boxTitle: {
		background: "linear-gradient(#b4b4b4, #cacaca)",
		padding: "1rem"
	},
	panel: {
		display: "flex",
		flexFlow: "column wrap",
		flex: 1,
		background: "rgb(229, 229, 229)",
		padding: "1em",
		margin: "1em"
	},
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

	state = { amount: "", cardNumber: "", year: "", month: "", cardCode: "", status: null, user: null }

	async componentWillMount () {
		const user = await this.props.auth.getUser()
		this.setState({ user })
	}

	async dispatchCallback(response) {
		const { amount, user, paymentId } = this.state
		
		const { messages, opaqueData } = response
		if ( messages.resultCode === "Ok" ) {
			console.log("successful dispatch to authorize.net", ...messages.message)
			
			let options = {
				method: "POST",
				mode: "cors",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(Object.assign({}, { opaqueData, amount: Number(amount), refId: user.uid } ))
			}
			
			try {
				let r = await fetch(url, options)
				let payment = await r.json()
	
				const batch = db.batch()
	
				const pRef = db.collection("payments").doc(paymentId)
				const uRef = db.collection("users").doc(user.uid)
				// pRef.set({ payment }, { merge: true })
				batch.set(pRef, { payment }, { merge: true })
				batch.set(uRef.collection("payments").doc(paymentId), { payment }, { merge: true })
				
				try {
					await batch.commit()
					this.setState({ status: payment, amount: "", cardNumber: "", year: "", month: "", cardCode: "" })
					
					setTimeout(() => this.setState({ status: null }), 10000)
					
					this.props.paymentReturned(payment)
				}
				catch (e) { console.log("batch commit of payment data failed: ", e) }
			}
			catch (e) {
				console.log("posting to the /pay route failed", e)
			}
			
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

		try {
			await this.setState({ paymentId: pRef.id })
			await pRef.set(paymentData)
			
			await window.Accept.dispatchData(paymentData, this.dispatchCallback)
		}
		catch (e) {
			console.log("something went wrong in the pay function", e)
		}

	}

	render () {
		let { pay, change } = this
		let { boxTitle, panel, head, titleStyle, payForm, labelStyle, fieldStyle, inputStyle, buffer } = localStyles
		let { button } = styles
		let { title } = this.props
		let { status } = this.state
		
		return (
			<div>
				<div style={ head } ><h3 style={ titleStyle } >{ title }</h3></div>
				<div>
					<form onSubmit={ pay } style={ payForm } >
						<div style={ panel } >
							<h4 style={ boxTitle } >Amount</h4>
							<div style={ inputStyle } >
								<label style={ labelStyle } >Amount</label>
								<input style={ fieldStyle } type="text" id="amount" name="amount" placeholder="Amount in 000.00 form" value={ this.state.amount } onChange={ e => change(e) } />
							</div>
						</div>
						<div style={ panel } >
							<h4 style={ boxTitle } >Credit Card Information</h4>
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
						</div>
					</form>
				</div>
				{ status && <div style={ localStyles.statusMessage } ><pre style={ { color: "white", textAlign: "left" } } >{ JSON.stringify(status, null, 2) }</pre></div> }
			</div>
		)
	}
}