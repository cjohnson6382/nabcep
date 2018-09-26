import React from 'react'

import { Link } from 'react-router-dom'

import Icon from './Icon'
import Auth from './Auth'

import NotificationMenu from './NotificationMenu'

const localStyles = {
	notificationsMenu: s => ({ 
		position: "absolute", 
		alignItems: "center", 
		justifyContent: "center", 
		backgroundColor: "white", 
		color: "black",
		display: s ? "initial" : "none"
	})
}

export default class Header extends React.Component {
	state = { currentUser: null, notifications: false }
	
	async componentWillMount () {
		const currentUser = await Auth.getUser()
		
		this.setState({ currentUser, notifications: false })
	}
	
	render () {
		const { currentUser, notifications } = this.state
		console.log(notifications)
		
		return (
			<div style={ { background: "linear-gradient(to right, transparent, transparent, 45%, #00539f)", color: "white", display: "flex", justifyContent: "center", alignItems: "Center" } } >
				<Link to="/" style={ { flex: 4, display: "flex" } } ><img src='logo.png' alt="logo" style={ { alignSelf: "flex-start", background: "white", height: "100%" } } /></Link>
				<div style={ { flex: 8 } } ></div>
				{ !currentUser &&
					<div style={ { flex: 6, display: "flex", flexDirection: "row", justifyContent: "flex-end", alignSelf: "flex-start", padding: "0.5em" } } >
						<Link to="/login" style={ { color: "#f8981d", padding: "0 0.5em 0 0.5em" } }>Login</Link>
						<Link to="/register" style={ { color: "#f8981d", padding: "0 0.5em 0 0.5em" } }>Register</Link>
					</div>
				}
				{ currentUser &&
					<div style={ { flex: 12, display: "flex", flexFlow: "row wrap", alignItems: "center", justifyContent: "flex-end", padding: "0.5em 1em 0.5em 0.5em" } } >
						<div style={ { fontSize: "200%", color: "#f8981d", padding: "0 1rem 0 0", cursor: "pointer" } } >
							<div onClick={ () => this.setState({ notifications: !notifications }) } ><Icon icon="fa fa-bell" /></div>
						{ /* this.setState({ notifications: false }) */ }
							<div onMouseLeave={ () => this.setState({ notifications: false }) } style={ localStyles.notificationsMenu(notifications) } ><NotificationMenu /></div>
						</div>
						<div style={ { padding: "0 0.3em 0 0" } } >Welcome</div>
						<div style={ { fontWeight: "bold", padding: "0 0.3em 0 0" } } >{ currentUser.displayName }</div>
						<div style={ { padding: "0 0.3em 0 0", height: "0.4em", width: "0.4em", backgroundColor: "white", borderRadius: "50%", fontSize: "1em" } } ></div>
						<Link to="/settings" style={ { color: "#f8981d", padding: "0 0.3em 0 0.3em", cursor: "pointer" } } ><Icon icon="fas fa-cog" /></Link>
						<div style={ { padding: "0 0.3em 0 0", height: "0.4em", width: "0.4em", backgroundColor: "white", borderRadius: "50%", fontSize: "1em" } } ></div>
						<div style={ { color: "#f8981d", padding: "0 0 0 0.3em", cursor: "pointer" } } onClick={ () => Auth.logout() } >Logout</div>
					</div>
				}
			</div>
		)
	}
}
