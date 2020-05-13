const chalk = require('chalk');

const getPlaceCoordinates = require('./geocode');
const getCoordinatesForecast = require('./forecast');

const msgs = {
    error: chalk.red.inverse.bold,
    title: chalk.blue.inverse.bold,
};

/* IN THIS SCENARIO WE'RE USING A CALLBACK INSTEAD OF A PROMISE APPROACH */
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
