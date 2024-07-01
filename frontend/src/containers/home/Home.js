// src/containers/Home.js
import React from 'react';
import Header from "../../components/structure/header";
import Footer from "../../components/structure/footer";
import "../../styles/home/home.scss"

const Home = () => {
    return (
        <div>
            <Header />
            <main>
                <h2>Home</h2>
                <ul>
                    <li><a href={`${window.location.protocol}//${window.location.host}/register`}>Register</a></li>
                    <li><a href={`${window.location.protocol}//${window.location.host}/login`}>Login</a></li>
                </ul>
            </main>
            <Footer />
        </div>
    );
};

export default Home;