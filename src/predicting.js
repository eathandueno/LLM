// predicting.js (New File for Making Predictions Offline)
import fs from 'fs';
import path from 'path';
import * as tf from '@tensorflow/tfjs-node';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function loadModel() {
  const model = await tf.loadLayersModel('file://./models/latest/model.json');
  return model;
}

async function predict(model, inputData, wordIndex) {
  const prediction = model.predict(inputData);
  const indexToWord = Object.keys(wordIndex).reduce((acc, word) => {
    acc[wordIndex[word]] = word;
    return acc;
  }, {});
  const predictedWordIndex = prediction.argMax(-1).dataSync();
  const predictedWord = indexToWord[predictedWordIndex];
  return predictedWord;
}

async function runPredictions() {
    const model = await loadModel();
    
    // Example inputData Preparation: This should be a sequence like the ones you used for training.
    // This is a placeholder, replace with actual input data processing logic.
    const inputSequence = ["How soon can I walk after knee surgery?", "I have pain in my knee when I climb stairs.", "I hear a clicking sound in my hip."]; // Example, replace with actual input data.
    const desiredMaxlen = 50
    // Convert the input sequence to the format used for training.
    // Use appropriate preprocessing, tokenization, and conversion to tensor.
    const wordIndexFilePath = path.join(__dirname, '..', 'data', 'processed', 'med_word_index.json');
    const rawWordIndex = fs.readFileSync(wordIndexFilePath);
    const wordIndex = JSON.parse(rawWordIndex);
    const sequence = inputSequence.map(word => wordIndex[word] || 0); 
    const paddedSequence = padSequences([sequence], desiredMaxlen)
    const inputData = tf.tensor(paddedSequence);
    
    const result = await predict(model, inputData, wordIndex);
    console.log('Prediction Result:', result);
}
function padSequences(sequences, maxLen, padding = 'post', value = 0 ){
  return sequences.map(sequence => {
    if(sequence.length > maxLen) {
      return sequence.slice(0, maxLen);
    }
    const pad = Array(maxLen - sequence.length).fill(value);
    return padding === 'post' ? sequence.concat(pad) : pad.concat(sequence);
  })
}

runPredictions();