import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as firebase from 'firebase'
import registerServiceWorker from './registerServiceWorker'
import config from './config.json'

firebase.initializeApp(config)
var ref = firebase.database().ref('winnews-b4695/john')

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
