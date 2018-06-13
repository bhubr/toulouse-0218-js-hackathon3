import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'
import './style.min.css'
import * as firebase from 'firebase'
import registerServiceWorker from './registerServiceWorker'
import config from './config.json'

firebase.initializeApp(config);

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
