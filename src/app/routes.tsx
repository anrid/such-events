import * as React from 'react'
import {
  Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import { getCurrentStore } from './store'
import { history } from './history'

function hasSession () {
  const store = getCurrentStore()
  return store && store.getState().app.session
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
      hasSession()
      ? <Component {...props} />
      : <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }}/>
    )}
  />
)

const Logout = () => (
  <div>
    Bye !
  </div>
)

const Routes = () => (
  <Router history={history}>
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/logout" component={Logout} />
      <PrivateRoute path="/" component={Home} />
    </Switch>
  </Router>
)

export default Routes
