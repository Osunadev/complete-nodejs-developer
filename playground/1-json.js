const fs = require('fs');

const dataBuffer = fs.readFileSync('./1-json.json');
const data = JSON.parse(dataBuffer.toString());

data.name = 'Omar';
data.age = '21';

const json = JSON.stringify(data);

fs.writeFileSync('./1-json.json', json);
