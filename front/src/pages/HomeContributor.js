import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import VideoUpload from '../components/VideoUpload'

class HomeContributor extends React.Component {
  render () {
    const { accessToken, writeVideo } = this.props
    return (
      <Grid container spacing={8} justify="center">
        <Grid item xs={12} sm={6} md={4}>
          <VideoUpload accessToken={accessToken} writeVideo={writeVideo} />
        </Grid>
      </Grid>
    )
  }
}

HomeContributor.propTypes = {
  writeVideo: PropTypes.func.isRequired,
  accessToken: PropTypes.string
}

export default HomeContributor
