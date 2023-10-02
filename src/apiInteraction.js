import fs from 'fs'
import path from 'path'
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// Replace with your OpenAI API Key
dotenv.config();
console.log(process.env.OPEN_AI_KEY);

const openai = new OpenAI({apiKey:process.env.OPEN_AI_KEY});

const initialMessage = { role: "system", content: "You are a knowledgeable entity capable of generating diverse and informative responses for testing purposes." };
const dirname = path.dirname(fileURLToPath(import.meta.url));
const promptsFilePath = path.join(dirname, '..', 'data', 'prompts', 'alt_prompts.json');
const rawPrompts = fs.readFileSync(promptsFilePath);
const prompts = JSON.parse(rawPrompts);



async function generateResponses() {
  const newResponses = {};

  for (const userContent of prompts) {
    const messages = [
      initialMessage,
      { role: "user", content: userContent },
    ];
    
    try {
      const response = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo",
      });

      newResponses[userContent] = response.choices[0].message.content.trim();
    } catch (error) {
      console.error(`Error generating response for prompt "${userContent}":`, error);
    }
  }

  return newResponses;
}

async function saveResponses() {
  const newResponses = await generateResponses();
  
  // Read existing responses
  const filePath = path.join(dirname, '..', 'data', 'responses', 'generated_responses.json');
  const existingDataRaw = fs.readFileSync(filePath);
  const existingData = JSON.parse(existingDataRaw);

  // Combine new and existing responses
  const combinedData = { ...existingData, ...newResponses };

  fs.writeFileSync(filePath, JSON.stringify(combinedData, null, 2));
  console.log(`Responses saved to ${filePath}`);
}

  
  saveResponses();
