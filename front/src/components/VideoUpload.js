import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import InputLabel from '@material-ui/core/InputLabel'
import TitleIcon from '@material-ui/icons/Title'
import MediaUploader from '../vendor/MediaUploader'
import uploadId from '../helpers/uploadId'
import { clientId } from '../youtube.json'

const styles = {
  form: {
    padding: 40
  },
  margin: {
    width: '100%',
    marginBottom: 30
  },
  center: {
    textAlign:'center'
  },
  inputFile: {
    display: 'none'
  }
}

const CHUNK_SIZE = Math.pow(2, 20)

class VideoUpload extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      file: null,
      title: '',
      description: '',
      group: '',
      analysisGrid: '',
      transfer: {
        id: '',
        started: false,
        done: false,
        bytesDone: 0,
        bytesTotal: 0,
        chunksDone: 0,
        chunksTotal: 0,
        percentDone: 0.0
      }
    }
    this.onChange = this.onChange.bind(this)
    this.onChangeFile = this.onChangeFile.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onProgress = this.onProgress.bind(this)
    this.onComplete = this.onComplete.bind(this)
  }
  onChange (e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  onChangeFile (e) {
    this.setState({
      file: e.target.files[0]
    })
  }
  onProgress (evt) {
    const { loaded, total } = evt
    const { transfer } = this.state
    let { chunksDone, bytesDone, bytesTotal } = transfer
    if (loaded === CHUNK_SIZE) {
      chunksDone += 1
      bytesDone = chunksDone * CHUNK_SIZE
    } else {
      bytesDone = chunksDone * CHUNK_SIZE + loaded
    }
    const percentDone = 100 * bytesDone / bytesTotal

    this.setState((prevState, props) => ({
      transfer: { ...transfer, bytesDone, chunksDone, percentDone }
    }))
  }
  onComplete (response) {
    console.log('onComplete', response)
    const { transfer } = this.state
    this.setState({
      ...transfer, done: true
    })
    setTimeout(() => this.setState({
      transfer: {
        id: '', started: false, done: false, bytesDone: 0, bytesTotal: 0, percentDone: 0.0
      }
    }), 1500)
  }
  onSubmit (e) {
    e.preventDefault()
    const { file, title, description } = this.state
    const mediaUploader = new MediaUploader({
      file,
      token: this.props.accessToken,
      params: {
        uploadType: 'resumable',
        part: 'snippet,status,contentDetails'
      },
      metadata: { title, description },
      chunkSize: CHUNK_SIZE,
      onProgress: this.onProgress,
      onError: err => console.log('onError', err),
      onComplete: this.onComplete
    })
    const { transfer } = this.state
    const chunksTotal = Math.ceil(file.size / CHUNK_SIZE)
    console.log('before starting transfer', { ...transfer, started: true, chunksTotal, bytesTotal: file.size })
    const id = uploadId()
    this.setState({
      transfer: { ...transfer, id, started: true, chunksTotal, bytesTotal: file.size }
    })
    mediaUploader.upload()
  }
  render () {
    // const { clientId } = this.props
    const redirectUri = window.location.origin + '/auth-callback'
    const { classes } = this.props
    const { transfer: { started, percentDone } } = this.state
    return (
      <div className="VideoUpload">

        <form action="https://accounts.google.com/o/oauth2/v2/auth">
          <input type="hidden" name="response_type" value="token" />
          <input type="hidden" name="scope" value="https://www.googleapis.com/auth/youtube.force-ssl" />
          <input type="hidden" name="include_granted_scopes" value="true" />
          <input type="hidden" name="state" value="pass-through value" />
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="redirect_uri" value={redirectUri} />
          <input type="submit" value="submit" />
        </form>
        <form className={classes.form} onSubmit={this.onSubmit}>
          <Typography variant="title" gutterBottom>
            Déposer une vidéo
          </Typography>
          { started && <LinearProgress variant="determinate" value={percentDone} /> }
          <div>
            <Button type="button" color="default" variant="raised" className={classes.margin}>
              <input
                className={classes.inputFile}
                id="file-upload"
                type="file"
                onChange={this.onChangeFile} />
              <label htmlFor="file-upload">Déposer une vidéo</label>
            </Button>
            <FormControl className={classes.margin}>
              <InputLabel htmlFor="email">Titre de la vidéo</InputLabel>
              <Input
                className={classes.input}
                id="title"
                type="text"
                name="title"
                value={this.state.title}
                onChange={this.onChange}
                startAdornment={
                  <InputAdornment position="start">
                    <TitleIcon />
                  </InputAdornment>
                }
              />
            </FormControl>
            {/* <textarea name="description" placeholder="Description" value={this.state.description} onChange={this.onChange} /> */}
          </div>
          <div>
            <Button type="submit" color="primary" variant="raised" disabled={!clientId}>
              Enregistrer
            </Button>
          </div>

        </form>
      </div>
    )
  }
}

VideoUpload.propTypes = {
  // clientId: PropTypes.string,
  isAPILoaded: PropTypes.bool,
  postYoutubeClientIdRequest: PropTypes.func,
  loadGoogleApi: PropTypes.func
}

export default withStyles(styles)(VideoUpload)
