import * as React from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
const styles = require('./Home.css')

const backgrounds = [
  { name: 'starbucks blue skies', url: 'https://c1.staticflickr.com/9/8367/8398516720_84ef52a7a3_h.jpg' },
  { name: 'coffee cup on brown table', url: 'https://c1.staticflickr.com/5/4667/28365820679_052407e579_h.jpg' },
  { name: 'starbucks gray', url: 'https://c2.staticflickr.com/8/7065/6832826064_eb6ba6fba6_h.jpg' },
  { name: 'pen and notes', url: 'https://c1.staticflickr.com/3/2821/33471067321_870503a23e_h.jpg' },
  { name: 'yellow blur with phone', url: 'https://c2.staticflickr.com/4/3932/15342042878_e101ad331b_h.jpg' },
]

// Pick a random background.
const random = Math.floor(Math.random() * backgrounds.length)
const background = backgrounds[random]

const Home = ({ counter, inc, signOut }) => {
  return (
    <div className={styles.root} style={{ backgroundImage: `url(${background.url})` }}>
      <h2>Home :-)</h2>
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
}

const stateToProps = state => ({
  counter: state.app.counter,
})

export default connect(stateToProps, actions)(Home)
