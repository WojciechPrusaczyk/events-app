// src/components/Home.js
import React from 'react';

const Home = () => {
    return (
        <div>
            <h2>Home</h2>
            <ul>
                <li><a href={`${window.location.protocol}//${window.location.host}/register`}>Register</a></li>
                <li><a href={`${window.location.protocol}//${window.location.host}/login`}>Login</a></li>
            </ul>
        </div>
    );
};

export default Home;