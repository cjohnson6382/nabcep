import React from 'react'

const Footer = () => (
	<div style={ { borderLeft: "1em solid #f05401", background: "#656363", padding: "1em", display: "flex", justifyContent: "center", alignItems: "Center", flexDirection: "row", color: "white" } } >
		<h1 style={ { position: "absolute", alignItems: "center", justifyContent: "center", opacity: "0.5", color: "white", fontWeight: "bold" } } >THE FOOTER IS ALL STATIC PLACEHOLDER CONTENT</h1>
		<div style={ { flex: 1, display: "flex", flexDirection: "column" } } >
			<div style={ { fontWeight: "bold", color: "#fe8a19" } } >NAME</div>
			<div>address 1</div>
			<div>address 2</div>
			<div>city, state, zip</div>
		</div>
		<div style={ {  border: "0.05em solid white", height: "10em", margin: "0 1em 0 1em" } } ></div>
		<div style={ { flex: 1, display: "flex", flexDirection: "column" } } >
			<div>PHONE: </div>
			<div>FAX: </div>
			<div>HOURS: </div>
			<div>EMAIL: </div>
		</div>
		<div style={ {  border: "0.05em solid white", height: "10em", margin: "0 1em 0 1em" } } ></div>
		<div style={ { flex: 1, display: "flex", flexDirection: "column" } } >
			<div style={ { fontSize: "125%", color: "#fe8a19" } } >Who's Online</div>
			<div>There are Currently 1 <i>user</i> and 0 <i>guests</i> online</div>
			<div style={ { fontSize: "125%" } } >Online Users</div>
			<div>guest@example.com</div>
		</div>
		<div style={ {  border: "0.05em solid white", height: "10em", margin: "0 1em 0 1em" } } ></div>
		<div style={ { flex: 3, display: "flex", flexDirection: "row" } } >
			<div style={ { flex: 1 } } ></div>
			<div style={ { flex: 2, flexFlow: "row wrap", padding: "0 2em 0 0" } } >If you’re having any difficulty with this site, please email <a href="/">webmaster@nabcep.org</a></div>
		</div>
	</div>
)

export default Footer