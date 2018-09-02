import React from 'react'
import Test from './Test'
import Header from './Header'
import Footer from './Footer'

import { BrowserRouter, Route } from 'react-router-dom' // , Redirect

import './App.css'

class App extends React.Component {
	render() {
		return (
			<BrowserRouter>
				<div style={ { backgroundImage: "url(./background.jpg)", backgroundSize: "cover", padding: "3em" } } className="App">
					<Header />
					<Route exact path="/" render={ routeProps => <Test title="Test Page Title" { ...routeProps } /> } />
					<Route exact path="/test" render={ routeProps => <Test title="Test Page Title" { ...routeProps } /> } />
					<Footer />
				</div>
			</BrowserRouter>
		)
	}
}

export default App
