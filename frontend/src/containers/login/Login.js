// containers/register/Login.js
import React, {Component} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import GoogleIcon from "../../images/icons/google_color.png"
import FacebookIcon from "../../images/icons/facebook_color.png"
import AppleIcon from "../../images/icons/apple_color.png"
import "../../styles/containers/login.scss"
import axios from "axios";
import PasswordInput from "../../components/passwordInput";
import Cookies from 'js-cookie';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rememberUser: false,
      username: "",
      password: ""
    };
    this.rememberUser = this.rememberUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.login = this.login.bind(this);
  }

  rememberUser(e){
      this.setState({
      rememberUser: e.target.checked,
    });
  }

  handleChange = (field) => (event) => {
    this.setState({
        ...this.state,
        [field]: (event.target.type !== "checkbox") ? event.target.value : event.target.checked
    });
  }

  login(e){
      e.preventDefault();

      axios
          .post(`${window.location.protocol}//${window.location.host}/api/login/`, {
              username: this.state.username,
              password: this.state.password,
              rememberMe: this.state.rememberUser,
          }).then(response => {
              if (response.status === 200 )
              {
                  Cookies.set("username", response.data.user.username)
                  console.log(response.data.user.username);
                  window.location.href = '/';
              }
          })
   }

  render() {
      return (
          <div>
              <Header/>
              <main>
                  <form className="login-form">
                      <p>
                          <h2 className="login-form-title">Log into Eventful</h2>
                      </p>
                      <p>
                          <a href="" className="login-form-company" aria-label="login with google">
                              <img src={GoogleIcon} alt="google icon"/>
                              <span> Continue with Google </span>
                          </a>
                      </p>
                      <p>
                          <a href="" className="login-form-company" aria-label="login with facebook">
                              <img src={FacebookIcon} alt="facebook icon"/>
                              <span> Continue with Facebook </span>
                          </a>
                      </p>
                      <p>
                          <a href="" className="login-form-company" aria-label="login with apple">
                              <img src={AppleIcon} alt="apple icon"/>
                              <span> Continue with Apple </span>
                          </a>
                      </p>
                      <p>
                          <h3 className="login-form-breakpoint">Or</h3>
                      </p>
                      <p>
                          <input type="text" title="Email address, or username"
                                 aria-label="Email address, or username"
                                 className="login-form-email"
                                 placeholder="Email address, or username"
                                 onChange={this.handleChange('username')}
                          />
                      </p>
                      <p>
                          <PasswordInput handleChange={this.handleChange('password')} value={this.state.password} />
                      </p>
                      <p className="login-form-remember">
                          <div className="login-form-remember-wrapper">
                              <input className="login-form-remember tgl tgl-light" id="cb1-6" type="checkbox" aria-label="Remember me" onChange={this.handleChange('rememberUser')}/>
                              <label title="Remember me" aria-hidden="true" className="tgl-btn" htmlFor="cb1-6" />
                          </div>
                          <span>Remember me</span>
                      </p>
                      <p>
                          <input type="submit" aria-label="Login" title="Login" value="Login"
                                 className="login-form-submit" onClick={this.login}/>
                      </p>
                      <p>
                          <h3 className="login-form-forgotPasswd">
                              <a href="">Forgot password?</a>
                          </h3>
                      </p>
                  </form>
                  <p className="login-form-signUp">
                      <span>No account?</span><a href={`${window.location.protocol}//${window.location.host}/register`}>Sign up</a>
                  </p>
              </main>
              <Footer/>
          </div>
      );
  }
}

export default Login;