import React, {Component} from 'react';
import logo from "../../images/logo.png"
import langLogo from "../../images/icons/language.svg"
import fbLogo from "../../images/icons/facebook_black.svg"
import igLogo from "../../images/icons/instagram_black.svg"
import xLogo from "../../images/icons/x_black.svg"


const Footer = (props) => {

    const appName = "Eventful";
    const currentYear = new Date().getFullYear();
    const appLogo = logo;
    const currentLanguage = "English";
    const socialMedia = [
        { name: "Facebook", href: "https://www.facebook.com/", icon: fbLogo},
        { name: "Instagram", href: "https://www.instagram.com/", icon: igLogo},
        { name: "X", href: "https://x.com", icon: xLogo},
    ];
    const footerLinks = [
        {
        name: "Company",
        children: [
            { name: "Informations", href: `${window.location.protocol}//${window.location.host}/about-company` },
            { name: "Jobs", href: `${window.location.protocol}//${window.location.host}/jobs` },
            { name: "About app", href: `${window.location.protocol}//${window.location.host}/about-app` },
        ],
        },{
        name: "Communities",
        children: [
            { name: "For creators", href: `${window.location.protocol}//${window.location.host}/community/creators` },
            { name: "For participants", href: `${window.location.protocol}//${window.location.host}/community/participants` },
            { name: "Advertisement", href: `${window.location.protocol}//${window.location.host}/community/advertisement` },
            { name: "Investors", href: `${window.location.protocol}//${window.location.host}/community/investors` },
        ],
        },{
        name: "Useful links",
        children: [
            { name: "Help", href: `${window.location.protocol}//${window.location.host}/help` },
            { name: "Free mobile app", href: `${window.location.protocol}//${window.location.host}/app` },
        ],
        },{
        name: "App plans",
        children: [
            { name: "Premium", href: `${window.location.protocol}//${window.location.host}/plans/premium` },
            { name: "For companies", href: `${window.location.protocol}//${window.location.host}/plans/company` },
            { name: "Free", href: `${window.location.protocol}//${window.location.host}/plans/free` },
        ]
        },
    ] ;

    let socialMediaComponent = socialMedia.map( (item, index) => {
        return (
            <a key={index} className="footer-links-socialMedia-link" href={item.href} aria-label={item.name}>
                <img src={item.icon} alt={item.name} aria-hidden="true"/>
            </a>
        );
    } );

    let footerLinksComponent = footerLinks.map( (item, index) => {

        let componentLinks = item.children.map( (child, childIndex) => {
            return (
                <li key={index} className="footer-links-app-list-item">
                    <a href={child.href}>{child.name}</a>
                </li>
            );
        });
        /*console.log(item.children);*/

        return (
            <div key={index} className="footer-links-app-list">
                <h2>{item.name}</h2>
                <ul>
                    {componentLinks}
                </ul>
            </div>
        );
    } );


    return (
        <footer className="footer">
            <div className="footer-lang">
                <button className="footer-lang-btn">
                    <img src={langLogo} alt="language logo" aria-hidden={true} />
                    <span>{currentLanguage}</span>
                </button>
            </div>
            <div className="footer-links">
                <div className="footer-links-app">
                    {footerLinksComponent}
                </div>
                <div className="footer-links-socialMedia">
                    {socialMediaComponent}
                </div>
            </div>
            <div className="footer-company">
                <div className="footer-company-signature">
                    <span className="footer-company-signature-name">{appName}</span>
                    <img className="footer-company-signature-logo" src={appLogo} alt="company logo"/>
                </div>
                <div className="footer-company-rights">
                    <span>© {currentYear} {appName}</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;