import React from 'react'
import PropTypes from "prop-types"

import { Link } from 'react-router-dom'

import Icon from './Icon'
import Auth from './Auth'

import { db } from './utilities'

const localStyles = {
	list: { 
		display: "flex", 
		flexFlow: "column", 
		alignItems: "stretch", 
		backgroundColor: "grey"
	},
	notification: r => ({
		backgroundColor: r ? "grey" : "white",
		padding: "0.5rem",
		color: "black",
		textDecoration: "none",
		cursor: "pointer",
		flex: 1
	})
}

export default class NotificationMenu extends React.Component { 
	static propTypes = { show: PropTypes.bool }

	constructor (props) {
		super(props)

		this.getNotifications = this.getNotifications.bind(this)
		this.click = this.click.bind(this)
		this.refresh = this.refresh.bind(this)
	}

	state = { currentUser: null, notifications: {} }
	
	async componentWillMount () {
		try {
			const currentUser = await Auth.getUser()
			await this.setState({ currentUser })

			await this.getNotifications()			
		}
		catch (e) { console.log(e) }

	}

	async getNotifications () {
		const notifications = { "123": { id: "123", message: "go home", url: "/", read: false }, "456": { id: "456", message: "pay", url: "/pay", read: false } }

		this.setState({ notifications  })

/*		
		try {
			await db.collection("users").doc(this.state.currentUser.uid).collection("notifications").orderBy("created").limit(10).onSnapshot(nn => {
				const notifications = nn.docs.map(n => Object.assign( {}, n.data(), { id: n.id } ) )
				this.setState({ notifications })
			})			
		}
		catch (e) { console.log(e) }
*/
	}

	async click (notification) {
		try {
			const { notifications } = this.state
			notifications[notification.id].read = true

/*
			await db.collection("users").doc(this.state.currentUser.uid)
				.collection("notifications").doc(notification.id).set({ read: true }, { merge: true })
*/

			console.log(notification.url)

			this.setState({ notifications })		
		}
		catch (e) {
			console.log(e)
		}

	}

	refresh () {
		const { notifications } = this.state
		for (let id in notifications) {
			notifications[id].read = false
		}

		this.setState({ notifications })
	}

	render () {
		const { notifications } = this.state

		return (
			<div style={ { fontSize: "75%", backgroundColor: "grey" } } >
				<div style={ { color: "white", padding: "1rem" } } >Dummy Notification Menu</div>
				<div style={ localStyles.list } >{ Object.values(notifications).map(n => 
					<div style={ localStyles.notification(n.read) } onClick={ () => this.click(n) } key={ n.id } >{ n.message }</div>
				) }</div>
				<div onClick={ this.refresh } >Refresh Notifications</div>
			</div>
		)
	}
}