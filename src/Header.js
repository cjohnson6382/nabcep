import React from 'react'

const Header = () => (
	<div style={ { background: "linear-gradient(to right, white, white, 33%, #00539f, 45%, #00539f)", color: "white", display: "flex", justifyContent: "center", alignItems: "Center" } } >
		<div style={ { flex: 4, display: "flex" } } ><img src='logo.png' alt="logo" style={ { alignSelf: "flex-start", background: "white", height: "100%" } } /></div>
		<div style={ { flex: 8 } } ></div>
		<div style={ { flex: 6, display: "flex", flexDirection: "row", alignItems: "center", alignSelf: "flex-start", padding: "0.5em" } } >
			<div style={ { padding: "0 0.3em 0 0" } } >Welcome</div>
			<div style={ { fontWeight: "bold", padding: "0 0.3em 0 0" } } >User</div>
			<div style={ { padding: "0 0.3em 0 0", height: "0.4em", width: "0.4em", backgroundColor: "white", borderRadius: "50%", fontSize: "1em" } } ></div>
			<div style={ { color: "#f8981d", padding: "0 0.3em 0 0.3em" } } >Change Your Password</div>
			<div style={ { padding: "0 0.3em 0 0", height: "0.4em", width: "0.4em", backgroundColor: "white", borderRadius: "50%", fontSize: "1em" } } ></div>
			<div style={ { color: "#f8981d", padding: "0 0 0 0.3em" } } >Logout</div>
		</div>
	</div>
)

export default Header