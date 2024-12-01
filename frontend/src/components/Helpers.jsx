import axios from "axios";
import Quill from 'quill';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

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

export function formatDateForInput(dateString)  {
  const date = new Date(dateString); // Tworzy datę w lokalnej strefie czasowej
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Miesiące są 0-indeksowane
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeForInput(dateString) {
  const date = new Date(dateString); // Tworzy datę w lokalnej strefie czasowej
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatForBackend(dateInput, timeInput) {
    const combinedDateTime = `${dateInput}T${timeInput}`;
    const dateObject = new Date(combinedDateTime);

    // Obliczanie offsetu w minutach i przeliczanie na milisekundy
    const timezoneOffset = dateObject.getTimezoneOffset() * 60 * 1000;

    // Korygowanie daty przez odjęcie offsetu
    const localTime = new Date(dateObject.getTime() - timezoneOffset);

    // Zwraca w formacie ISO z zachowaniem lokalnej strefy czasowej
    return localTime.toISOString().slice(0, 19);  // usunięcie 'Z' na końcu, aby nie było błędnie interpretowane jako UTC
}

export function quillToHtml(data) {
    const delta = JSON.parse(data);
    const converter = new QuillDeltaToHtmlConverter(delta.ops, {});
    return converter.convert();
}

const currentYear = new Date().getFullYear();
export const eventsCategories = [
    {technology: "Learn about new technologies 💻"},
    {sports: "Take breath of fresh air 🥵"},
    {cultural: "Culture to go 📖"},
    {music: "For your ears 📢"},
    {education: "Education is important 📒"},
    {[currentYear]: "Upcoming this year 📅"},
    {[currentYear+1]: "Awesome next year 📆"},
]