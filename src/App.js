import React from 'react'
import Test from './Test'
import Header from './Header'
import Footer from './Footer'
import Pay from './Pay'

import { BrowserRouter, Route } from 'react-router-dom' // , Redirect

import './App.css'

class App extends React.Component {
	render() {
		return (
			<BrowserRouter>
				<div style={ { backgroundImage: "url(./background.jpg)", backgroundSize: "cover", padding: "3em" } } className="App">
					<Header />
					<Route exact path="/" render={ routeProps => <Test title="DASHBOARD" { ...routeProps } /> } />
					<Route exact path="/pay" render={ routeProps => <Pay auth={{}} { ...routeProps } title="Make a Payment" paymentReturned={ (r) => console.log("paymentReturned:", r) } /> } />
					<Footer />
				</div>
			</BrowserRouter>
		)
	}
}

export default App
