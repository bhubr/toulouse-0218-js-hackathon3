import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import * as firebase from 'firebase'
import { MuiThemeProvider } from '@material-ui/core/styles'
import theme from './theme'
import registerServiceWorker from './registerServiceWorker'
import config from './config.json'

firebase.initializeApp(config)
// var ref = firebase.database().ref('winnews-b4695/john')

const Themed = () => (
  <MuiThemeProvider theme={theme}>
    <App />
  </MuiThemeProvider>
)
ReactDOM.render(<Themed />, document.getElementById('root'))
registerServiceWorker()
