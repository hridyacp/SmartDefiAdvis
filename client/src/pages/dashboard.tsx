import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { getStrategySuggestions } from "@/lib/gpt";
import {
  mockPortfolioData,
  calculateRiskProfile,
  mockComparisonData,
  getAnonymizedInsights,
  generateShareableContent,
  mockLeaderboardData,
  type Strategy,
  mockAchievements,
} from "@/lib/portfolio";
import {
  Loader2,
  LogOut,
  Shield,
  LineChart,
  Trophy,
  Share2,
  Twitter,
  LinkedinIcon,
  Award,
  Wallet,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";

// Placeholder function - needs to be implemented based on achievement criteria
const checkAchievementUnlock = (portfolioData: any, achievement: any) => {
  // Implement your achievement unlocking logic here based on portfolioData and achievement criteria
  // Example:  return portfolioData.returns > achievement.criteria.returnThreshold;

  //For Yield Hunter example:
  if (achievement.title === "Yield Hunter") {
    return portfolioData.yieldFarming > 50;
  }
  return false; //Default to false if no logic is defined for this achievement.
};

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, connect, mint, isConnected } = useWallet();

  const riskProfile = calculateRiskProfile(mockPortfolioData);
  const comparisonData =
    mockComparisonData[
      riskProfile.toLowerCase() as keyof typeof mockComparisonData
    ];
  const insights = getAnonymizedInsights(mockPortfolioData);

  const [processedAchievements, setProcessedAchievements] =
    useState(mockAchievements);

  useEffect(() => {
    const updatedAchievements = mockAchievements.map((achievement) => ({
      ...achievement,
      dateEarned: checkAchievementUnlock(mockPortfolioData, achievement)
        ? achievement.dateEarned || new Date().toISOString()
        : undefined,
    }));
    setProcessedAchievements(updatedAchievements);
  }, [mockPortfolioData]);

  useEffect(() => {
    async function loadStrategies() {
      try {
        const response = await getStrategySuggestions({
          riskProfile,
          currentReturns: mockPortfolioData.returns,
          volatility: mockPortfolioData.volatility,
        });
        setStrategies(response.strategies);
      } catch (error) {
        console.error("Failed to load strategies:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStrategies();
  }, [riskProfile]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">DeFi Portfolio Advisor</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={connect}
              disabled={isConnected}
            >
              <Wallet className="h-4 w-4" />
              {isConnected
                ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}`
                : "Connect Wallet"}
            </Button>
            <span>Welcome, {user?.username}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
       
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Privacy-First Risk Profile</CardTitle>
              <CardDescription>Anonymized risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={mockPortfolioData.riskScore} />
                <p className="text-2xl font-bold">{riskProfile}</p>
                <p className="text-sm text-muted-foreground">
                  Your risk level is {insights.riskComparison} than similar
                  profiles
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DeFi Exposure</CardTitle>
              <CardDescription>Protocol utilization metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-lg">
                    Yield Farming: {mockPortfolioData.yieldFarming}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {insights.yieldOpportunities}
                  </p>
                </div>
                <div>
                  <p className="text-lg">
                    Lending: {mockPortfolioData.lending}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {insights.lendingUtilization}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anonymous Comparison</CardTitle>
              <CardDescription>
                How you compare to similar profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-lg">
                  Avg. DeFi Exposure: {comparisonData.avgDefiExposure}%
                </p>
                <p className="text-lg">
                  Avg. Returns: {comparisonData.avgReturns}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on anonymized {riskProfile.toLowerCase()} portfolios
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-6 w-6" />
              Privacy-Preserving Strategy Suggestions
            </CardTitle>
            <CardDescription>
              AI-powered recommendations based on anonymized metrics, not
              specific assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {strategies.map((strategy, index) => (
                  <Card className="border-2 border-white" key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {strategy.title}
                      </CardTitle>
                      <CardDescription>{strategy.riskLevel}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{strategy.description}</p>
                      <p className="mt-4 text-sm font-medium">
                        Potential Return: {strategy.potentialReturn}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Top Performing Profiles
            </CardTitle>
            <CardDescription>
              Anonymous leaderboard based on risk-adjusted returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Returns</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Key Strategies</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLeaderboardData.map((entry) => (
                  <TableRow key={entry.rank}>
                    <TableCell className="font-medium">#{entry.rank}</TableCell>
                    <TableCell>{entry.riskProfile}</TableCell>
                    <TableCell>{entry.returns}%</TableCell>
                    <TableCell>{entry.successRate}%</TableCell>
                    <TableCell>{entry.strategies.join(", ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-6 w-6" />
              Share Your Performance
            </CardTitle>
            <CardDescription>
              Share your anonymized portfolio insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg">
                <p className="text-sm">
                  {generateShareableContent(mockPortfolioData, strategies).text}
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const shareContent = generateShareableContent(
                      mockPortfolioData,
                      strategies,
                    );
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        shareContent.text,
                      )}`,
                      "_blank",
                    );
                  }}
                >
                  <Twitter className="h-4 w-4" />
                  Share on Twitter
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    const shareContent = generateShareableContent(
                      mockPortfolioData,
                      strategies,
                    );
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        window.location.href,
                      )}&summary=${encodeURIComponent(shareContent.text)}`,
                      "_blank",
                    );
                  }}
                >
                  <LinkedinIcon className="h-4 w-4" />
                  Share on LinkedIn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6" />
              Privacy-Preserving NFT Achievements
            </CardTitle>
            <CardDescription>
              Mint NFTs showcasing your DeFi milestones without revealing
              portfolio details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {processedAchievements.map((achievement) => (
                <Dialog key={achievement.id}>
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer transition-all hover:scale-105 border-2 border-white">
                      <CardHeader>
                        <div className="mx-auto w-24 h-24 mb-4">
                          <img
                            src={achievement.imageUri}
                            alt={achievement.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <CardTitle className="text-lg text-center">
                          {achievement.title}
                        </CardTitle>
                        <CardDescription className="text-center">
                          {achievement.rarity.charAt(0).toUpperCase() +
                            achievement.rarity.slice(1)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-center">
                          {achievement.description}
                        </p>
                        {achievement.dateEarned && (
                          <p className="text-sm text-muted-foreground text-center mt-2">
                            Earned:{" "}
                            {new Date(
                              achievement.dateEarned,
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{achievement.title}</DialogTitle>
                      <DialogDescription>
                        {achievement.description}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                      <div className="w-48 h-48">
                        <img
                          src={achievement.imageUri}
                          alt={achievement.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-medium">
                          Rarity: {achievement.rarity}
                        </p>
                        {achievement.dateEarned ? (
                          <p className="text-sm text-muted-foreground">
                            Earned on{" "}
                            {new Date(
                              achievement.dateEarned,
                            ).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Progress: {Math.floor(Math.random() * 100)}%
                          </p>
                        )}
                      </div>
                      <Button
                        className="w-full"
                        onClick={async () => {
                          if (!isConnected) {
                            toast({
                              title: "Connect Wallet",
                              description:
                                "Please connect your wallet to mint NFTs",
                            });
                            const connected = await connect();
                            if (!connected) return;
                          }

                          // if (achievement.dateEarned) {
                            try {
                              toast({
                                title: "Minting NFT Achievement",
                                description:
                                  "Please confirm the transaction in your wallet...",
                              });

                              const metadata = JSON.stringify({
                              //  name: achievement.title,
                              //  description: achievement.description,
                                // image: achievement.imageUri,
                                // attributes: [
                                //   {
                                //     trait_type: "Rarity",
                                //     value: achievement.rarity,
                                //   },
                                //   {
                                //     trait_type: "Type",
                                //     value: achievement.criteria.type,
                                //   },
                                //   {
                                //     trait_type: "Date Earned",
                                //     value: achievement.dateEarned,
                                //   },
                                // ],
                                 id: achievement?.id,
                                  title: achievement?.title,
                                  description: achievement?.description,
                                  imageUri: achievement?.imageUri,
                                  criteria: achievement?.criteria,
                                  rarity: 'legendary',
                                  dateEarned: achievement?.dateEarned,
                              });

                              const txHash = await mint(metadata);

                              toast({
                                title: "NFT Minted Successfully!",
                                description: `Transaction hash: ${txHash.slice(0, 10)}...`,
                              });
                            } catch (error) {
                              toast({
                                title: "Minting Failed",
                                description:
                                  error instanceof Error
                                    ? error.message
                                    : "Failed to mint NFT",
                                variant: "destructive",
                              });
                            }
                          // } 
                          // else {
                          //   toast({
                          //     title: "Achievement Locked",
                          //     description:
                          //       "Keep working towards this milestone!",
                          //     variant: "destructive",
                          //   });
                          // }
                        }}
                      >
                        {
                        // achievement.dateEarned?
                           isConnected
                            ? "Mint NFT Achievement"
                            : "Connect Wallet to Mint"
                          // : "Achievement Locked"
                          }
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
