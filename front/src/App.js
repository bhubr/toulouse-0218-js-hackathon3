import React, { Component } from 'react'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import firebase, { auth } from 'firebase'
import Layout from './components/Layout'
import MenuAppBar from './components/MenuAppBar'
import HomeReader from './pages/HomeReader'
import AuthModal from './components/AuthModal'
import HomeContributor from './pages/HomeContributor'
import About from './pages/About'
import AuthCallback from './components/AuthCallback'
import LocalStorageJSON from './helpers/LocalStorageJSON'
import { HOME, CONTRIBUTOR, ABOUT } from './urls'

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

  handleOpenModal = () => {
    this.setState({ modalOpen: true });
  }

  handleCloseModal = () => {
    this.setState({ modalOpen: false });
  }

  constructor (props) {
    super(props)
    this.overlayRef = React.createRef()
    this.onAuthStateChanged = this.onAuthStateChanged.bind(this)
    this.onGoogleSignin = this.onGoogleSignin.bind(this)
    this.writeVideo = this.writeVideo.bind(this)
    this.toggleDebug = this.toggleDebug.bind(this)
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
      user: loggedInUser,
      modalOpen: false
    })
    if(loggedInUser) {
      return
    }
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
  onGoogleSignin () {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        const provider = new firebase.auth.GoogleAuthProvider()
        firebase.auth().signInWithPopup(provider)
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
    const storage = new LocalStorageJSON('youtubeOAuth2')
    const tokenData = storage.get()
    // console.log(Date.now(), tokenData.expires_at, Date.now() - tokenData.expires_at)
    if(tokenData && Date.now() < tokenData.expires_at) {
      this.setState({
        tokenData
      })
      console.log(tokenData)
    }

    firebase.auth().onAuthStateChanged(this.onAuthStateChanged)

    navigator.geolocation.getCurrentPosition(this.onGeolocationSuccess, this.onGeolocationError)
    const recentPostsRef = firebase.database().ref('videos').limitToLast(100)
    recentPostsRef.on('child_added', this.onChildAdded)

    auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user })
      }
    })
    //
    firebase.auth().useDeviceLanguage()

  }
  toggleDebug () {
    this.setState((prevState, props) => ({
      debug: !prevState.debug
    }))
  }
  setTokenData (tokenData) {
    console.log('setTokenData', tokenData)
    this.setState({
      tokenData
    })
  }
  writeVideo (title, articleUrl, tags, id, thumbnailUrl) {
    if (!firebase.auth().currentUser) {
      console.log("can't post, no user logged-in")
      return
    }
    const uid = firebase.auth().currentUser.uid
    const videoData = {
      author: this.state.user.displayName,
      uid,
      id,
      articleUrl,
      thumbnailUrl,
      tags: tags.join(),
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

  render () {
    const { videos, modalOpen, tokenData, promptSmsCode, smsCode, user } = this.state
    const { writeVideo } = this
    const accessToken = tokenData ? tokenData.access_token : null
    return (
      <Router>
        <div className="App">
          <AuthModal open={modalOpen} handleOpen={this.handleOpenModal} handleClose={this.handleCloseModal} onGoogleSignin={this.onGoogleSignin} />
          <MenuAppBar user={user} handleOpenModal={this.handleOpenModal} />

          <AuthCallback setTokenData={this.setTokenData} debug={this.state.debug} />

          <Switch>
            <Layout exact path={HOME} component={HomeReader} user={user} videos={videos} />
            <Layout exact path={ABOUT} component={About} />
            <Layout exact path={CONTRIBUTOR} component={HomeContributor} user={user} accessToken={accessToken} writeVideo={writeVideo} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App
