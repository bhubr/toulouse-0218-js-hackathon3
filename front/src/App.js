import React, { Component } from 'react'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import firebase, { auth } from 'firebase'
import Layout from './components/Layout'
import HomeReader from './pages/HomeReader'
import HomeContributor from './pages/HomeContributor'
import AuthCallback from './components/AuthCallback'
import './App.css'

function writeUserData (userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture: imageUrl
  })
}

const pushChildToState = child => (prevState, props) => {
  const { videos } = prevState
  const newVideos = [...videos, child]
  return { videos: newVideos }
}

class App extends Component {
  constructor (props) {
    super(props)
    this.overlayRef = React.createRef()
    this.handleSmsCodeChange = this.handleSmsCodeChange.bind(this)
    this.handleSubmitSmsCode = this.handleSubmitSmsCode.bind(this)
    this.onAuthStateChanged = this.onAuthStateChanged.bind(this)
    this.onSignin = this.onSignin.bind(this)
    this.writePost = this.writePost.bind(this)
    this.writeVideo = this.writeVideo.bind(this)
    this.toggleDebug = this.toggleDebug.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.setTokenData = this.setTokenData.bind(this)
    this.onGeolocationSuccess = this.onGeolocationSuccess.bind(this)
    this.onGeolocationError = this.onGeolocationError.bind(this)
    this.onChildAdded = this.onChildAdded.bind(this)
    this.state = {
      modalOpen: false,
      debug: false,
      tokenData: null,
      location: null,
      user: null,
      promptSmsCode: false,
      smsCode: '',
      videos: []
    }
  }
  onAuthStateChanged (loggedInUser) {
    // We ignore token refresh events.
    const { user } = this.state
    if (loggedInUser && user && loggedInUser.uid === user.uid) {
      return
    }
    this.setState({
      user: loggedInUser
    })
    console.log('onAuthStateChanged', loggedInUser)
    if (loggedInUser) {
      const { uid, displayName, email, photoURL } = loggedInUser
      writeUserData(uid, displayName, email, photoURL)
      // startDatabaseQueries();
    } else {
      // // Set currentUID to null.
      // currentUID = null;
      // // Display the splash page where you can sign-in.
      // splashPage.style.display = '';
    }
  }
  onSignin () {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        const provider = new firebase.auth.GoogleAuthProvider()
        firebase.auth().signInWithPopup(provider)
        firebase.auth().onAuthStateChanged(this.onAuthStateChanged)
      })
      .catch(error => {
        // Handle Errors here.
        const errorCode = error.code
        const errorMessage = error.message
        console.log(errorCode, errorMessage)
      })
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
  onChildAdded (child) {
    this.setState(pushChildToState(child))
  }
  componentDidMount () {
    navigator.geolocation.getCurrentPosition(this.onGeolocationSuccess, this.onGeolocationError)
    const recentPostsRef = firebase.database().ref('videos').limitToLast(100)
    recentPostsRef.on('child_added', this.onChildAdded)

    auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user })
      }
    })
    //
    const self = this
    firebase.auth().useDeviceLanguage()
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'normal',
      'callback': function (response) {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log(response)

        var phoneNumber = '+33661216212'
        var appVerifier = window.recaptchaVerifier
        firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
          .then(function (confirmationResult) {
            console.log('confirm', this, self, confirmationResult)
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            self.setState({
              promptSmsCode: true
            })
            window.confirmationResult = confirmationResult
          })
          .catch(function (error) {
            console.log(error)
            // Error; SMS not sent
            // ...
          })
      },
      'expired-callback': function () {
        // Response expired. Ask user to solve reCAPTCHA again.
        // ...
      }
    })
    window.recaptchaVerifier.render().then(function (widgetId) {
      console.log('widget Id:', widgetId)
      window.recaptchaWidgetId = widgetId
    })
  }
  toggleModal () {
    this.setState((prevState, props) => ({
      modalOpen: !prevState.modalOpen
    }))
  }
  toggleDebug () {
    this.setState((prevState, props) => ({
      debug: !prevState.debug
    }))
  }
  closeModal (e) {
    if (e.target === this.overlayRef.current) {
      this.toggleModal()
    }
  }
  setTokenData (tokenData) {
    console.log('setTokenData', tokenData)
    this.setState({
      tokenData
    })
  }
  handleSmsCodeChange (e) {
    this.setState({
      smsCode: e.target.value
    })
  }
  handleSubmitSmsCode (e) {
    e.preventDefault()
    const self = this
    window.confirmationResult.confirm(this.state.smsCode).then(function (result) {
      // User signed in successfully.
      var user = result.user
      console.log(user)
      self.setState({
        user: user
      })
      // ...
    })
      .catch(function (error) {
        console.error(error)
        // User couldn't sign in (bad verification code?)
        // ...
      })
  }
  writeVideo (title, id, thumbnailUrl) {
    // writeNewPost(firebase.auth().currentUser.uid, username,
    //   firebase.auth().currentUser.photoURL,
    //   title, text)
    if (!firebase.auth().currentUser) {
      console.log("can't post, no user logged-in")
      return
    }
    const uid = firebase.auth().currentUser.uid
    const videoData = {
      author: this.state.user.displayName,
      uid,
      id,
      thumbnailUrl,
      title,
      latitude: this.state.location.latitude,
      longitude: this.state.location.longitude,
      authorPic: firebase.auth().currentUser.photoURL
    }
    console.log(videoData)

    // Get a key for a new Post.
    var newVideoKey = firebase.database().ref().child('videos').push().key

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {}
    updates['/videos/' + newVideoKey] = videoData
    updates['/user-videos/' + uid + '/' + newVideoKey] = videoData

    return firebase.database().ref().update(updates)
  }
  writePost () {
    // writeNewPost(firebase.auth().currentUser.uid, username,
    //   firebase.auth().currentUser.photoURL,
    //   title, text)
    if (!firebase.auth().currentUser) {
      console.log("can't post, no user logged-in")
      return
    }
    const uid = firebase.auth().currentUser.uid
    const postData = {
      author: 'benhubert',
      uid,
      body: 'Pouet pouet pouet ' + Date.now(),
      title: 'title ' + Date.now(),
      starCount: 0,
      authorPic: firebase.auth().currentUser.photoURL
    }
    console.log(postData)

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('posts').push().key

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {}
    updates['/posts/' + newPostKey] = postData
    updates['/user-posts/' + uid + '/' + newPostKey] = postData

    return firebase.database().ref().update(updates)
  }

  render () {
    const { videos, modalOpen, tokenData, promptSmsCode, smsCode, user } = this.state
    const { writeVideo } = this
    const accessToken = tokenData ? tokenData.access_token : null
    return (
      <Router>
        <div className="App">
          {modalOpen &&
            <div ref={this.overlayRef} className="overlay" onClick={this.closeModal}>
              <div style={{paddingTop: '100px'}} className="modal">
                <button onClick={this.onSignin}>Sign in</button>
                <button onClick={this.writePost}>writePost</button>
                <button onClick={() => console.log('pouet')}>pouet</button>
              </div>
            </div>
          }

          <nav className="navbar">
            <a href="#" onClick={this.toggleModal}>Auth</a>
            <a href="#" onClick={this.toggleDebug}>Dbg</a>
          </nav>

          {promptSmsCode && <form onSubmit={this.handleSubmitSmsCode}>
            <input onChange={this.handleSmsCodeChange} value={smsCode} />
            <input type="submit" value="submit" />
          </form>}

          <AuthCallback setTokenData={this.setTokenData} debug={this.state.debug} />

          <Switch>
            <Layout exact path="/" component={HomeReader} user={user} videos={videos} />
            <Layout exact path="/contributor" component={HomeContributor} user={user} accessToken={accessToken} writeVideo={writeVideo} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App
