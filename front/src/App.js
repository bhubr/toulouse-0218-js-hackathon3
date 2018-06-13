import React, { Component } from 'react'
import AuthCallback from './components/AuthCallback'
import VideoUpload from './components/VideoUpload'
import './App.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.overlayRef = React.createRef()
    this.toggleDebug = this.toggleDebug.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.setTokenData = this.setTokenData.bind(this)
    this.onGeolocationSuccess = this.onGeolocationSuccess.bind(this)
    this.onGeolocationError = this.onGeolocationError.bind(this)
    this.state = {
      modalOpen: false,
      debug: false,
      tokenData: null,
      location: null
    }
  }
  onGeolocationError (err) {
    // PositionError with code 1: user refused geolocation
    if (err.code === 1) {
      console.error('forget about geolocation!!')
    } else {
      console.error('unknown error', err)
    }
  }
  onGeolocationSuccess (position) {
    const { timestamp, coords: { latitude, longitude } } = position
    this.setState({
      location: { timestamp, latitude, longitude }
    })
  }
  componentDidMount () {
    navigator.geolocation.getCurrentPosition(this.onGeolocationSuccess, this.onGeolocationError)
  }
  toggleModal () {
    this.setState((prevState, props) => ({
      modalOpen: ! prevState.modalOpen
    }))
  }
  toggleDebug () {
    this.setState((prevState, props) => ({
      debug: ! prevState.debug
    }))
  }
  closeModal (e) {
    if (e.target === this.overlayRef.current) {
      this.toggleModal()
    }
  }
  setTokenData (tokenData) {
    this.setState({
      tokenData
    })
  }
  render () {
    const { modalOpen, tokenData } = this.state
    const accessToken = tokenData ? tokenData.access_token : null
    return (
      <div className="App">
        {modalOpen &&
          <div ref={this.overlayRef} className="overlay" onClick={this.closeModal}>
            <div className="modal">
            blabla
            </div>
          </div>
        }

        <nav className="navbar">
          <a href="#" onClick={this.toggleModal}>Auth</a>
          <a href="#" onClick={this.toggleDebug}>Dbg</a>
        </nav>

        <AuthCallback setTokenData={this.setTokenData} debug={this.state.debug} />
        <VideoUpload accessToken={accessToken} />

      </div>
    )
  }
}

export default App
