import React from 'react'

import { db } from './utilities'

const localStyles = {
	head: {
		display: "flex",
		borderLeft: "1em solid #f05401",
		background: "#f8981d", padding: "1em"
	},
	titleStyle: { alignSelf: "flex-start", fontWeight: "bold", margin: "0 1em 0 1em" },
	logLine: { padding: "0.5rem", margin: "0.5rem", flex: 1 }
}

export default class LogView extends React.Component {
	constructor (props) {
		super(props)
	}

	state = { logs: [] }

	async componentWillMount () {
		db.collection("logs").orderBy("created").limit(20).onSnapshot(ll => {
			const logs = ll.docs.map(l => l.data())
			this.setState({ logs })
		})
	}

	render () {
		const { logs } = this.state
		const { head, titleStyle } = localStyles

		return (
			<div>
				<div style={ head } ><h3 style={ titleStyle } >Application Logs</h3></div>
				<div style={ { margin: "2rem 0 0 0", background: "linear-gradient(#b4b4b4, #cacaca)", display: "flex", flexDirection: "row" } } >
					<div style={ { ...localStyles.logLine, fontWeight: "bold" } } >ID</div>
					<div style={ { ...localStyles.logLine, fontWeight: "bold" } } >Message</div>
					<div style={ { ...localStyles.logLine, fontWeight: "bold" } } >Code</div>
				</div>
				<div style={ { display: "flex", flexFlow: "row wrap", padding: "0 0 1rem 0" } } >{ logs.map(l => 
					<div style={ { background: "rgba(255, 255, 255, 0.7)", display: "flex", flexFlow: "row nowrap", flex: 1 } } key={ l.id } >
						<div style={ localStyles.logLine } >{ l.id }</div>
						<div style={ localStyles.logLine } >{ l.message }</div>
						<pre style={ { ...localStyles.logLine, textAlign: "left" } } >{ JSON.stringify(l.code, null, 2) }</pre>
					</div>
					
				) }</div>
			</div>
		)
	}
}