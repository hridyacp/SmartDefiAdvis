import { apiRequest } from "./queryClient";

export interface StrategyRequest {
  riskProfile: string;
  currentReturns: number;
  volatility: number;
}

export interface StrategyResponse {
  strategies: Array<{
    title: string;
    description: string;
    riskLevel: string;
    potentialReturn: string;
  }>;
  analysis: string;
}

export async function getStrategySuggestions(
  request: StrategyRequest
): Promise<StrategyResponse> {
  const res = await apiRequest("POST", "/api/strategies", request);
  return res.json();
}
