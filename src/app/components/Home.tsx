import * as React from 'react'
import { connect } from 'react-redux'
import { inc } from '../actions'
const styles = require('./Home.css')

const Home = ({ counter, inc }) => (
  <div className={styles.root}>
    <h2>Home</h2>
    <button className={styles.button} onClick={inc}>
      counter = {counter}
    </button>
  </div>
)

const stateToProps = state => ({
  counter: state.app.counter,
})

const actions = { inc }

export default connect(stateToProps, actions)(Home)
