import React from 'react'
import PropTypes from 'prop-types'
import createHistory from 'history/createBrowserHistory'

import { Redirect } from 'react-router-dom'

import { db, firebase } from './utilities'
import Auth from './Auth'

const history = createHistory({ forceRefresh: true })

export default class CheckRegistration extends React.Component {
  static propTypes = {
    component: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.checkRegistration = this.checkRegistration.bind(this)
  }

  state = { loading: true, user: {} }

  async componentWillMount () { this.checkRegistration() }

  async getUser () {

    let u = await db.collection("users").doc(firebase.auth().currentUser.uid).get()
    let user = u.data()

    this.setState({ user, loading: false })
  }

  async checkRegistration () {
  	const { auth } = this.props
  	
  	try {
  		console.log("mark 1")
  		
	  	const user = await auth.getUser()
	  	
	  	console.log("mark 0")
	  	
	  	
		user.uid ? this.setState({ user: auth.dbUser, loading: false }) : history.push("/login")
  	}
  	catch (e) { console.log(e) }

  }

  render () {
    let Component = this.props.Component
    let { user } = this.state

    return (
        <div style={ { width: "100%", height: "100%" } } >
          {
            this.state.loading ?
              <div style={ { color: "#bebfbd" } } >Loading ... </div>
            :
              user && user.pending ?
                  <Redirect to={ { pathname: "/pending" } } />
                :
                  <Component { ...{ ...this.props, auth: Auth } } />
          }
        </div>
    )
  }
}