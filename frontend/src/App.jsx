import React, { Component } from 'react'
import Body from './components/Body'
import Header from './components/Header'
import './App.css'

export default class App extends Component {
  render() {
    return (
      <div className='container'>
        <Header />
        <Body />
      </div>
    )
  }
}
