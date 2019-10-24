import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { history } from '../helpers';
// components
import Layout from "./Layout";

// pages
import Error from "../pages/error";
import Login from "../pages/login";

// context
import { useUserState } from "../context/UserContext";

export default function App() {
  // global
  var { isAuthenticated } = useUserState();

  return (
    <Router history={history}>
      <Switch>
        <Route exact path="/dash" render={() => <Redirect to="/dash/app/dashboard" />} />
        <Route
          exact
          path="/dash/app"
          render={() => <Redirect to="/dash/app/dashboard" />}
        />
        <PrivateRoute path="/dash/app" component={Layout} />
        <PublicRoute path="/dash/login" component={Login} />
        <Route component={Error} /> 
      </Switch>
    </Router >
  );

  // #######################################################################

  function PrivateRoute({ component, ...rest }) {
    return (
      <Route
        {...rest}
        render={props =>
          isAuthenticated ? (
            React.createElement(component, props)
          ) : (
            <Redirect
              to={{
                pathname: "/dash/login",
                state: {
                  from: props.location,
                },
              }}
            />
          )
        }
      />
    );
  }

  function PublicRoute({ component, ...rest }) {
    return (
      <Route
        {...rest}
        render={props =>
          isAuthenticated ? (
            <Redirect
              to={{
                pathname: "/dash",
              }}
            />
          ) : (
            React.createElement(component, props)
          )
        }
      />
    );
  }
}
