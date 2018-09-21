import React from 'react'

import Auth from './Auth'
import { Link } from 'react-router-dom'

import { db, storage } from './utilities'


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
		
		this.storageRef = storage.ref()
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
	
	async downloadFile (name, index) {
		const file = this.state.files[index]
		const fileRef = this.storageRef.child(file.fullPath)
		const url = await fileRef.getDownloadURL()
		window.open(url, '_blank')
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
						<div style={ { display: "flex", flexFlow: "row wrap", fontWeight: "bold" } } >
							<div style={ { flex: 2 } } >Transaction ID</div>
							<div style={ { flex: 1 } } >Account Number</div>
							<div style={ { flex: 1 } } >Account Type</div>
						</div>
						{ payments.map((p, i) => (
							<div key={ i } style={ { display: "flex", flexFlow: "row wrap", justifyContent: "space-around", padding: "0 0 0.5em 0" } } >
								<div style={ { flex: 2 } } >{ p.payment.refId }</div>
								<div style={ { flex: 1 } } >{ p.payment.transactionResponse.accountNumber }</div>
								<div style={ { flex: 1 } } >{ p.payment.transactionResponse.accountType }</div>
							</div>
						) ) }
					</div>
					<div style={ localStyles.panel } >
						<h3 style={ localStyles.itemTitle } >Your Files</h3>
						<div>
							<div style={ { flex: 1, fontWeight: "bold" } } >Name</div>
						</div>
						{ files.map((f, i) => (
							<div style={ { flex: 1, cursor: "pointer" } } onClick={ () => this.downloadFile(f.name, i) } key={ i } >{ f.name }</div>
						) ) }
					</div>
				</div>
			</div>
		)
	}
}