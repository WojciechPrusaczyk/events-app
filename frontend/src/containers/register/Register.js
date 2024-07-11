// containers/register/Login.js
import React, {Component} from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import StepEmail from "./stepEmail";
import StepPassword from "./stepPassword";

const minStep = 0;
const maxStep = 4;
class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 0,
      formData: {
        // przykładowe dane formularza
        name: '',
        email: '',
        password: ''
      }
    };
  }

  nextStep = () => {
    this.setState((prevState) => ({
      step: (prevState.step < maxStep)?(prevState.step + 1):prevState.step
    }));
  };

  prevStep = () => {
    this.setState((prevState) => ({
      step: (prevState.step > minStep)?(prevState.step - 1):prevState.step
    }));
  };

  handleChange = (input) => (e) => {
    const { formData } = this.state;
    formData[input] = e.target.value;
    this.setState({ formData });
  };

  render() {
    const { step, formData } = this.state;

    return (
      <div>
        <Header/>
        <TransitionGroup>
          <CSSTransition
            key={step}
            timeout={300}
            classNames="form"
          >
            <main className="form-container">
              {step === 0 && <StepEmail nextStep={this.nextStep} handleChange={this.handleChange} formData={formData} />}
              {step === 1 && <StepPassword nextStep={this.nextStep} prevStep={this.prevStep} handleChange={this.handleChange} formData={formData} />}
            </main>
          </CSSTransition>
        </TransitionGroup>
        {/*<Footer/>*/}
      </div>
    );
  }
}
export default Register;