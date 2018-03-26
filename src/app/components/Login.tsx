import * as React from 'react'
import { connect } from 'react-redux'
import { login } from '../actions'
const styles = require('./Login.css')

class Login extends React.Component {
  state = {
    loginError: null,
    email: 'joe@example.com',
    password: '123456',
  }

  props: {
    login: Function,
    session: any,
  }

  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange (e) {
    const target = e.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name
    this.setState({ [name]: value })
  }

  handleSubmit (e) {
    e.preventDefault()
    const { email, password } = this.state
    this.props.login(email, password)
  }

  render() {
    return (
      <div className={styles.root}>
        <div className={styles.inner}>
          <form onSubmit={this.handleSubmit}>
            <div>
              <input placeholder="email" name="email" value={this.state.email} onChange={this.handleChange} />
            </div>
            <div>
              <input placeholder="password" name="password" value={this.state.password} onChange={this.handleChange} />
            </div>
            <div>
              <button className={styles.button} type="submit">login</button>
            </div>
            <div>
              {this.state.loginError && (
                <p>Login error: {this.state.loginError}</p>
              )}
              {this.props.session && (
                <p>You’re logged in as: {this.props.session.user.email}</p>
              )}
            </div>
          </form>
        </div>
      </div>   
    )
  }
}

const stateToProps = state => ({
  session: state.app.session,
})

const actions = { login }

export default connect(stateToProps, actions)(Login)
