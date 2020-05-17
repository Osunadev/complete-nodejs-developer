const http = require('http');

const url =
    'http://api.weatherstack.com/current?access_key=9e5a2ffd6f1301513d6a0434a503c4b0&query=Los%20Angeles';

const request = http.request(url, response => {
    let data = '';

    response.on('data', chunk => {
        data += chunk.toString();
    });

    response.on('end', () => {
        const jsonData = JSON.parse(data);
        console.log(jsonData);
    });
});

request.on('error', error => {
    console.log('An error', error);
});

request.end();
