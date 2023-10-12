import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function processData() {
  const dataDir = path.join(__dirname, '..', 'data', 'responses');
  const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

  const processedData = {};

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const rawData = fs.readFileSync(filePath);
    const responses = JSON.parse(rawData);

    for (const [prompt, response] of Object.entries(responses)) {
      let cleanedResponse = response.replace(/\n/g, ' ').replace(/[.,!?]/g, ' ');
      processedData[prompt] = cleanedResponse.match(/\b\w+\b/g);
    }
  }

  const processedFilePath = path.join(__dirname, '..', 'data', 'processed', 'med_processed_data.json');
  fs.writeFileSync(processedFilePath, JSON.stringify(processedData, null, 2));
  console.log(`Processed data saved to ${processedFilePath}`);
}

processData();
