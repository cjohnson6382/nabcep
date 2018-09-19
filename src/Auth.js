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

	currentUser = firebase.auth().currentUser
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

	isAuthenticated () {
		return !!firebase.auth().currentUser
	}

	subscribeToInitNotification (f) { this.notificationList.push(f) }

	logout () {
		firebase.auth().signOut()
		history.replace('/')
	}
	
}

export default (new Auth())

export const registerUsername = async name => {
	let id = firebase.auth().currentUser.uid
	let timestamp = firebase.firestore.FieldValue.serverTimestamp()

	console.log(firebase.auth().currentUser.uid)
	let u = await db.collection("users").doc(firebase.auth().currentUser.uid).get()

	let user = !u.exists ? { id, name, created: timestamp, updated: timestamp, pending: true } : Object.assign({}, u.data(), { updated: timestamp, name })

	try {
		await db.collection("users").doc(id).set(user)
		console.log("successfully created/updated user")
		return null
	} catch (e) {
		console.log("error setting body to pending collection: ", e)
		return { message: "error setting body to pending collection", error: e }
	}

}

export const listenForAuth = () => {
	console.log("listening for auth change")
	let unsubscribe = firebase.auth().onAuthStateChanged(async user => {
		console.log("auth state has changed: ", user)
		if (user) {
			let u = await db.collection("users").doc(user.uid).get()
		
			if (firebase.auth().currentUser.uid && !u.exists) {
				history.push("/register")
			}

			if (u.pending === true) {
			  console.log("about to push to pending: ", u)
			  history.push("/pending")
			}

			if (u.pending === false) {
				console.log("user is all setup and ready to be used")
				history.push("/")
			}
		}
		else {
			console.log("pushing back to login")
			Error.error("login failed for an unknown reason")
		  	history.push("/login")
		}
		
		unsubscribe()
	})
}