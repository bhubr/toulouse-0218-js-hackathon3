import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'

const Layout = ({ component: Component, exact, path, ...rest }) => {
  return (
    <Route exact={exact} path={path} render={matchProps => (
      <div>
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
