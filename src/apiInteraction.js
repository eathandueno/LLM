import fs from 'fs'
import path from 'path'
import OpenAI from 'openai';
import dotenv from 'dotenv';
// Replace with your OpenAI API Key
dotenv.config();
console.log(process.env.OPEN_AI);
const openai = new OpenAI({apiKey:process.env.OPEN_AI});
const initialMessage = { role: "system", content: "You are a knowledgeable entity capable of generating diverse and informative responses for testing purposes." };


const prompts = [
    "Explain the principles of permaculture design and how they can be applied to create a sustainable off-grid agricultural system.",
    "Provide information on companion planting and its benefits for off-grid gardening to enhance crop yield and soil fertility.",
    "Describe the key considerations for selecting and cultivating drought-resistant crops in an off-grid agricultural setting.",    
    "Explain the concept of regenerative agriculture and how it can improve soil health and productivity in off-grid farming.",    
    "Share insights into off-grid irrigation techniques that maximize water efficiency in agricultural practices.",    
    "Discuss the role of heirloom seeds and seed saving in maintaining a self-sustaining off-grid farm.",    
    "Provide guidance on creating a forest garden as part of an off-grid homestead, including suitable tree and plant species.",
    "Explain the importance of crop rotation and soil testing in maintaining healthy off-grid agricultural systems.",
    "Describe the process of natural pest control and organic methods for off-grid pest management in agricultural settings.",
    "Discuss the benefits of incorporating livestock, such as chickens or goats, into an off-grid agricultural ecosystem.",
    "Provide me with a detailed plan for a sustainable off-grid diet that ensures proper nutrition and energy for survival.",
    "Explain how to build a self-sufficient off-grid garden that can provide a variety of nutritious vegetables and fruits year-round.",
    "Describe the essential skills and knowledge needed for foraging in the wild to supplement off-grid nutrition.",
    "Share tips for preserving food off-grid without access to modern refrigeration methods.",
    "Discuss strategies for off-grid water purification and storage to ensure a reliable water source for survival and self-sufficiency.",
    "Explain the importance of renewable energy sources like solar panels and wind turbines for off-grid living and self-sufficiency.",
    "Provide a step-by-step guide to building an off-grid shelter that is energy-efficient and suitable for long-term survival.",
    "Discuss the role of hunting and fishing in an off-grid lifestyle and share tips for sustainable hunting and fishing practices.",
    "Explain the concept of permaculture and how it can be applied to create a self-sustaining off-grid homestead.",
    "Share insights into off-grid cooking methods and recipes that make the most of limited resources and local ingredients."
];

async function generateResponses() {
    const responses = {};
    
    for (const userContent of prompts) {
      const messages = [
        initialMessage,
        { role: "user", content: userContent },
      ];
      
      try {
        const response = await openai.post('https://api.openai.com/v1/chat/completions', {
          model: "gpt-3.5-turbo",
          messages: messages,
        });
  
        // Assuming you want to save the assistant’s reply
        responses[userContent] = response.data.choices[0].message.content.trim();
      } catch (error) {
        console.error(`Error generating response for prompt "${userContent}":`, error);
      }
    }
    
    return responses;
  }

async function saveResponses() {
  const responses = await generateResponses();
  const filePath = path.join(__dirname, '..', 'data', 'responses', 'generated_responses.json');
  fs.writeFileSync(filePath, JSON.stringify(responses, null, 2));
  console.log(`Responses saved to ${filePath}`);
}

saveResponses();
