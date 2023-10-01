const tf = require('@tensorflow/tfjs-node');
const path = require('path');  // Added for constructing paths
const { loadData } = require('./dataLoader.js');

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
    callbacks: tf.node.tensorBoard(path.join(__dirname, '..', 'logs'))  // Updated path
  });
  return history;
}

async function evaluateModel(model, testDataset) {
  const evaluation = model.evaluate(testDataset.featureTensor, testDataset.labelTensor);
  console.log('Model Evaluation:', evaluation);
}

async function run() {
    const { trainDataset, valDataset, wordIndex } = loadData();
    const vocabSize = Object.keys(wordIndex).length + 1;
    const embeddingDim = 64;
    
    const model = await createModel(vocabSize, embeddingDim);
    await compileAndTrainModel(model, trainDataset, valDataset);
    
    // Assuming you have separate test data processed in a similar way to training data.
    const testFilePath = path.join(__dirname, '..', 'data', 'processed', 'test_data.json'); 
    const rawTestData = fs.readFileSync(testFilePath);
    const processedTestData = JSON.parse(rawTestData);
  
    // Assuming that test data needs similar processing as the training data.
    const testSequences = convertToSequences(processedTestData, wordIndex); 
    const testDataset = createDataset(testSequences, wordIndex);
    
    await evaluateModel(model, testDataset);  // Evaluate the model
    
    const modelSavePath = path.join(__dirname, '..', 'saved_model');  // Updated path
    await model.save(`file://${modelSavePath}`);
  }
const { createModel } = require('../model');

test('createModel should return a defined object', async () => {
  const model = await createModel(1000, 16);
  expect(model).toBeDefined();
});

  run();
