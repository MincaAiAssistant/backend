import { OpenAI } from 'openai';
import dotenv from 'dotenv';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatDescription(
  firstMessage: string
): Promise<string> {
  const prompt = `You are an insurance expert specialized in Home and SME Property products at AXA. 
    Based only on the AXA tool (Hogar Protegido document), generate a short and descriptive title (6-15 words) summarizing the following message:\n\n"${firstMessage}"\n\nOnly return the title.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates concise and informative titles for user messages.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 25,
      temperature: 0.5,
      n: 1,
    });

    const title = response.choices[0].message?.content?.trim() ?? 'Untitled';
    return title;
  } catch (error) {
    console.error('Error generating title:', error);
    throw error;
  }
}

export async function generateAgentName(firstMessage: string): Promise<string> {
  const prompt = `You are an insurance expert specialized in Home and SME Property products at AXA. 
  Based only on the AXA tool (Hogar Protegido document), generate a duties name (2-3 words) for the AXA agent that would be replying to the following message:\n\n"${firstMessage}"\n\nOnly return the agent with their duties (e.g."Customer Care Agent", "Analysis Agent").`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that creates realistic names of AXA insurance agents.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 15,
      temperature: 0.7,
      n: 1,
    });

    const agentName =
      response.choices[0].message?.content?.trim() ?? 'Agente AXA';
    return agentName;
  } catch (error) {
    console.error('Error generating agent name:', error);
    throw error;
  }
}
