const got = require('got');

// Weatherstack - Forecast API
const { WEATHERSTACK_ACCESS_KEY } = require('./api_keys');

// Base API URL
const WEATHER_BASE_URL = 'http://api.weatherstack.com';

// Helper function to build the query string
const formatWeatherQS = (baseUrl, accessKey, location, units = 'f') =>
    `${baseUrl}/current?access_key=${accessKey}&query=${location}&units=${units}`;

const getCoordinatesForecast = async ({ longitude, latitude }, callback) => {
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
            callback('Unable to find location!');
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
            "We couldn't connect to the server, check your internet connection!"
        );
    }
};

module.exports = getCoordinatesForecast;
