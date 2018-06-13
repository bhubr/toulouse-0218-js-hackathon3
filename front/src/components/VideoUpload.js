/* global FileReader */
import React from 'react'
import PropTypes from 'prop-types'
// import { connect } from 'react-redux'
// import { postYoutubeClientIdRequest, loadGoogleApi } from './actions'
// import { CHUNK_SIZE } from './constants'
import MediaUploader from '../vendor/MediaUploader'
import { clientId } from '../youtube.json'
// import './VideoUpload.css'

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
        started: false,
        done: false,
        bytesDone: 0,
        bytesTotal: 0,
        chunksDone: 0,
        chunksTotal: 0
      }
    }
    this.onChange = this.onChange.bind(this)
    this.onChangeFile = this.onChangeFile.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onProgress = this.onProgress.bind(this)
    this.onComplete = this.onComplete.bind(this)
  }
  componentDidMount () {
    const { isAPILoaded } = this.props
    // if (!clientId) {
    //   this.props.postYoutubeClientIdRequest()
    // }
    // if (!isAPILoaded) {
    //   this.props.loadGoogleApi()
    // }
  }
  onChange (e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  onChangeFile (e) {
    console.log(e)
    this.setState({
      file: e.target.files[0]
    })
  }
  onProgress (evt) {
    const { loaded, total } = evt
    const { transfer } = this.state
    // const bytesDone = transfer.bytesDone + loaded
    // console.log('onProgress', loaded, total, bytesDone, transfer.bytesTotal)
    let { chunksDone, bytesDone } = transfer
    if (loaded === CHUNK_SIZE) {
      chunksDone += 1
      bytesDone = chunksDone * CHUNK_SIZE
    } else {
      bytesDone = chunksDone * CHUNK_SIZE + loaded
    }

    this.setState((prevState, props) => ({
      transfer: { ...transfer, bytesDone, chunksDone }
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
        started: false, done: false, bytesDone: 0, bytesTotal: 0
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
    this.setState({
      transfer: { ...transfer, started: true, chunksTotal, bytesTotal: file.size }
    })
    mediaUploader.upload()

    // const headers = {
    //   Authorization: `Bearer ${this.props.accessToken}`,
    //   'Content-Type': 'application/json',
    //   'X-Upload-Content-Type': file.type,
    //   'X-Upload-Content-Length': file.size
    // }
    // console.log('headers')

    // fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails', {
    //   method: 'POST',
    //   headers,
    //   body: JSON.stringify({
    //     "snippet": {
    //       "title": file.name,
    //       "description": "This is a description of my video",
    //       "tags": ["cool", "video", "more keywords"],
    //       "categoryId": 22
    //     },
    //     "status": {
    //       "privacyStatus": "public",
    //       "embeddable": true,
    //       "license": "youtube"
    //     }
    //   })
    // })
    //   .then(response => {
    //     const fileUploadUrl = response.headers.get('Location')
    //     console.log('uploading to', fileUploadUrl, e, file)

    //     console.log(file.size)
    //     function onProgress(event) {
    //       if (event.lengthComputable) {
    //         var percentComplete = (event.loaded / event.total)*100
    //         console.log("Téléchargement: %d%%", percentComplete)
    //       } else {
    //         console.log('uploading', file.size)
    //         // Impossible de calculer la progression puisque la taille totale est inconnue
    //       }
    //     }

    //     function onError(event) {
    //       console.error("Une erreur " + event.target.status + " s'est produite au cours de la réception du document.")
    //     }

    //     function onLoad(event) {
    //       // Ici, this.readyState égale XMLHttpRequest.DONE .
    //       if (this.status === 200) {
    //         console.log("Réponse reçue: %s", this.responseText)
    //       } else {
    //         console.log("Status de la réponse: %d (%s)", this.status, this.statusText)
    //       }
    //     }

    //     function onLoadEnd(event) {
    //       // Cet événement est exécuté, une fois la requête terminée.
    //       console.log("Le transfert est terminé. (peut importe le résultat)")
    //     }

    //     const req = new XMLHttpRequest()
    //     const formData = new FormData()
    //     const offset = 0
    //     const end = file.size - 1
    //     formData.append('', file)
    //     req.open('PUT', fileUploadUrl, true)
    //     req.setRequestHeader('Content-Type', 'application/octet-stream')
    //     // req.setRequestHeader('Content-Length', file.size)
    //     req.setRequestHeader('Content-Range', `bytes ${offset}-${end}/${file.size}`)
    //     req.setRequestHeader('X-Upload-Content-Type', file.type)
    //     req.onprogress = onProgress
    //     req.onerror = onError
    //     req.onload = onLoad
    //     req.onloadend = onLoadEnd

    //     req.send(formData)
    //   })

  }
  render () {
    // const { clientId } = this.props
    const redirectUri = window.location.origin + '/auth-callback'
    const { transfer } = this.state
    const { bytesDone, bytesTotal } = transfer
    const percentDone = (100 * bytesDone / bytesTotal).toFixed(1) + '%'
    return (
      <div className="VideoUpload">
        { transfer.started && <div className="progress-wrapper">
          <div className="progress-bar" style={{ width: percentDone }}></div>
        </div>  }
        <h2>Déposer une vidéo</h2>
        <form action="https://accounts.google.com/o/oauth2/v2/auth">
          <input type="hidden" name="response_type" value="token" />
          <input type="hidden" name="scope" value="https://www.googleapis.com/auth/youtube.force-ssl" />
          <input type="hidden" name="include_granted_scopes" value="true" />
          <input type="hidden" name="state" value="pass-through value" />
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="redirect_uri" value={redirectUri} />
          <input type="submit" value="submit" />
        </form>
        <form onSubmit={this.onSubmit}>
          <div>
            <input id="file-upload" type="file" onChange={this.onChangeFile} />
            <label htmlFor="file-upload">Déposer une vidéo</label>
            <input name="title" type="text" placeholder="Titre de la vidéo" value={this.state.title} onChange={this.onChange} />
            <textarea name="description" placeholder="Description" value={this.state.description} onChange={this.onChange} />
          </div>
          <div>
            <button type="submit" className="btn btn-primary" disabled={!clientId}>Enregistrer</button>
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

export default VideoUpload
