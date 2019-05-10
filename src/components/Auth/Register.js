import React,{ Component } from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import { Link } from 'react-router-dom'
import firebase from '../../firebaseConfig';
import md5 from 'md5';

class Register extends Component{
	state={
		username:'',
		email:'',
		password:'',
		passwordConfirmation:'',
		errors:[],
		loading:false,
		usersRef: firebase.database().ref('users'),
		usernamesRef: firebase.database().ref('usernames')
	};

	isFormValid = () => {
		let errors = [];
		let error;

		if(this.isFormEmpty(this.state)){
			error= { message: 'Fill in all fields'};
			this.setState({errors: errors.concat(error) });
			return false;
		}else if(!this.isPasswordValid(this.state)){
			error = { message: 'Password is invalid' };
			this.setState({ errors: errors.concat(error) });
			return false;
		}else if(!this.isUsernameValid(this.state)){
			error = { message: 'Username already taken' };
			this.setState({ errors: errors.concat(error) });
			return false;
		}else{
			return true;
		}
	};

	isFormEmpty = ({ username, email, password, passwordConfirmation}) => {
		return !username.length || !email.length || !password.length ||
		!passwordConfirmation.length;
	};

	isPasswordValid = ({ password, passwordConfirmation}) => {
		if(password.length < 6 || passwordConfirmation.length < 6){
			return false;
		}else if(password !== passwordConfirmation){
			return false;
		}else{
			return true;
		}
	};

	isUsernameValid = ({username}) => {
		let fdbRefer = firebase.database().ref("users/"+username);
		console.log('fdbRefer',fdbRefer);
		return true
	};

	displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

	handleChange = event => {
		this.setState({ [event.target.name]:event.target.value });
	};

	handleInputError = (errors,inputName) => {
		return errors.some(error => 
							error.message.toLowerCase().includes(inputName)
						) ? "error" : ''
	};

	saveUser = createdUser => {
		return this.state.usersRef.child(createdUser.user.uid).set({
			name: createdUser.user.displayName,
			avatar: createdUser.user.photoURL
		});
	};

	handleSubmit = event => {
		event.preventDefault();
		if(this.isFormValid()){
			this.setState({errors: [], loading: true});
			firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
			.then(createdUser => {
				//this.setState({ loading: false });
				console.log(createdUser);
				createdUser.user.updateProfile({
					displayName: this.state.username,
					photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
				})
				.then(() => {
					this.saveUser(createdUser).then(() => {
						console.log('User Saved');
					});
				})
				.catch(err => {
					console.log(err);
					this.setState({ errors: this.state.errors.concat(err), loading: false });
				})
			})
			.catch(err => {
				console.log(err);
				this.setState({ errors: this.state.errors.concat(err), loading: false });
			})
		};
		
	};

	render(){
		const {username, email, password, passwordConfirmation, errors, loading} = this.state;

		return(
			<Grid textAlign="center" verticalAlign="middle" className="app">
				<Grid.Column style={{ maxWidth: 450}}>
					<Header as="h1" icon color="purple" textAlign="center">
						<Icon name="comments outline" color="purple"/>
						Register for crazyChat
					</Header>
					<Form onSubmit={this.handleSubmit} size="large">
						<Segment stacked>
							<Form.Input fluid name="username" icon="user" iconPosition="left"
							placeholder="Username" onChange={this.handleChange} type="text" 
							value={username}/>
							<Form.Input fluid name="email" icon="mail" iconPosition="left"
							placeholder="Email-id" onChange={this.handleChange} type="email" 
							value={email}
							className={this.handleInputError(errors, 'email')}/>
							<Form.Input fluid name="password" icon="lock" iconPosition="left"
							placeholder="Password" onChange={this.handleChange} type="password" 
							value={password}
							className={this.handleInputError(errors, 'password')}/>
							<Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left"
							placeholder="Confirm Password" onChange={this.handleChange} type="password" 
							value={passwordConfirmation}
							className={this.handleInputError(errors, 'password')}/>

							<Button disabled={loading} className={loading ? 'loading' : ''} color="purple" fluid size="large">Sign up</Button>
						</Segment>
					</Form>
					{errors.length > 0 && (
						<Message error>
							<h3>Error</h3>
							{this.displayErrors(errors)}
						</Message>
					)}
					<Message>Already Registered ? <Link to='/login'>Login</Link></Message>
				</Grid.Column>
			</Grid>
		)
	}
}

export default Register;