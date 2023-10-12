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
  // console.log(`Model Evaluation: Loss = ${loss.arraySync()}, Accuracy = ${accuracy.arraySync()}`);
}

async function createModel(vocabSize, embeddingDim) {
  const input = tf.input({shape:[null]});
  const embedding = tf.layers.embedding({inputDim:vocabSize, outputDim:embeddingDim}).apply(input);
  const lstm = tf.layers.lstm({units:128,returnSequences:false}).apply(embedding);
  const output = tf.layers.dense({units:vocabSize,activation:'softmax'}).apply(lstm);

  const model = tf.model({inputs:input,outputs:output});
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
  const dropoutRate = 0.3; // Adjust dropout rate for regularization
  const learningRate = 0.002; // Adjust learning rate

  const model = await createModel(vocabSize, embeddingDim, lstmUnits, dropoutRate);
  await compileAndTrainModel(model, trainDataset, valDataset, learningRate);

  
  const testFilePath = path.join(__dirname, '..', 'data', 'processed', 'med_test_data.json');
  const rawTestData = fs.readFileSync(testFilePath);
  const processedTestData = JSON.parse(rawTestData);

  const testSequences = convertToSequences(processedTestData, wordIndex);
  const testDataset = createDataset(testSequences, wordIndex);
  
  await evaluateModel(model, testDataset);
  
  const timestamp = new Date().toISOString();
  const modelSavePath = path.join(__dirname, '..', 'models', `model_${timestamp}`);
  await model.save(`file://${modelSavePath}`);

}

run();
