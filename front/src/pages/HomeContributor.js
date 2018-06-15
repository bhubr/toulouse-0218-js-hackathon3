import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import VideoUpload from '../components/VideoUpload'

class HomeContributor extends React.Component {
  render () {
    const { accessToken, writeVideo } = this.props
    return (
      <Grid container spacing={8}>
        <VideoUpload accessToken={accessToken} writeVideo={writeVideo} />
      </Grid>
    )
  }
}

HomeContributor.propTypes = {
  writeVideo: PropTypes.func.isRequired,
  accessToken: PropTypes.string
}

export default HomeContributor
