const weatherForm = document.querySelector('form');
const locationInput = document.getElementById('location-input');

const locationName = document.getElementById('location-name');
const forecastText = document.getElementById('forecast-text');
const errorMessage = document.getElementById('errorMessage');

weatherForm.addEventListener('submit', e => {
    e.preventDefault();

    const location = locationInput.value;
    locationInput.value = '';

    fetch('http://localhost:3000/weather?address=' + location)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                errorMessage.textContent = data.error;
                errorMessage.removeAttribute('hidden');
            } else {
                locationName.textContent = data.placeName;
                locationName.removeAttribute('hidden');
                forecastText.textContent = `${data.weatherDescription}: ${data.temperature}F`;
                forecastText.removeAttribute('hidden');
            }
        });
});
