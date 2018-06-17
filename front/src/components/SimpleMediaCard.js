import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import YouTube from '@u-wave/react-youtube'

const styles = {
  card: {
    maxWidth: 345
  },
  media: {
    height: 0,
    paddingTop: '56.25%' // 16:9
  },
  video: {
    width: '100%'
  },
  chip: {
    margin: 3
  }
}

function SimpleMediaCard ({ video, classes }) {
  const title = video.val().title
  const thumbnailUrl = video.val().thumbnailUrl
  const articleUrl = video.val().articleUrl
  const videoId = video.val().id
  const tagsArr = video.val().tags
  const tags = (tagsArr && tagsArr.length) ? tagsArr.split(',') : []

  return (
    <div>
      <Card className={classes.card}>
        <YouTube
          video={videoId}
          className={classes.video}
        />
        <CardContent>
          <Typography gutterBottom variant="headline" component="h2">
            {title}
          </Typography>
          {
            tags.map((tag, k) => (
              <Chip
                key={k}
                label={tag}
                className={classes.chip} />))
          }
        </CardContent>
        <CardActions>
          {/* <Button size="small" color="primary">
          </Button> */}
          <Button size="small" color="primary">
            <a href={articleUrl} target="_blank">Lire l&aposarticle</a>
          </Button>
        </CardActions>
      </Card>
    </div>
  )
}

SimpleMediaCard.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(SimpleMediaCard)
