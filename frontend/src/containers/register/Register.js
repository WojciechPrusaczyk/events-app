// containers/register/Login.js
import React, {Component} from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import StepEmail from "./stepEmail";
import StepPassword from "./stepPassword";
import "../../styles/containers/register.scss"
import StepInfo from "./stepInfo";
import StepTos from "./stepTos";
import StepConfirmation from "./stepConfirmation";
import axios from "axios";

const minStep = 0;
const maxStep = 4;
const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};
const validatePassword = (password) => {


  let isLengthValid = password.length >= 8 && password.length <= 32;


  let hasSpecialChar = false;
  const specialCharRegex = /[$@#&!%?]/;
  const unwantedSpecialCharRegex = /[\^*()\-+={}[\]:;"'<>,.\/|\\]/;
  if (unwantedSpecialCharRegex.test(password))
  {
      hasSpecialChar = false;
  }
  else if (specialCharRegex.test(password))
  {
      hasSpecialChar = true;
  }
  else {
      hasSpecialChar = false;
  }

  const digitRegex = /\d/g;
  const digits = password.match(digitRegex);
  const hasThreeNumbers = digits && digits.length >= 3;

  return isLengthValid && hasSpecialChar && hasThreeNumbers;
};

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      direction: "forward",
      usernameErrors: '',
      formData: {
        email: '',
        password: '',
        name: '',
        surname: '',
        username: '',
        dateOfBirth: '',
        gender: '',
        acceptedNews: false,
        acceptedSharingDetails: false,
        acceptedTos: false,
      }
    };
  }

  nextStep = () => {
    this.setState((prevState) => ({
      step: (prevState.step <= maxStep)?(prevState.step + 1):prevState.step,
      direction: 'forward'
    }));
  };

  prevStep = () => {
    this.setState((prevState) => ({
      step: (prevState.step > minStep)?(prevState.step - 1):prevState.step,
      direction: 'backward'
    }));
  };

  handleChange = (field) => (event) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [field]: (event.target.type !== "checkbox") ? event.target.value : event.target.checked
      }
    });
  }

  register =  () => {
    const formData = this.state.formData;
    let isEntireFormValid = true;

    if (!formData.acceptedTos) {
      isEntireFormValid = false;
      console.log("Invalid form: TOS not accepted");
    }
    if (!formData.dateOfBirth || new Date(formData.dateOfBirth) < new Date() ) {
      isEntireFormValid = false;
      console.log("Invalid form: Incorrect date");
    }
    if (!validateEmail(formData.email)) {
      isEntireFormValid = false;
      console.log("Invalid form: Incorrect email");
    }
    if (!validatePassword(formData.password)) {
      isEntireFormValid = false;
      console.log("Invalid form: Invalid password");
    }
    if (!(formData.username.length > 6)) {
      isEntireFormValid = false;
      console.log("Invalid form: Invalid username");
    }

    axios
      .post(`${window.location.protocol}//${window.location.host}/api/register/`, {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        birthdate: formData.dateOfBirth,
        acceptedNews: formData.acceptedNews,
        acceptedSharingDetails: formData.acceptedSharingDetails,
        acceptedTos: formData.acceptedTos,
        sex: formData.gender,
        languge: "en",
      })
      .then( result => {
          if (result.status === 201) {
              this.nextStep();
          }
      })
      .catch(err => console.log(err));
  };

  validateUsername = async (username) => {
      try {
          const result = await axios.post(`${window.location.protocol}//${window.location.host}/api/checkUsername/`, {
              username: username
          });
          return !result.data.detail;
      } catch (err) {
          return false;
      }
  }



  render() {
    const { step, formData } = this.state;

    return (
      <div>
        <Header />
        <TransitionGroup>
          <CSSTransition
            key={step}
            timeout={300}
            classNames={this.state.direction === 'forward' ? 'form' : 'form-reverse'}
          >
            <main className="form-container">
              {step === 0 && <StepEmail nextStep={this.nextStep} handleChange={this.handleChange} formData={formData} />}
              {step === 1 && <StepPassword nextStep={this.nextStep} prevStep={this.prevStep} handleChange={this.handleChange} formData={formData} />}
              {step === 2 && <StepInfo nextStep={this.nextStep} prevStep={this.prevStep} handleChange={this.handleChange} formData={formData} validateUsername={this.validateUsername} />}
              {step === 3 && <StepTos register={this.register} prevStep={this.prevStep} handleChange={this.handleChange} formData={formData} />}
              {step === 4 && <StepConfirmation />}
            </main>
          </CSSTransition>
        </TransitionGroup>
        {/*<Footer/>*/}
      </div>
    );
  }
}
export default Register;