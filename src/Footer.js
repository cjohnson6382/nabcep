import React from 'react'

const Footer = () => (
	<div style={ { borderLeft: "0.5em solid #f05401", background: "#f8981d", padding: "1em", display: "flex", justifyContent: "center", alignItems: "Center", flexDirection: "row" } } >
		<div style={ { flex: 1, display: "flex", flexDirection: "column" } } >
			<div style={ { fontWeight: "bold" } } >NAME</div>
			<div>address 1</div>
			<div>address 2</div>
			<div>city, state, zip</div>
		</div>
		<div style={ { flex: 1, display: "flex", flexDirection: "column" } } >
			<div>PHONE: </div>
			<div>FAX: </div>
			<div>HOURS: </div>
			<div>EMAIL: </div>
		</div>
		<div style={ { flex: 1, display: "flex", flexDirection: "column" } } >
			<div style={ { fontSize: "125%" } } >Who's Online</div>
			<div>There are Currently 1 <i>user</i> and 0 <i>guests</i> online</div>
			<div style={ { fontSize: "125%" } } >Online Users</div>
			<div>guest@example.com</div>
		</div>
		<div style={ { flex: 3, display: "flex", flexDirection: "row" } } >
			<div style={ { flex: 1 } } ></div>
			<div style={ { flex: 2, flexFlow: "row wrap", padding: "0 2em 0 0" } } >If you’re having any difficulty with this site, please email <a href="#">webmaster@nabcep.org</a></div>
		</div>
	</div>
)

export default Footer