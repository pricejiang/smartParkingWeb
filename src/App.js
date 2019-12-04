import React , { Component } from 'react';
import './App.css';
import {Menu} from 'semantic-ui-react';
import Home from './Components/Home';
import MyMeter from './Components/MyMeter';
import Settings from './Components/Settings';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
 } from "react-router-dom";

import firebase, { app } from 'firebase';
import { db } from "./Components/firebase-init"



class SignInScreen extends Component{
    // Configure FirebaseUI.
    uiConfig = {
        // Popup signin flow rather than redirect flow.
        signInFlow: 'popup',
        // Redirect to /signedIn after sign in is successful. Alternatively you ca n provide a callbacks.signInSuccess function.
        signInSuccessUrl: '/smartParkingWeb/home',
        'credentialHelper': 'none',
        // We will display Google and Facebook as auth providers.
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            // signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            //   this.props.setUser(firebase.auth().currentUser);
            //   return true;
            // }.bind(this)
        }
    }

    render(){
        return (
            <div id="sign_in">
                <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()}/>
            </div>
        );
    }
    
}

const SignUpView = ({ onSubmit }) => {
    return (
      <div>
        <h1>Sign up</h1>
        <form onSubmit={onSubmit}>
            <label>
            Name
            <input
              name="name"
              type="name"
              placeholder="Name"
            />
          </label>
          <label>
            License Plate
            <input
              name="number"
              type="text"
              placeholder="Number"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="Email"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              placeholder="Password"
            />
          </label>
          <button type="submit">Sign Up</button>
        </form>
      </div>
    );
};

class SignUpScreen extends Component {
    state = {
        signedUp: null
    }
    handleSignUp = async event => {
        event.preventDefault();
        const { name,number,email, password } = event.target.elements;
        try{
            firebase.auth().createUserWithEmailAndPassword(email.value, password.value).then(() => {
                let uid = firebase.auth().currentUser.uid;
                if (uid != null){
                    console.log(uid);
                    db.collection('users').doc(uid).set({
                        email: email.value,
                        emailVertified: true,
                        name: name.value,
                        plate: number.value
                    });
                }
                this.setState({signedUp: true});
            });
        }
        catch(error){
            alert(error);
        }
    }
    render(){
        const { signedUp } = this.state;
        return (<div id="sign_up">
                    <SignUpView onSubmit={this.handleSignUp} />
                    {signedUp && <Redirect to='/smartParkingWeb/home' /> }
                </div>
        );
    }
}


class PrivateRoute extends Component {
    render(){
        let { children, ...rest } = this.props;
        let user = firebase.auth().currentUser;
        return (
            <Route
                {...rest}
                render={() =>
                    user? (
                    children
                ) : (
                    <Redirect
                    to={{
                        pathname: "/smartParkingWeb/sign_in",
                    }}
                    />
                )
                }
            />
        );
    }
  }


class Navigation extends Component{
    // constructor(props) {
    //     super(props);
    //     this.state = {user: null};
    // }
    state = {loading:  true, authenticated: false, currentUser: null};
    logOutUser = ()=>{
       
        firebase.auth().signOut();
        // this.setState({user:null})
    }

    componentWillMount(){
        firebase.auth().onAuthStateChanged(user => {
            if(user){
                this.setState({
                    authenticated: true,
                    currentUser: user,
                    loading: false
                });
            }
            else{
                this.setState({
                    authenticated: false,
                    currentUser: null,
                    loading: true
                });
            }
        })
    }

    render(){ 
        const {currentUser} = this.state;
        
        return(
            <Router>
                <div id="nav">
                <Menu inverted pointing attached>
                    <Menu.Item as={Link} name='home' to='/smartParkingWeb/home'/>
                    <Menu.Item as={Link} name='my meter' to='/smartParkingWeb/my_meter'/>
                    <Menu.Menu position='right'>
                        {currentUser != null && <Menu.Item as={Link} name={'User'} to='/smartParkingWeb/settings'/>}
                        {currentUser != null && <Menu.Item as={Link} name='Logout' to='/smartParkingWeb/home' onClick={this.logOutUser}/>}
                        {(currentUser == null) && <Menu.Item as={Link} name='Sign-up' to='/smartParkingWeb/sign_up'/>}
                        {(currentUser == null) && <Menu.Item as={Link} name='Sign-in' to='/smartParkingWeb/sign_in'/>}
                    </Menu.Menu>
                </Menu>
                </div>
                <Switch>
                    <Route exact path="/smartParkingWeb">
                        <Home/>
                    </Route>
                    <Route path="/smartParkingWeb/home">
                        <Home/>
                    </Route>
                    <PrivateRoute path="/smartParkingWeb/my_meter">
                        <MyMeter/>
                    </PrivateRoute>
                    <PrivateRoute path="/smartParkingWeb/settings">
                        <Settings/>
                    </PrivateRoute>
                    <Route path="/smartParkingWeb/sign_in">
                        <SignInScreen/>
                    </Route>
                    <Route path="/smartParkingWeb/sign_up">
                        <SignUpScreen/>
                    </Route>
                </Switch>
            </Router>
        )
    }
}
class App extends Component{
  
    render() {
        return (
            <div id="App">
                <Navigation/>
            </div>
        )
    }
  
}

export default App;
