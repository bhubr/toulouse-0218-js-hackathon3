import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Modal from '@material-ui/core/Modal'
import FormControl from '@material-ui/core/FormControl'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import InputLabel from '@material-ui/core/InputLabel'
import Collapse from '@material-ui/core/Collapse'
import PhoneIcon from '@material-ui/icons/Phone'
import SmsIcon from '@material-ui/icons/Sms'
import GoogleLogo from '../images/GoogleLogo.svg'
import firebase from 'firebase'

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: '40%', // theme.spacing.unit * 50,
    left: '30%',
    top: '20%',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    padding: theme.spacing.unit * 4,
    textAlign: 'center'
  },
  input: {
    width: '100%'
  },
  logo: {
    paddingRight: theme.spacing.unit
  },
  mb: {
    marginBottom: theme.spacing.unit * 4
  }
})

class AuthModal extends React.Component {
  state = {
    promptSmsCode: false,
    smsCode: '',
    phoneNumber: '',
    smsIn: false,
    disableSubmit: true,
    smsFlowStep: 0
  }
  handleInputChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  handleSubmitPhoneNumber = () => {
    const self = this
    const { phoneNumber } = this.state
    var appVerifier = window.recaptchaVerifier
    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
      .then(function (confirmationResult) {
        console.log('confirm', this, self, confirmationResult)
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        self.setState({
          smsFlowStep: 1,
          promptSmsCode: true
        })
        window.confirmationResult = confirmationResult
      })
      .catch(function (error) {
        console.log(error)
        // Error; SMS not sent
        // ...
      })
  }
  handleSubmit = e => {
    e.preventDefault()
    if(this.state.smsFlowStep === 0) {
      console.log('submit phone number')
      this.handleSubmitPhoneNumber()
      return
    }
    console.log('submit sms code')
    const self = this
    window.confirmationResult.confirm(this.state.smsCode)
      .then(function (result) {
        // User signed in successfully.
        var user = result.user
        console.log(user)
        // self.setState({
        //   user: user
        // })
        self.props.handleClose()
        // ...
      })
      .catch(function (error) {
        console.error(error)
        // User couldn't sign in (bad verification code?)
        // ...
      })
  }
  handleSmsClick = () => {
    console.log('click')
    setTimeout(this.setupRecaptcha, 50)
    this.setState({
      smsIn: true
    })
  }
  setupRecaptcha = () => {
    console.log('setup recaptcha')
    const self = this
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'normal',
      'callback': function (response) {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log(response)
        self.setState({
          disableSubmit: false
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

  render () {
    const { classes, open, handleOpen, handleClose } = this.props
    const { smsIn, smsCode, phoneNumber, disableSubmit } = this.state

    return (
      <div>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={open}
          onClose={handleClose}
        >
          <div className={classes.paper}>
            <Grid container spacing={8}>
              <Grid item xs={12} sm={12} md={12}>
                <Typography variant="title" id="modal-title" className={classes.mb}>
                  Connexion
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.props.onGoogleSignin}
                  className={classes.mb}>
                  <img src={GoogleLogo} alt="Logo Google" className={classes.logo} /> Se connecter avec Google
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.mb}
                  onClick={this.handleSmsClick}>
                  <PhoneIcon className={classes.logo} /> Recevoir un code par SMS
                </Button>
                <Collapse in={smsIn}>
                  <div style={{margin: '0 auto 20px auto', width: '304px'}}>
                    <div id="recaptcha-container"></div>
                  </div>
                  <form onSubmit={this.handleSubmit}>
                    <FormControl className={classes.margin}>
                      <InputLabel htmlFor="phoneNumber">Numéro de téléphone</InputLabel>
                      <Input
                        className={classes.input}
                        id="phoneNumber"
                        type="text"
                        name="phoneNumber"
                        value={phoneNumber}
                        onChange={this.handleInputChange}
                        startAdornment={
                          <InputAdornment position="start">
                            <SmsIcon />
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                    <FormControl className={classes.margin}>
                      <InputLabel htmlFor="smsCode">Code reçu par SMS</InputLabel>
                      <Input
                        className={classes.input}
                        id="smsCode"
                        type="text"
                        name="smsCode"
                        value={smsCode}
                        onChange={this.handleInputChange}
                        startAdornment={
                          <InputAdornment position="start">
                            <SmsIcon />
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                    {/* <input type="submit" value="submit" /> */}
                    <Button
                      variant="contained"
                      color="default"
                      type="submit"
                      disabled={disableSubmit}
                      className={classes.mb}>
                      Valider
                    </Button>
                  </form>
                </Collapse>

                {/* <AuthModalWrapped /> */}
              </Grid>
            </Grid>
          </div>
        </Modal>
      </div>
    )
  }
}

AuthModal.propTypes = {
  classes: PropTypes.object.isRequired
}

// We need an intermediary variable for handling the recursive nesting.
const AuthModalWrapped = withStyles(styles)(AuthModal)

export default AuthModalWrapped
