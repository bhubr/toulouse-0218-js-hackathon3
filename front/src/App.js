import React, { Component } from 'react'
import AuthCallback from './components/AuthCallback'
import VideoUpload from './components/VideoUpload'
import './App.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.overlayRef = React.createRef()
    this.toggleModal = this.toggleModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.setTokenData = this.setTokenData.bind(this)
    this.state = {
      modalOpen: false,
      tokenData: null
    }
  }
  toggleModal () {
    this.setState((prevState, props) => ({
      modalOpen: ! prevState.modalOpen
    }))
  }
  closeModal (e) {
    if (e.target === this.overlayRef.current) {
      this.toggleModal()
    }
  }
  setTokenData(tokenData) {
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
        </nav>

        <AuthCallback setTokenData={this.setTokenData} />
        <VideoUpload accessToken={accessToken} />

      </div>
    )
  }
}

export default App
