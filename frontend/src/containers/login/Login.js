// containers/register/Login.js
import React, {Component} from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import GoogleIcon from "../../images/icons/google_color.png"
import FacebookIcon from "../../images/icons/facebook_color.png"
import AppleIcon from "../../images/icons/apple_color.png"
import "../../styles/login/login.scss"

class Login extends Component {
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
                          <a href="" className="login-form-company">
                              <img src={GoogleIcon} alt="google icon"/>
                              <span> Continue with Google </span>
                          </a>
                      </p>
                      <p>
                          <a href="" className="login-form-company">
                              <img src={FacebookIcon} alt="google icon"/>
                              <span> Continue with Facebook </span>
                          </a>
                      </p>
                      <p>
                          <a href="" className="login-form-company">
                              <img src={AppleIcon} alt="google icon"/>
                              <span> Continue with Apple </span>
                          </a>
                      </p>
                      <p>
                          <h3 className="login-form-breakpoint">Or</h3>
                      </p>
                      <p>
                          <input type="text" title="Email address, or username"
                                 aria-label="Email address, or username" className="login-form-email" placeholder="Email address, or username"/>
                      </p>
                      <p>
                          <input type="password" title="Password" aria-label="Password" className="login-form-password" placeholder="Password"/>
                      </p>
                      <p>
                          <div className="login-form-remember-wrapper">
                              <input className="login-form-remember tgl tgl-light" id="cb1-6" type="checkbox"/>
                              <label title="Remember me" aria-label="Remember me" className="tgl-btn" htmlFor="cb1-6" />
                          </div>
                      </p>
                      <p>
                          <input type="submit" aria-label="Login" title="Login" value="Login"
                                 className="login-form-submit"/>
                      </p>
                      <p>
                          <h3 className="login-form-forgotPasswd">
                              <a href="">Forgot password?</a>
                          </h3>
                      </p>
                  </form>
                  <p className="login-form-signUp">
                      <span>No account?</span><a href="">Sign up</a>
                  </p>
              </main>
              <Footer/>
          </div>
      );
  }

}

export default Login;