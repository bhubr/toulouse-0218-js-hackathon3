import React, { Component } from 'react'
import * as firebase from 'firebase'
import AuthCallback from './components/AuthCallback'
import VideoUpload from './components/VideoUpload'
import SimpleMediaCard from './components/SimpleMediaCard'
import Grid from '@material-ui/core/Grid';
import './App.css'

function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
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
      videos: []
    }
  }
  onAuthStateChanged (user) {
    let currentUID
    // We ignore token refresh events.
    if (user && currentUID === user.uid) {
      return
    }
    this.setState({
      user
    })
    console.log('onAuthStateChanged', user)
    // cleanupUi()
    if (user) {
      currentUID = user.uid;
      // splashPage.style.display = 'none';
      writeUserData(user.uid, user.displayName, user.email, user.photoURL);
      // startDatabaseQueries();
    } else {
      // // Set currentUID to null.
      // currentUID = null;
      // // Display the splash page where you can sign-in.
      // splashPage.style.display = '';
    }
  }
  onSignin () {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged)
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
  onChildAdded(child) {
    this.setState(pushChildToState(child))
  }
  componentDidMount () {
    navigator.geolocation.getCurrentPosition(this.onGeolocationSuccess, this.onGeolocationError)
    const recentPostsRef = firebase.database().ref('videos').limitToLast(100);
    recentPostsRef.on('child_added', this.onChildAdded)

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
    console.log('setTokenData', tokenData)
    this.setState({
      tokenData
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
    const { modalOpen, tokenData } = this.state
    const accessToken = tokenData ? tokenData.access_token : null
    return (
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

        <AuthCallback setTokenData={this.setTokenData} debug={this.state.debug} />
        <VideoUpload accessToken={accessToken} writeVideo={this.writeVideo} />

        <Grid container spacing={8}>
          {
            this.state.videos.map((v, k) => (
              <Grid key={k} item xs={12} sm={6} md={4}>
                <SimpleMediaCard video={v} />
              </Grid>
            ))
          }
        </Grid>

      </div>
    )
  }
}

export default App
