import { OpenAI } from 'openai';
import dotenv from 'dotenv';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatTitle(firstMessage: string): Promise<string> {
  const prompt = `You are an insurance expert specialized in Home and SME Property products at AXA. 
    Based only on the AXA tool (Hogar Protegido document), generate a short and descriptive title (3–6 words) summarizing the following message:\n\n"${firstMessage}"\n\nOnly return the title.`;

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
      max_tokens: 20,
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
