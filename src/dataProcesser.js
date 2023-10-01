const fs = require('fs');
const path = require('path');

function processData() {
  const filePath = path.join(__dirname, '..', 'data', 'responses', 'generated_responses.json');
  const rawData = fs.readFileSync(filePath);
  const responses = JSON.parse(rawData);

  const processedData = {};
  for (const [prompt, response] of Object.entries(responses)) {
    processedData[prompt] = response.split(' ');
  }

  const processedFilePath = path.join(__dirname, '..', 'data', 'processed', 'processed_data.json');
  fs.writeFileSync(processedFilePath, JSON.stringify(processedData, null, 2));
  console.log(`Processed data saved to ${processedFilePath}`);
}

processData();
