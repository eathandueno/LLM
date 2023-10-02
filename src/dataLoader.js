import fs from 'fs';
import path from 'path';
import * as tf from '@tensorflow/tfjs-node';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function padSequences(sequences, maxlen, padding='post', truncating='post', value=0) {
  return sequences.map(seq => {
    if (seq.length > maxlen) {
      return truncating === 'pre' ? seq.slice(-maxlen) : seq.slice(0, maxlen);
    }
    const pad = Array(maxlen - seq.length).fill(value);
    return padding === 'post' ? seq.concat(pad) : pad.concat(seq);
  });
}

export function loadData() {
  const processedFilePath = path.join(__dirname, '..', 'data', 'processed', 'processed_data.json');
  const rawData = fs.readFileSync(processedFilePath);
  const processedData = JSON.parse(rawData);

  const wordIndex = buildWordIndex(processedData);
  const sequences = convertToSequences(processedData, wordIndex);
  const [trainSequences, valSequences] = splitData(sequences);

  const trainDataset = createDataset(trainSequences, wordIndex);
  const valDataset = createDataset(valSequences, wordIndex);

  const wordIndexFilePath = path.join(__dirname, '..', 'data', 'processed', 'word_index.json');
  fs.writeFileSync(wordIndexFilePath, JSON.stringify(wordIndex, null, 2));
  console.log(`wordIndex saved to ${wordIndexFilePath}`);

  return {trainDataset, valDataset, wordIndex};
}

export function buildWordIndex(data) {
  let wordIndex = {};
  let idx = 1;
  for (const sequence of Object.values(data)) {
    for (const word of sequence) {
      if (!(word in wordIndex)) {
        wordIndex[word] = idx++;
      }
    }
  }
  return wordIndex;
}

export function convertToSequences(data, wordIndex) {
  let sequences = [];
  for (const sequence of Object.values(data)) {
    sequences.push(sequence.map(word => wordIndex[word]));
  }
  return sequences;
}

export function splitData(sequences) {
  let trainIdx = Math.floor(sequences.length * 0.8);
  let trainSequences = sequences.slice(0, trainIdx);
  let valSequences = sequences.slice(trainIdx);
  return [trainSequences, valSequences];
}

export function createDataset(sequences, wordIndex) {
  const features = [], labels = [];
  for (const sequence of sequences) {
    for (let i = 0; i < sequence.length - 1; i++) {
      features.push(sequence.slice(0, i + 1));
      labels.push(sequence[i + 1]);
    }
  }
  
  const maxlen = 100;  // Replace with the maximum sequence length you want
  const paddedFeatures = padSequences(features, maxlen, 'post', 'post', 0);

  const featureTensor = tf.tensor(paddedFeatures);
  const labelTensor = tf.oneHot(tf.tensor1d(labels, 'int32'), Object.keys(wordIndex).length + 1);
  
  return { featureTensor, labelTensor };
}

loadData();
// module.exports = {buildWordIndex}