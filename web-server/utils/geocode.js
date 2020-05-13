const got = require('got');

// Mapbox - Geolocation APIx
const { MAPBOX_ACCESS_KEY } = require('./api_keys');

// Base API URL
const FORWARD_GEOCODING_URL =
    'https://api.mapbox.com/geocoding/v5/mapbox.places';

// Helper function to build the query string
const formatGeocodingQS = (baseUrl, accessKey, location) => {
    const wsRegex = /\s/g;
    const locationWithoutSpaces = location.replace(wsRegex, '%20');

    return `${baseUrl}/${locationWithoutSpaces}.json?access_token=${accessKey}&limit=1`;
};

const getPlaceCoordinates = async (locationName, callback) => {
    const geocodingQueryString = formatGeocodingQS(
        FORWARD_GEOCODING_URL,
        MAPBOX_ACCESS_KEY,
        locationName
    );

    try {
        const {
            body: { features },
        } = await got(geocodingQueryString, { responseType: 'json' });

        // If we get back a features array, it means it found the location
        if (features) {
            const result = features[0];
            const [longitude, latitude] = result.geometry.coordinates;
            const placeName = result.place_name;

            const locationObj = {
                longitude,
                latitude,
                placeName,
            };

            callback(null, locationObj);
        } else {
            callback("We couldn't find your location, pleace check for typos.");
        }
    } catch (error) {
        callback(
            "We couldn't connect to the server, check your internet connection!"
        );
    }
};

module.exports = getPlaceCoordinates;
