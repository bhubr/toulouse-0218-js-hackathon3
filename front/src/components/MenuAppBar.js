import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import firebase from 'firebase'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import AccountCircle from '@material-ui/icons/AccountCircle'
import CloudUpload from '@material-ui/icons/CloudUpload'
import QuestionAnswer from '@material-ui/icons/QuestionAnswer'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import WinNewsLogo from '../images/WinNews_jaune.png'
import { HOME, ABOUT, CONTRIBUTOR } from '../urls'

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  yellow: {
    color: '#ffdc00'
  }
}

class MenuAppBar extends React.Component {
  state = {
    anchorEl: null
  }

  handleMenu = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  handleSignout = () => {
    firebase.auth().signOut()
  }

  render() {
    const { classes, user } = this.props
    const { anchorEl } = this.state
    const open = Boolean(anchorEl)

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Link to={HOME}>
              <Typography variant="title" color="inherit">
                <img src={WinNewsLogo} style={{maxWidth: '24px'}} />
              </Typography>
            </Link>
            <Link to={ABOUT} className={classes.root}>
              <IconButton className={classes.yellow}>
                <QuestionAnswer />
              </IconButton>
            </Link>
            {! user && (
              <IconButton
                aria-owns={open ? 'menu-appbar' : null}
                aria-haspopup="true"
                onClick={this.props.handleOpenModal}
                color="inherit"
              >
              <AccountCircle />
            </IconButton>
            )}
            {user && (
              <div>
                <Link to={CONTRIBUTOR}>
                  <IconButton className={classes.yellow}>
                    <CloudUpload />
                  </IconButton>
                </Link>
                <IconButton
                  aria-owns={open ? 'menu-appbar' : null}
                  aria-haspopup="true"
                  onClick={this.handleMenu}
                  className={classes.yellow}
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={this.handleClose}
                >
                  <MenuItem onClick={this.handleClose}>Profile</MenuItem>
                  <MenuItem onClick={this.handleSignout}>Déconnexion</MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

MenuAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(MenuAppBar)
