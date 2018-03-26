import * as React from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
const styles = require('./Home.css')

const Home = ({ counter, inc, signOut }) => (
  <div className={styles.root}>
    <h2>Home</h2>
    <div>
      <button onClick={signOut}>Sign Out</button>
    </div>
    <div>
      <button className={styles.button} onClick={inc}>
        counter = {counter}
      </button>
    </div>  
  </div>
)

const stateToProps = state => ({
  counter: state.app.counter,
})

export default connect(stateToProps, actions)(Home)
