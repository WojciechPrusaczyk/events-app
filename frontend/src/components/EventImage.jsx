import React from 'react';
import {generateColorFromText, getShortName} from "./Helpers";

function applyStylesToElements(shortName) {
    const {lightHex, darkHex} = generateColorFromText(shortName);

    return {
        backgroundColor: lightHex,
        color: darkHex
    };
}

const EventImage = ({name, image, size}) => {
    if (size !== "small" && size !== "medium" && size !== "large")
    {
        console.log("Invalid size data provided for EventImage: "+size)
        return null;
    }
    if (null !== image && undefined !== image && image instanceof File)
    {
        return (
        <p className="univForm-container-file-imageWrapper">
            <img className={"univForm-container-file-image dp-"+size}
                 src={URL.createObjectURL(image)}
                 alt="uploaded image medium"/>
        </p>);
    }
    if(null !== image && undefined !== image && typeof image === 'string')
    {
        return (
        <p className="univForm-container-file-imageWrapper">
            <img className={"univForm-container-file-image dp-"+size}
                 src={`/media/images/${image}`}
                 alt="uploaded image medium"/>
        </p>);
    }
    if (null === image || undefined === image)
    {
        return (
        <p className="univForm-container-file-imageWrapper">
            <span className={"univForm-container-file-image dp-"+size} aria-label={"cover "+size}
                  style={applyStylesToElements(getShortName(name))}>
                {getShortName(name)}
            </span>
        </p>);
    }
};

export default EventImage;
