const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs-node');

function loadData() {
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

function buildWordIndex(data) {
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

function convertToSequences(data, wordIndex) {
  let sequences = [];
  for (const sequence of Object.values(data)) {
    sequences.push(sequence.map(word => wordIndex[word]));
  }
  return sequences;
}

function splitData(sequences) {
  let trainIdx = Math.floor(sequences.length * 0.8); // 80-20 split
  let trainSequences = sequences.slice(0, trainIdx);
  let valSequences = sequences.slice(trainIdx);
  return [trainSequences, valSequences];
}

function createDataset(sequences, wordIndex) {
    const features = [], labels = [];
    for (const sequence of sequences) {
      for (let i = 0; i < sequence.length - 1; i++) {
        features.push(sequence.slice(0, i + 1));
        labels.push(sequence[i + 1]);
    }
    }
    
    const paddedFeatures = tf.keras.preprocessing.sequence.pad_sequences(features, {padding: 'post'});
    const featureTensor = tf.tensor(paddedFeatures);
    const labelTensor = tf.oneHot(tf.tensor1d(labels, 'int32'), Object.keys(wordIndex).length + 1);
    
    return { featureTensor, labelTensor };
}

// Load the data, and later use it for training your model.
loadData();
module.exports = { loadData, buildWordIndex }; // Exporting necessary functions