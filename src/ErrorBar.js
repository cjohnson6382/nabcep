import React from 'react'
import Error from './Error'

export default class ErrorBar extends React.Component {
	constructor (props) {
		super(props)
		
		this.showError = this.showError.bind(this)
	}
	
	state = {}
	
	async componentWillMount () {
		Error.subscribe("main", this.showError)
	}
	
	async showError (e, id) {
		await this.setState({ [id]: e })
		setInterval(() => {
			let ids = this.state
			delete ids[id]
			this.setState(ids)
		}, 10000)
		return null
	}
	
	async removeError (id) {
		let ids = this.state
		delete ids[id]
		await this.setState(ids)
	}
	
	render () {
		return (
			<div style={ { display: "flex", alignItems: "flex-start", justifyContent: "center" } } >
				{ Object.keys(this.state).length > 0 &&
					<div style={ { display: "flex", flexDirection: "column", position: "absolute",  fontWeight: "bold", fontSize: "125%" } } >
						{ Object.entries(this.state).map(([i, e]) => <div style={ { margin: "0.3em 0 0 0", padding: "1em", background: "darkgrey", color: "white", borderRadius: "0.5em" } } key={ i } onClick={ () => this.removeError(i) } >{ e.message } { i }</div>) }
					</div>
				}
			</div>
		)
	}
}