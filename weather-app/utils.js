const got = require('got');
const chalk = require('chalk');

const { WEATHERSTACK_ACCESS_KEY, MAPBOX_ACCESS_KEY } = require('./api_keys');

const msgs = {
    error: chalk.red.inverse.bold,
    title: chalk.blue.inverse.bold,
};

/* IN THIS SCENARIO WE'RE USING A CALLBACK INSTEAD OF A PROMISE APPROACH */

// Weatherstack - Forecast API
const formatWeatherQS = (baseUrl, accessKey, location, units = 'f') =>
    `${baseUrl}/current?access_key=${accessKey}&query=${location}&units=${units}`;

const getCoordinatesForecast = async ({ longitude, latitude }, callback) => {
    const WEATHER_BASE_URL = 'http://api.weatherstack.com';

    const location = `${latitude},${longitude}`;

    const weatherQueryString = formatWeatherQS(
        WEATHER_BASE_URL,
        WEATHERSTACK_ACCESS_KEY,
        location
    );

    try {
        const { body } = await got(weatherQueryString, {
            responseType: 'json',
        });

        if (body.error) {
            callback(msgs.error('Unable to find location!'));
        } else {
            const {
                temperature,
                feelslike,
                weather_descriptions,
            } = body.current;

            const weatherForecastObj = {
                temperature,
                feelslike,
                weatherDescription: weather_descriptions[0],
            };

            callback(null, weatherForecastObj);
        }
    } catch (error) {
        callback(
            msgs.error(
                "We couldn't connect to the server, check your internet connection!"
            )
        );
    }
};

// Mapbox - Geolocation API
const formatGeocodingQS = (baseUrl, accessKey, location) => {
    const wsRegex = /\s/g;
    const locationWithoutSpaces = location.replace(wsRegex, '%20');

    return `${baseUrl}/${locationWithoutSpaces}.json?access_token=${accessKey}&limit=1`;
};

const getPlaceCoordinates = async (locationName, callback) => {
    const FORWARD_GEOCODING_URL =
        'https://api.mapbox.com/geocoding/v5/mapbox.places';

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
            callback(
                msgs.error(
                    "We couldn't find your location, pleace check for typos."
                )
            );
        }
    } catch (error) {
        callback(
            msgs.error(
                "We couldn't connect to the server, check your internet connection!"
            )
        );
    }
};

const printLocationWeather = locationName => {
    getPlaceCoordinates(locationName, (error, locationObj) => {
        if (error) {
            console.log(msgs.error(error));
        } else {
            const { placeName, ...coordinates } = locationObj;

            console.log(msgs.title(' * Place Name:'), placeName);

            getCoordinatesForecast(coordinates, (error, weatherForecastObj) => {
                if (error) {
                    console.log(msgs.error(error));
                } else {
                    const {
                        temperature,
                        feelslike,
                        weatherDescription,
                    } = weatherForecastObj;

                    console.log(
                        msgs.title(' * Description:'),
                        `${weatherDescription}, It's currently ${temperature} degrees out. It feels like ${feelslike} degrees out.`
                    );
                }
            });
        }
    });
};

module.exports = {
    printLocationWeather,
    msgs,
};
