import path from 'path';
import { loadData, convertToSequences, createDataset } from './dataLoader.js';
import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';  // Importing fs for file reading
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function evaluateModel(model, testDataset) {
  const evaluation = model.evaluate(testDataset.featureTensor, testDataset.labelTensor);
  const [loss, accuracy] = evaluation;
  console.log(`Model Evaluation: Loss = ${loss.arraySync()}, Accuracy = ${accuracy.arraySync()}`);
}

async function createModel(vocabSize, embeddingDim) {
  const model = tf.sequential();
  model.add(tf.layers.embedding({inputDim: vocabSize, outputDim: embeddingDim}));
  model.add(tf.layers.lstm({units: 128, returnSequences: false}));
  model.add(tf.layers.dense({units: vocabSize, activation: 'softmax'}));
  return model;
}

async function compileAndTrainModel(model, trainDataset, valDataset) {
  model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
  
  const history = await model.fit(trainDataset.featureTensor, trainDataset.labelTensor, {
    epochs: 10,
    validationData: [valDataset.featureTensor, valDataset.labelTensor],
    callbacks: tf.node.tensorBoard(path.join(__dirname, '..', 'logs'))
  });
  return history;
}



async function run() {
  const { trainDataset, valDataset, wordIndex } = loadData();
  const vocabSize = Object.keys(wordIndex).length + 1;
  const embeddingDim = 64;
  const lstmUnits = 128;
  const dropoutRate = 0.2; // Adjust dropout rate for regularization
  const learningRate = 0.001; // Adjust learning rate

  const model = await createModel(vocabSize, embeddingDim, lstmUnits, dropoutRate);
  await compileAndTrainModel(model, trainDataset, valDataset, learningRate);

  
  const testFilePath = path.join(__dirname, '..', 'data', 'processed', 'test_data.json');
  const rawTestData = fs.readFileSync(testFilePath);
  const processedTestData = JSON.parse(rawTestData);

  const testSequences = convertToSequences(processedTestData, wordIndex);
  const testDataset = createDataset(testSequences, wordIndex);
  
  await evaluateModel(model, testDataset);
  
  const modelSavePath = path.join(__dirname, '..', 'models');

  await model.save(`file://${modelSavePath}`);
}

run();
