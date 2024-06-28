import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from "./components/register/Register";
import Home from "./components/home/Home";
import Login from "./components/login/Login";

function App() {
  return (
    <Router>
        <div className="App">
          <Routes>
            <Route path="/" exact element={ <Home /> } />
            <Route path="/register" element={ <Register /> } />
            <Route path="/login" element={ <Login /> } />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
