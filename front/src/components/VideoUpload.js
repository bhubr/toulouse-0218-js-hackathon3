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
import Chip from '@material-ui/core/Chip'
import TitleIcon from '@material-ui/icons/Title'
import Link from '@material-ui/icons/Link'
import MediaUploader from '../vendor/MediaUploader'
import Collapse from '@material-ui/core/Collapse'
import uploadId from '../helpers/uploadId'
import { clientId } from '../youtube.json'

const styles = {
  container: {
    textAlign: 'center'
  },
  form: {
    padding: 40
  },
  margin: {
    width: '100%',
    marginBottom: 30
  },
  marginVert: {
    margin: 30
  },
  center: {
    textAlign:'center'
  },
  inputFile: {
    display: 'none'
  },
  chip: {
    margin: 5
  }
}

const allTags = [
  {
    key: 'astronomie',
    label: 'Astronomie'
  },
  {
    key: 'nature',
    label: 'Nature'
  },
  {
    key: 'technologie',
    label: 'Technologie'
  },
  {
    key: 'social',
    label: 'Social'
  },
  {
    key: 'humour',
    label: 'Humour'
  }
]

const CHUNK_SIZE = Math.pow(2, 20)

class VideoUpload extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      file: null,
      title: '',
      articleUrl: '',
      description: '',
      group: '',
      analysisGrid: '',
      tags: [],
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
    this.onToggleTag = this.onToggleTag.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChangeFile = this.onChangeFile.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onProgress = this.onProgress.bind(this)
    this.onComplete = this.onComplete.bind(this)
  }
  onToggleTag(tagKey) {
    const { tags } = this.state
    let newTags = [...tags]
    const index = tags.findIndex(tk => tk === tagKey)
    console.log(tags, tagKey, index)
    if(index === -1) {
      newTags.push(tagKey)
    }
    else {
      newTags.splice(index, 1)
    }
    this.setState({
      tags: newTags
    })
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
    // console.log('onComplete', response)
    const parsedRes = JSON.parse(response)
    console.log()
    const { transfer } = this.state
    this.setState({
      ...transfer, done: true
    })
    this.props.writeVideo(this.state.title, this.state.articleUrl, this.state.tags, parsedRes.id, parsedRes.snippet.thumbnails.medium.url)
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
    const { classes, accessToken } = this.props
    const { transfer: { started, percentDone }, tags } = this.state
    const styleSelected = { backgroundColor:  '#1e3278', color: '#fff' }
    const styleDefault = {}
    return (
      <div className={classes.container}>

        <Collapse in={!accessToken}>
          <form action="https://accounts.google.com/o/oauth2/v2/auth">
            <input type="hidden" name="response_type" value="token" />
            <input type="hidden" name="scope" value="https://www.googleapis.com/auth/youtube.force-ssl" />
            <input type="hidden" name="include_granted_scopes" value="true" />
            <input type="hidden" name="state" value="pass-through value" />
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="redirect_uri" value={redirectUri} />
            <Button type="submit" color="secondary" variant="raised" className={classes.marginVert}>
              Authentification YouTube
            </Button>
          </form>
        </Collapse>
        
        <Collapse in={!!accessToken}>
          <form className={classes.form} onSubmit={this.onSubmit}>
            <Typography variant="title" gutterBottom>
              Déposer une vidéo
            </Typography>
            <Collapse in={started}>
              <div style={{marginBottom: '12px'}}>
                <LinearProgress variant="determinate" value={percentDone} />
              </div>
            </Collapse>
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
              <FormControl className={classes.margin}>
                <InputLabel htmlFor="email">Lien vers l&apos;article</InputLabel>
                <Input
                  className={classes.input}
                  id="articleUrl"
                  type="text"
                  name="articleUrl"
                  value={this.state.articleUrl}
                  onChange={this.onChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <Link />
                    </InputAdornment>
                  }
                />
              </FormControl>
              {/* <textarea name="description" placeholder="Description" value={this.state.description} onChange={this.onChange} /> */}
              {
                allTags.map((tag, k) => (
                  <Chip
                    key={k}
                    label={tag.label}
                    className={classes.chip}
                    style={tags.includes(tag.key) ? styleSelected : styleDefault}
                    onClick={e => this.onToggleTag(tag.key)} />))
              }
            </div>
            <div>
              <Button type="submit" color="primary" variant="raised" disabled={!clientId}>
                Enregistrer
              </Button>
            </div>

          </form>
        </Collapse>
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
