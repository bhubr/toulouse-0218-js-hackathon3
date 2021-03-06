import React from 'react'
import Grid from '@material-ui/core/Grid'
import { Typography } from '@material-ui/core'

class About extends React.Component {
  render () {
    return (
      <Grid container spacing={8} justify="center">
        <Grid item xs={12} sm={8} md={6}>
          <div style={{padding: '40px'}}>
            <Typography variant="title">À propos</Typography>
            <Typography variant="body1" style={{fontSize: '1.2rem'}}>
              <strong>WinNews</strong> est une application de news basée sur la géolocalisation,
              et sur l&apos;utilisation de vidéos pour trouver son chemin dans la jungle de l&apos;information.
            </Typography>

            <Typography variant="body1" style={{fontSize: '1.2rem'}}>
              Le principe ? Vous choisissez un thème, et l&apos;app vous propose des articles sur ce thème.
              Chaque article est présenté par une courte vidéo qui vous donne une idée de son contenu.
            </Typography>

            <Typography variant="body1" style={{fontSize: '1.2rem'}}>
              Le sujet vous intéresse ? Vous cliquez sur le lien vers l&apos;article. Sinon, vous tentez votre
                chance avec la vidéo suivante !
            </Typography>
          </div>
        </Grid>
      </Grid>
    )
  }
}

export default About
