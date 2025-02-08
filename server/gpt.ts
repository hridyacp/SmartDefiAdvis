import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface StrategyRequest {
  riskProfile: string;
  currentReturns: number;
  volatility: number;
}

export async function generateStrategies(request: StrategyRequest) {
  const prompt = `Generate 3 DeFi investment strategies as JSON for a ${request.riskProfile.toLowerCase()} investor with current returns of ${request.currentReturns}% and volatility of ${request.volatility}%. Each strategy should include a title, description, risk level, and potential return range. Format the response as a JSON object with a 'strategies' array and an 'analysis' string that compares performance to similar profiles.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in GPT response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("GPT API error:", error);
    throw new Error("Failed to generate strategies");
  }
}