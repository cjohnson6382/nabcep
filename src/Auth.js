import createHistory from 'history/createBrowserHistory'
import { db, firebase } from './utilities'
import Error from './Error'

const history = createHistory({ forceRefresh: true })

class Auth {
	constructor () {
		this.providerLogin = this.providerLogin.bind(this)
		this.logout = this.logout.bind(this)
		this.isAuthenticated = this.isAuthenticated.bind(this)
		
		
	}

	connected = false
	currentUser = firebase.auth().currentUser
	dbUser = null
	notificationList = []

	providerMap = {
		google: new firebase.auth.GoogleAuthProvider(),
		facebook: new firebase.auth.FacebookAuthProvider()
	}

	async providerLogin (providerName) {
		let provider = this.providerMap[providerName]
		
		if (providerName === "google") {
			provider.addScope("https://www.googleapis.com/auth/firebase")
			provider.addScope("profile")
		}


		try {
			await firebase.auth().signInWithPopup(provider)
			listenForAuth()
		}
		catch (e) {
			console.log("error signing in", e)
		}
	}

	async getUser () {
		if (this.connected) return Promise.resolve(this.currentUser)
		else {
			try {
				const currentUser = await waitForConnect()
				this.currentUser = currentUser
				this.connected = true

				try {
					await this.getDBUser()
					return currentUser
				}
				catch (e) {
					console.log(e)
					return {}
				}
			}
			catch (e) {
				console.log(e)
				return {}
			}
		}
	}
	
	async getDBUser () {
		try {
			const dbUser = await db.collection("users").doc(this.currentUser.uid).get()
			this.dbUser = dbUser.data()
		}
		catch (e) {
			console.log(e)
		}
	}

	isAuthenticated () {
		return !!firebase.auth().currentUser
	}

	subscribeToInitNotification (f) { this.notificationList.push(f) }

	logout () {
		firebase.auth().signOut()
		this.dbUser = null
		history.replace('/')
	}
	
}

export default (new Auth())

export const registerUsername = async name => {
	let id = firebase.auth().currentUser.uid
	let timestamp = firebase.firestore.FieldValue.serverTimestamp()

	console.log(firebase.auth().currentUser.uid)
	let u = await db.collection("users").doc(firebase.auth().currentUser.uid).get()

	let user = !u.exists ? { id, name, created: timestamp, updated: timestamp, pending: false } : Object.assign({}, u.data(), { updated: timestamp, name })

	try {
		await db.collection("users").doc(id).set(user)
		console.log("successfully created/updated user")
		return null
	} catch (e) {
		console.log("error setting body to pending collection: ", e)
		return { message: "error setting body to pending collection", error: e }
	}

}

const waitForConnect = () => {
	return new Promise((resolve, reject) => {
		let unsubscribe = firebase.auth().onAuthStateChanged(
			user => {
				if (user) {
					resolve(user)
					unsubscribe()
				}
			},
			error => reject(error)
		)
	})
}

export const listenForAuth = async () => {
	try {
		const user = await waitForConnect()
		if (user) {
			let u = await db.collection("users").doc(user.uid).get()
			const localUser = u.data()
		
			if (firebase.auth().currentUser.uid && !u.exists) {
				history.replace("/register")
			}
	
			if (localUser.pending === true) {
			  console.log("about to push to pending: ", u)
			  history.replace("/pending")
			}
	
			if (localUser.pending === false) {
				console.log("user is all setup and ready to be used")
				history.replace("/")
			}
			
			console.log("didn't trip any of the if conditions")
		}
		else {
			console.log("pushing back to login")
			Error.error("login failed for an unknown reason")
		  	history.replace("/login")
		}
	}
	catch (e) { console.log(e) }
}