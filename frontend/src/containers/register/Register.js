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

const minStep = 0;
const maxStep = 4;
class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      direction: "forward",
      formData: {
        email: '',
        password: '',
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
      step: (prevState.step < maxStep)?(prevState.step + 1):prevState.step,
      direction: 'forward'
    }));
  };

  prevStep = () => {
    this.setState((prevState) => ({
      step: (prevState.step > minStep)?(prevState.step - 1):prevState.step,
      direction: 'backward'
    }));
  };

  handleChange = (input) => (e) => {
    const { formData } = this.state;
    formData[input] = e.target.value;
    this.setState({ formData });
  };

  register = (input) => (e) => {
    const { formData } = this.state;
    formData[input] = e.target.value;
    this.setState({ formData });
    this.nextStep();
  };


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
              {step === 2 && <StepInfo nextStep={this.nextStep} prevStep={this.prevStep} handleChange={this.handleChange} formData={formData} />}
              {step === 3 && <StepTos nextStep={this.register} prevStep={this.prevStep} handleChange={this.handleChange} formData={formData} />}
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