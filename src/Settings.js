import React from 'react'

import Auth from './Auth'
import { Link } from 'react-router-dom'

import { db } from './utilities'


const localStyles = {
	body: {
		display: "flex",
		flexFlow: "row wrap"
	},
	panel: {
		display: "flex",
		flexFlow: "column wrap",
		flex: 1,
		background: "rgb(229, 229, 229)",
		padding: "1em",
		margin: "1em"
	},
	head: {
		display: "flex",
		borderLeft: "1em solid #f05401",
		background: "#f8981d", padding: "1em"
	},
	title: { alignSelf: "flex-start", fontWeight: "bold", margin: "0 1em 0 1em" },
	settingsItem: { padding: "0.5em", display: "flex", flexFlow: "row wrap" },
	itemTitle: {
		background: "linear-gradient(#b4b4b4, #cacaca)",
		padding: "1rem"
	},
	button: { background: "linear-gradient(#3979d2, #154c94)", color: "white", borders: "none", padding: "0.3em", flex: 1 }
}

export default class Settings extends React.Component {
	constructor (props) {
		super(props)
		
		this.getPayments = this.getPayments.bind(this)
		this.getFiles = this.getFiles.bind(this)
	}
	
	state = { payments: [], files: [] }
	
	async componentWillMount () {
		await this.getPayments()
		await this.getFiles()
	}
	
	componentWillUnmount () {
		const { unsubscribePayments, unsubscribeFiles } = this.state
		if (unsubscribePayments) unsubscribePayments()
		if (unsubscribeFiles) unsubscribeFiles()
	}
	
	async getPayments () {
		const user = await Auth.getUser()
		
		const unsubscribePayments = db.collection("users").doc(user.uid).collection("payments").onSnapshot(pp => {
			const payments = pp.docs.map(d => d.data())
			this.setState({ payments, unsubscribePayments })
		})
	}
	
	async getFiles () {
		const user = await Auth.getUser()
		const unsubscribeFiles = db.collection("users").doc(user.uid).collection("files").onSnapshot(ff => {
			const files = ff.docs.map(f => f.data())
			this.setState({ files, unsubscribeFiles })
		})
	}
	
	
	render () {
		const { payments, files } = this.state
		
		return (
			<div>
				<div style={ localStyles.head } ><h3 style={ localStyles.title } >Settings</h3></div>
				<div>
					<div style={ { display: "flex", flexFlow: "column wrap", padding: "0.5em", background: "rgb(229, 229, 229)", margin: "0.5em" } } >
						<h3 style={ localStyles.itemTitle } >Account Information</h3>
						<div style={ localStyles.settingsItem } >
							<div style={ { fontWeight: "bold", paddingRight: "0.5em" } } >Username</div>
							<div>{ Auth.currentUser.displayName }</div>
						</div>
						<div style={ localStyles.settingsItem } >
							<div style={ localStyles.button } onClick={ () => console.log("implement me") } >Change Password</div>
						</div>
					</div>
				</div>
				<div style={ localStyles.body } >
					<div style={ localStyles.panel } >
						<h3 style={ localStyles.itemTitle } >Your Payments</h3>
						{ payments.map((p, i) => <div key={ i } >{ p.payment.refId }</div>) }
					</div>
					<div style={ localStyles.panel } >
						<h3 style={ localStyles.itemTitle } >Your Files</h3>
						{ files.map((f, i) => <div key={ i } >{ f.name }</div>) }
					</div>
				</div>
			</div>
		)
	}
}