import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import MenuAppBar from './MenuAppBar'

const Layout = ({ component: Component, exact, path, user, ...rest }) => {
  console.log(rest)
  return (
    <Route exact={exact} path={path} render={matchProps => (
      <div>
        <MenuAppBar user={user} />
        <Component {...rest} />
      </div>
    )} />
  )
}

Layout.propTypes = {
  component: PropTypes.func.isRequired,
  exact: PropTypes.bool,
  user: PropTypes.object,
  path: PropTypes.string
}

export default Layout
