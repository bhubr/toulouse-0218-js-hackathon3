import React from 'react'
// import { connect } from 'react-redux'
// import { setTokenData } from './actions'
import parseQuery from '../helpers/parseQuery'
import LocalStorageJSON from '../helpers/LocalStorageJSON'

class AuthCallback extends React.Component {
  constructor (props) {
    super(props)
    this.storage = new LocalStorageJSON('youtubeOAuth2')
  }
  state = {
    oauthStep1: null,
    oauthStep2: null,
    data: null
  }

  componentDidMount() {
    if(window.location.hash.length === 0) {
      return
    }
    const oauthStep1 = parseQuery(window.location.hash.substr(1))
    this.setState({
      oauthStep1
    })
    this.storage.set(oauthStep1)
    this.props.setTokenData(oauthStep1)
    const baseUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token='
    this._asyncRequest = fetch(`${baseUrl}${oauthStep1.access_token}`)
      .then(response => response.json())
      .then(
        oauthStep2 => {
          this._asyncRequest = null
          this.setState({oauthStep2})
        }
      )
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel()
    }
  }

  render() {
    const { debug } = this.props
    return (
      <div>
      { debug && (
        <div>
          <h2>OAuth2 status</h2>
          <h3>Auth response</h3>
          <p>{ JSON.stringify(this.state.oauthStep1) }</p>
          <h3>Token validation response</h3>
          <p>{ JSON.stringify(this.state.oauthStep2) }</p>
          <h3>Video data</h3>
          <p>{ JSON.stringify(this.state.data) }</p>
        </div>
        ) }
      </div>
    )
  }
}

export default AuthCallback
