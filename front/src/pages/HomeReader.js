import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import SimpleMediaCard from '../components/SimpleMediaCard'

class HomeReader extends React.Component {
  render () {
    const { videos } = this.props
    return (
      <Grid container spacing={8} style={{marginTop: '30px'}}>
        {
          videos.map((v, k) => (
            <Grid key={k} item xs={12} sm={6} md={4}>
              <SimpleMediaCard video={v} />
            </Grid>
          ))
        }
      </Grid>
    )
  }
}

HomeReader.propTypes = {
  videos: PropTypes.array
}

export default HomeReader
