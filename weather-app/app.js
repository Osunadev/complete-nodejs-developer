const { printLocationWeather, msgs } = require('./utils/utils');

const locationName = process.argv[2];

if (locationName) {
    printLocationWeather(locationName);
} else {
    console.log(
        msgs.error("No 'locationName' provided, please enter a location name!")
    );
}
