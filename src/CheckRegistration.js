import React from 'react'
import PropTypes from 'prop-types'

import { Redirect } from 'react-router-dom'

import { db, firebase } from './utilities'
import Auth, { listenForAuth } from './Auth'

export default class CheckRegistration extends React.Component {
  static propTypes = {
    component: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.checkRegistration = this.checkRegistration.bind(this)
  }

  state = { loading: true, user: {} }

  async componentWillMount () {
    this.checkRegistration()
  }

  async getUser () {

    let u = await db.collection("users").doc(firebase.auth().currentUser.uid).get()
    let user = u.data()

    this.setState({ user, loading: false })
  }

  async checkRegistration () {
  	console.log(Auth.isAuthenticated())
  	console.log("in checkRegistration")

  	if (Auth.isAuthenticated()) {
  		this.getUser()
  	}
  	else {
  		console.log("listening for auth..., in App.js")
  		listenForAuth()
  	}
    // auth.isAuthenticated() ? this.setState({ loading: false }) : this.setState({ loading: true })
  }

  render () {
    let Component = this.props.Component
    let { user } = this.state

    console.log(user)

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