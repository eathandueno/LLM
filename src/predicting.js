// predicting.js (New File for Making Predictions Offline)
import fs from 'fs';
import path from 'path';
import * as tf from '@tensorflow/tfjs-node';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function loadModel() {
  const model = await tf.loadLayersModel('file://./models/model.json');
  return model;
}

async function predict(model, inputData) {
  const prediction = model.predict(inputData);
  // process prediction to make it readable or match the desired output format
  return prediction;
}

async function runPredictions() {
    const model = await loadModel();
    
    // Example inputData Preparation: This should be a sequence like the ones you used for training.
    // This is a placeholder, replace with actual input data processing logic.
    const inputSequence = ["word1", "word2", "word3"]; // Example, replace with actual input data.
    
    // Convert the input sequence to the format used for training.
    // Use appropriate preprocessing, tokenization, and conversion to tensor.
    const wordIndexFilePath = path.join(__dirname, '..', 'data', 'processed', 'word_index.json');
    const rawWordIndex = fs.readFileSync(wordIndexFilePath);
    const wordIndex = JSON.parse(rawWordIndex);
    const sequence = inputSequence.map(word => wordIndex[word] || 0); 
    const paddedSequence = tf.keras.preprocessing.sequence.pad_sequences([sequence], { padding: 'post' });
    const inputData = tf.tensor(paddedSequence);
    
    const result = await predict(model, inputData);
    console.log('Prediction Result:', result);
}

runPredictions();