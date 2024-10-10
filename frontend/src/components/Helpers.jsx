import axios from "axios";

export function getShortName(name) {
    if(name.length >= 3 )
    {
        if (name.includes(" "))
        {
            return  name.trim().split(/\s+/).map(word => word[0]).slice(0, 2).join('').toUpperCase();
        } else {
            return name[0].toUpperCase()+name[1].toUpperCase();
        }
    } else if(name.length === 2 ) {
        return name[0].toUpperCase()+name[1].toUpperCase();
    } else if(name.length === 1 ) {
        return name[0].toUpperCase();
    } else {
        return "E";
    }
}

export function generateColorFromText(text) {
    const hash = [...text].reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // creating colors
    const r = (hash * 17) % 128 + 127; // 127 to 255
    const g = (hash * 37) % 128 + 127;
    const b = (hash * 53) % 128 + 127;

    const lightColor = `rgb(${r}, ${g}, ${b})`;

    // darkening color
    const darkerFactor = 0.7;  // Współczynnik ciemnienia
    const darkerColor = `rgb(${Math.floor(r * darkerFactor)}, ${Math.floor(g * darkerFactor)}, ${Math.floor(b * darkerFactor)})`;

    // colors to hex
    const lightHex = rgbToHex(r, g, b);
    const darkHex = rgbToHex(Math.floor(r * darkerFactor), Math.floor(g * darkerFactor), Math.floor(b * darkerFactor));

    return { lightHex, darkHex };
}

export function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

export async function getAddressByLaLng(lat, lng) {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`);
        if (response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        } else {
            return "No address found";
        }
    } catch (error) {
        console.error("Error fetching address:", error);
        return "Error fetching address";
    }
}