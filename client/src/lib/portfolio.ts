export interface PortfolioMetrics {
  riskScore: number; // 1-100
  returns: number; // percentage
  volatility: number; // 1-100
  defiExposure: number; // percentage of portfolio in DeFi protocols
  yieldFarming: number; // percentage
  lending: number; // percentage
}

export interface Strategy {
  title: string;
  description: string;
  riskLevel: string;
  potentialReturn: string;
}

export interface LeaderboardEntry {
  rank: number;
  riskProfile: string;
  returns: number;
  successRate: number;
  strategies: string[];
}


// New Achievement-related interfaces
export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUri: string;
  criteria: AchievementCriteria;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  dateEarned?: string;
}

export interface AchievementCriteria {
  type: 'returns' | 'consistency' | 'innovation' | 'privacy';
  threshold: number;
  timeframe?: number; // in days
}

// Mock achievement data with updated criteria
export const mockAchievements: Achievement[] = [
  {
    id: 'privacy-master',
    title: 'Privacy Guardian',
    description: 'Successfully managed portfolio while maintaining complete privacy for 30 days',
    imageUri: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23805AD5"/><path d="M50 20v60M20 50h60" stroke="%23fff" stroke-width="8"/></svg>',
    criteria: {
      type: 'privacy',
      threshold: 100,
      timeframe: 30
    },
    rarity: 'legendary',
    dateEarned: new Date().toISOString() // Already earned for demo
  },
  {
    id: 'yield-hunter',
    title: 'Yield Hunter',
    description: 'Achieved 20%+ APY while maintaining moderate risk profile',
    imageUri: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" fill="%234C51BF"/><circle cx="50" cy="50" r="20" fill="%23fff"/></svg>',
    criteria: {
      type: 'returns',
      threshold: 20
    },
    rarity: 'epic',
    // dateEarned will be set dynamically based on portfolio metrics
  },
  {
    id: 'consistent-performer',
    title: 'Consistent Performer',
    description: 'Maintained positive returns for 3 consecutive months',
    imageUri: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="50,20 80,80 20,80" fill="%2348BB78"/></svg>',
    criteria: {
      type: 'consistency',
      threshold: 90,
      timeframe: 90
    },
    rarity: 'rare',
    // dateEarned will be set dynamically based on portfolio metrics
  }
];

// Simulated portfolio data for demonstration
export const mockPortfolioData: PortfolioMetrics = {
  riskScore: 65,
  returns: 12.5,
  volatility: 45,
  defiExposure: 60,
  yieldFarming: 30,
  lending: 20
};

export const calculateRiskProfile = (metrics: PortfolioMetrics): string => {
  const { riskScore, defiExposure, volatility } = metrics;
  const totalRisk = (riskScore + defiExposure + volatility) / 3;

  if (totalRisk < 30) return "Conservative";
  if (totalRisk < 60) return "Moderate";
  return "Aggressive";
};

export const mockComparisonData = {
  conservative: { avgReturns: 8, avgRisk: 25, avgDefiExposure: 20 },
  moderate: { avgReturns: 15, avgRisk: 50, avgDefiExposure: 45 },
  aggressive: { avgReturns: 25, avgRisk: 75, avgDefiExposure: 75 }
};

export const mockLeaderboardData: LeaderboardEntry[] = [
  {
    rank: 1,
    riskProfile: "Aggressive",
    returns: 28.5,
    successRate: 92,
    strategies: ["Yield Farming", "Liquidity Provision"]
  },
  {
    rank: 2,
    riskProfile: "Moderate",
    returns: 18.2,
    successRate: 88,
    strategies: ["Lending", "Staking"]
  },
  {
    rank: 3,
    riskProfile: "Aggressive",
    returns: 25.1,
    successRate: 85,
    strategies: ["DEX Trading", "Yield Farming"]
  },
  {
    rank: 4,
    riskProfile: "Conservative",
    returns: 12.8,
    successRate: 95,
    strategies: ["Stablecoin Lending", "Fixed Income"]
  },
  {
    rank: 5,
    riskProfile: "Moderate",
    returns: 15.9,
    successRate: 87,
    strategies: ["Balanced Yield", "Diversified Lending"]
  }
];

// Helper function to get anonymized portfolio insights
export const getAnonymizedInsights = (metrics: PortfolioMetrics) => {
  const profile = calculateRiskProfile(metrics);
  const comparison = mockComparisonData[profile.toLowerCase() as keyof typeof mockComparisonData];

  return {
    riskComparison: metrics.riskScore > comparison.avgRisk ? "higher" : "lower",
    yieldOpportunities: metrics.yieldFarming < 40 ? "underutilized" : "optimal",
    lendingUtilization: metrics.lending < 30 ? "potential for growth" : "well-balanced"
  };
};

// Helper function to generate shareable content
export const generateShareableContent = (metrics: PortfolioMetrics, strategies: Strategy[]) => {
  const profile = calculateRiskProfile(metrics);
  return {
    text: `My DeFi portfolio is following a ${profile.toLowerCase()} strategy with ${metrics.returns}% returns. Using AI-powered privacy-preserving analysis to optimize performance! #DeFi #Privacy #AI`,
    metrics: {
      profile,
      returns: metrics.returns,
      successRate: Math.round((metrics.returns / mockComparisonData[profile.toLowerCase() as keyof typeof mockComparisonData].avgReturns) * 100)
    }
  };
};

// Helper function to check if an achievement is unlocked
export const checkAchievementUnlock = (metrics: PortfolioMetrics, achievement: Achievement): boolean => {
  switch (achievement.criteria.type) {
    case 'returns':
      return metrics.returns >= achievement.criteria.threshold;
    case 'consistency':
      // For demo purposes, we'll use a random value
      // In production, this would check historical data
      return Math.random() > 0.5;
    case 'privacy':
      // For demo purposes, assume privacy achievements are unlocked
      // In production, this would check privacy-preserving metrics
      return true;
    default:
      return false;
  }
};
