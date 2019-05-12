import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter as Router , Switch , Route, withRouter} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import firebase from './firebase';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';
import { setUser, clearUser } from './actions';
import Spinner from './Spinner';

//To create a global state
//composedevtools to connect with redux dev tool in the browser extension

const store = createStore(rootReducer, composeWithDevTools());

class Root extends Component {

	componentDidMount(){
		firebase.auth().onAuthStateChanged(user => {
			if(user){
				//setUser function call dispatches actions to reducer which inturn returns updated state
				this.props.setUser(user);
				this.props.history.push('/');
			}else{
				this.props.history.push('/login');
				this.props.clearUser();
			}
		})
	};

	render(){
		return this.props.isLoading ? 
				<Spinner/> 
			:
			(
				<Switch>
					<Route exact path='/' component={App}/>
					<Route  path='/login' component={Login}/>
					<Route  path='/register' component={Register}/>
				</Switch>
			)
			
			
			
		
	}
}
//destuructures the 
// const mapDispatchToProps = dispatch => {
// 	return{
// 		setUser: (user) => dispatch({
// 			type: 'SET_USER',
// 			payload:{
// 			currentUser: user
// 		}})
// 	}
// }
//connect connects RootWithAuth the component with reducer
//withRouter  for history

const mapStateToProps = state => ({
	isLoading: state.user.isLoading
})

const RootWithAuth = withRouter(connect(mapStateToProps, { setUser, clearUser })(Root))

ReactDOM.render(
	<Provider store={store}>
		<Router>
			<RootWithAuth/>
		</Router>
	</Provider>, document.getElementById('root'));
registerServiceWorker();
