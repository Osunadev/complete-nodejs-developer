const path = require('path');
const express = require('express');
const hbs = require('hbs');

const getPlaceCoordinates = require('../utils/geocode');
const getCoordinatesForecast = require('../utils/forecast');

const app = express();

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

// Setup handlebars engine and view location
app.set('view engine', 'hbs');
app.set('views', viewsPath); // 'templates' directory is not recognized by default as the views folder, that's why
hbs.registerPartials(partialsPath);

// Setup static directory to server
app.use(express.static(publicDirectoryPath));

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Weather',
        name: 'Omar Osuna',
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Me',
        name: 'Omar Osuna',
    });
});

app.get('/help', (req, res) => {
    res.render('help', {
        help: 'This is some helpful text',
        title: 'Help',
        name: 'Omar Osuna',
    });
});

app.get('/help/*', (req, res) => {
    res.render('not-found', {
        title: 'Not Found',
        name: 'Omar Osuna',
        notFoundMsg: 'Help article not found',
    });
});

app.get('/weather', (req, res) => {
    if (!req.query.address) {
        return res.send({
            error: 'You must provide an address.',
        });
    }

    const { address } = req.query;

    getPlaceCoordinates(address, (error, locationObj = {}) => {
        if (error) {
            return res.send({ error });
        } else {
            const { placeName, ...coordinates } = locationObj;

            getCoordinatesForecast(
                coordinates,
                (error, weatherForecastObj = {}) => {
                    if (error) {
                        return res.send({ error });
                    } else {
                        const {
                            temperature,
                            feelslike,
                            weatherDescription,
                        } = weatherForecastObj;

                        res.send({
                            placeName,
                            temperature,
                            feelslike,
                            weatherDescription,
                        });
                    }
                }
            );
        }
    });
});

app.get('*', (req, res) => {
    res.render('not-found', {
        title: 'Not Found',
        name: 'Omar Osuna',
        notFoundMsg: 'Page not found',
    });
});

app.listen(3000, () => {
    console.log('Server is up on port 3000');
});
