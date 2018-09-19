import { db } from './utilities'

function* gen () {
	let index = 0
	while (true) yield ++index
}

const counter = gen()

class Error {
	constructor () {
		this.error = this.error.bind(this)
		this.subscribe = this.subscribe.bind(this)
		this.unsubscribe = this.unsubscribe.bind(this)
		this.publishError = this.publishError.bind(this)
		
		this.subscribers = {}
	}
	
	error (e) {
		let errNum = counter.next().value.toString()
		
		db.collection("errors").doc(errNum).set(e)
		this.publishError(e, errNum)
	}
	
	subscribe (id, f) { this.subscribers[id] = f }
	unsubscribe (id) { delete this.subscribers[id] }
	
	async publishError (e, errNum) {
		try { Object.values(this.subscribers).map(async f => await f(e, errNum)) }
		catch (e) { console.log("one of the error subscribers errored out: ", e) }
	}
}

export default (new Error())