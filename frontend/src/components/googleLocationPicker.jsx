import React, { useState, useEffect, useRef } from 'react';

const GoogleLocationPicker = ({ id, className, value }) => {
  const mapRef = useRef(null); // Referencja do kontenera mapy
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [geocoder, setGeocoder] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    // Ładowanie skryptu Google Maps API
    const loadGoogleMapsScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDOYFpDSbiZEuqLgSWLkOYEhZnEPKa-g7g&v=weekly&callback=initMap`;
        script.async = true;  // Ustawienie async
        script.defer = true;  // Ustawienie defer
        window.initMap = initMap; // Callback globalny po załadowaniu skryptu
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    loadGoogleMapsScript();

    return () => {
      // Czyszczenie po odmontowaniu komponentu
      if (window.google && window.google.maps) {
        setMap(null);
        setMarker(null);
        setGeocoder(null);
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current) return; // Sprawdzenie, czy kontener mapy jest dostępny

    const initialMap = new window.google.maps.Map(mapRef.current, {
      zoom: 8,
      center: { lat: -34.397, lng: 150.644 },
      mapTypeControl: false,
    });

    const initialGeocoder = new window.google.maps.Geocoder();
    const initialMarker = new window.google.maps.Marker({
      map: initialMap,
    });

    // Ustawienie w stanie
    setMap(initialMap);
    setGeocoder(initialGeocoder);
    setMarker(initialMarker);

    initialMap.addListener('click', (e) => {
      geocode({ location: e.latLng });
    });
  };

  const geocode = (request) => {
    if (!geocoder || !map || !marker) return;

    geocoder
      .geocode(request)
      .then((result) => {
        const { results } = result;
        map.setCenter(results[0].geometry.location);
        marker.setPosition(results[0].geometry.location);
        marker.setMap(map);
        setResponse(JSON.stringify(results, null, 2));
        return results;
      })
      .catch((e) => {
        alert('Geocode was not successful for the following reason: ' + e);
      });
  };

  const clearMarker = () => {
    if (marker) {
      marker.setMap(null);
    }
  };

  return (
    <div id={id ? id : ''} className={className ? className : ''}>
      <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
      <button onClick={() => geocode({ address: "New York" })}>Geocode New York</button>
      <button onClick={clearMarker}>Clear</button>
      <pre>{response}</pre>
    </div>
  );
};

export default GoogleLocationPicker;
