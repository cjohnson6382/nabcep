import React from 'react'
import TestRenderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import Pay from './Pay'

// jest.unmock('./utilities')
// import * as utilities from './utilities'

const propz = {
	auth: {},
	title: "paymentform",
	paymentReturned: jest.fn()
}

const paymentData = {
	cardData: {
		cardNumber: "16 digit card number",
		year: "23",
		month: "03",
		cardCode: "123"
	},
	authData: {
		clientKey: "clientKey",
		apiLoginID: "apiLoginID"
	}
}

fetch = jest.fn()
fetch.mockReturnValue({ json: () => ({ ret: "value" }) })

global.window.Accept = {
	dispatchData: (pd, callback) => {
		expect(pd.cardData).toEqual(paymentData.cardData)
		callback()
	}
}

describe('Pay', () => {
	let p = null

	it('renders', () => {
		p = TestRenderer.create(<Pay { ...propz } />)
	})
	
	it('change', () => {
		const c = { target: { value: "val", attributes: { name: { value: "nam" } } } }

		p.root.instance.change(c)
		expect(p.root.instance.state[c.target.attributes.name.value]).toEqual(c.target.value)
	})

	it('dispatchCallback', async () => {
		const amount = 20.00
		await p.root.instance.setState({ amount })
		const fetchReturn = { ret: "value" }

		let response = { messages: { resultCode: "Ok", message: [ "first message", "second message" ] }, opaqueData: { data: "daters" } }
		const fetchBody = JSON.stringify(Object.assign({}, { opaqueData: response.opaqueData, amount: Number(amount), refId: `refId${amount}` } ))
		
		let options = {
			method: "POST",
			mode: "cors",
			headers: { "content-type": "application/json" },
			body: fetchBody
		}
		
		// test with a successful pay call
		await p.root.instance.dispatchCallback(response)

		expect(propz.paymentReturned.mock.calls.length).toEqual(1)
		expect(fetch.mock.calls[0][1]).toEqual(options)
		expect(propz.paymentReturned.mock.calls[0][0]).toEqual(fetchReturn)

		// test with a failed pay call
		response = { messages: { resultCode: "Error", message: [ "first error", "second error" ] }, opaqueData: { data: "errorororro" } }
		
		await p.root.instance.dispatchCallback(response)
		expect(propz.paymentReturned.mock.calls.length).toEqual(2)
		expect(propz.paymentReturned.mock.calls[1][0]).toEqual({ status: "Error", message: "error sending payment to authorize.net" })
	})

	it('pay', async () => {
		const c = { preventDefault: jest.fn() }
		
		const { cardNumber, year, month, cardCode } = paymentData.cardData
		
		await p.root.instance.setState({ cardNumber, year, month, cardCode })
		
		p.root.instance.dispatchCallback = jest.fn()
		
		await p.root.instance.pay(c)
		
		expect(c.preventDefault.mock.calls.length).toEqual(1)
		expect(p.root.instance.dispatchCallback.mock.calls.length).toEqual(1)
	})

	it('tests DOM functionality', () => {
		console.log("test DOM with change(e) function")
	})
})