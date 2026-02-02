import React, { useContext, useMemo } from 'react';
import { Trophy, Users, BarChart2, Zap, Lightbulb, Check, X, ArrowRight, Settings, Crown, Brain, Activity, UserPlus, Star } from 'lucide-react';
import { GameContext } from '../contexts/GameContext';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/shadcn-stubs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ReviewAnswers from './ReviewAnswers';

// Results Component (Show Game Results)
const Results = () => {
  const { gameState, resetGame } = useContext(GameContext);
  const { yesLabel, noLabel } = gameState;
  const [showReview, setShowReview] = React.useState(false);

  // Calculate player scores and stats
  const playerStats = useMemo(() => {
    // 1. Calculate basic stats and per-round data needed for advanced metrics
    const roundDetails = gameState.rounds.map(round => {
      let correctCount = 0;
      let yesCount = 0;
      let noCount = 0;
      let totalPredictions = 0;

      Object.values(round.predictions).forEach(p => {
        totalPredictions++;
        if (p.prediction === 'yes') yesCount++;
        if (p.prediction === 'no') noCount++;
        if (p.prediction === round.correctAnswer) correctCount++;
      });

      const majorityAnswer = yesCount > noCount ? 'yes' : (noCount > yesCount ? 'no' : null);

      // Weight Calculation
      const difficultyWeight = correctCount > 0 ? 1 / correctCount : 0;

      return {
        ...round,
        majorityAnswer,
        difficultyWeight,
        correctCount
      };
    });

    // 2. Compute stats for each player
    const stats = gameState.players.map(player => {
      let correctPredictions = 0;
      let totalPredictions = 0;
      let yesCount = 0;
      let noCount = 0;

      let contrarianCount = 0;
      let hardScore = 0;
      let roundsParticipated = 0;

      gameState.rounds.forEach((round, index) => {
        const playerPrediction = round.predictions[player.id]?.prediction;
        const roundDetail = roundDetails[index];

        if (playerPrediction) {
          totalPredictions++;
          roundsParticipated++;

          // Basic Stats
          if (round.correctAnswer) {
            if (playerPrediction === round.correctAnswer) {
              correctPredictions++;
              // Hard Question Score
              hardScore += roundDetail.difficultyWeight;
            }
          }

          if (playerPrediction === 'yes') yesCount++;
          else if (playerPrediction === 'no') noCount++;

          // Contrarian Score (Compare to majority)
          if (roundDetail.majorityAnswer && playerPrediction !== roundDetail.majorityAnswer) {
            contrarianCount++;
          }
        }
      });

      return {
        id: player.id,
        name: player.name,
        correctPredictions,
        totalPredictions,
        accuracy: totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0,
        yesCount,
        noCount,
        // Advanced Metrics
        contrarianScore: roundsParticipated > 0 ? (contrarianCount / roundsParticipated) : 0,
        hardScore: hardScore,
        rawContrarianCount: contrarianCount,
      };
    });

    // 3. Compute Player Similarity (Cross-player)
    const statsWithSimilarity = stats.map(player => {
      let maxSimilarity = -1;
      let mostSimilarPlayerName = "None";

      stats.forEach(otherPlayer => {
        if (player.id === otherPlayer.id) return;

        let agreements = 0;
        let commonRounds = 0;

        gameState.rounds.forEach(round => {
          const p1 = round.predictions[player.id]?.prediction;
          const p2 = round.predictions[otherPlayer.id]?.prediction;

          if (p1 && p2) {
            commonRounds++;
            if (p1 === p2) agreements++;
          }
        });

        if (commonRounds > 0) {
          const similarity = agreements / commonRounds;
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarPlayerName = otherPlayer.name;
          }
        }
      });

      return {
        ...player,
        largestSimilarity: maxSimilarity >= 0 ? maxSimilarity : 0,
        mostSimilarPlayerName
      };
    });

    // Sort by accuracy (highest first) as default
    return statsWithSimilarity.sort((a, b) => b.accuracy - a.accuracy);
  }, [gameState.players, gameState.rounds]);

  // Calculate Similarity Matrix
  const similarityMatrix = useMemo(() => {
    const players = gameState.players;
    const matrix = {};

    players.forEach(p1 => {
      matrix[p1.id] = {};
      players.forEach(p2 => {
        if (p1.id === p2.id) {
          matrix[p1.id][p2.id] = 100;
          return;
        }

        let agreements = 0;
        let commonRounds = 0;

        gameState.rounds.forEach(round => {
          const pred1 = round.predictions[p1.id]?.prediction;
          const pred2 = round.predictions[p2.id]?.prediction;

          if (pred1 && pred2) {
            commonRounds++;
            if (pred1 === pred2) {
              agreements++;
            }
          }
        });

        const similarity = commonRounds > 0 ? (agreements / commonRounds) * 100 : 0;
        matrix[p1.id][p2.id] = similarity;
      });
    });

    return matrix;
  }, [gameState.players, gameState.rounds]);

  // Calculate overall game stats
  const gameStats = useMemo(() => {
    let totalCorrect = 0;
    let totalPredictions = 0;
    let yesCorrectCount = 0;
    let noCorrectCount = 0;
    let yesAnswerCount = 0;
    let noAnswerCount = 0;

    gameState.rounds.forEach(round => {
      if (round.correctAnswer === 'yes') yesAnswerCount++;
      if (round.correctAnswer === 'no') noAnswerCount++;

      Object.values(round.predictions).forEach(prediction => {
        totalPredictions++;
        if (prediction.prediction === round.correctAnswer) {
          totalCorrect++;
          if (prediction.prediction === 'yes') yesCorrectCount++;
          if (prediction.prediction === 'no') noCorrectCount++;
        }
      });
    });

    return {
      totalCorrect,
      totalPredictions,
      overallAccuracy: totalPredictions > 0 ? (totalCorrect / totalPredictions) * 100 : 0,
      yesCorrectCount,
      noCorrectCount,
      yesAnswerCount,
      noAnswerCount
    };
  }, [gameState.rounds, yesLabel, noLabel]);

  // Identify Badge Winners
  const badges = useMemo(() => {
    if (playerStats.length < 2) return null;

    const sortedByContrarian = [...playerStats].sort((a, b) => b.contrarianScore - a.contrarianScore);
    const sortedByHardScore = [...playerStats].sort((a, b) => b.hardScore - a.hardScore);
    const sortedBySimilarity = [...playerStats].sort((a, b) => b.largestSimilarity - a.largestSimilarity);

    const topContrarian = sortedByContrarian[0].contrarianScore > 0 ? sortedByContrarian[0] : null;
    const topHardScore = sortedByHardScore[0].hardScore > 0 ? sortedByHardScore[0] : null;
    const topSimilarity = sortedBySimilarity[0].largestSimilarity > 0 ? sortedBySimilarity[0] : null;

    return { topContrarian, topHardScore, topSimilarity };
  }, [playerStats]);

  // Prepare data for charts
  const playerBarChartData = useMemo(() => {
    return playerStats.map(player => ({
      name: player.name,
      accuracy: Math.round(player.accuracy),
      correct: player.correctPredictions,
      total: player.totalPredictions
    }));
  }, [playerStats]);

  const predictionDistributionData = useMemo(() => {
    return [
      { name: yesLabel, value: gameStats.yesAnswerCount },
      { name: noLabel, value: gameStats.noAnswerCount }
    ];
  }, [gameStats, yesLabel, noLabel]);

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];
  const PIE_COLORS = ['#10b981', '#ef4444'];

  if (showReview) {
    return <ReviewAnswers onBack={() => setShowReview(false)} />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      <h2 className="text-3xl font-bold text-center flex items-center justify-center gap-2">
        <Trophy className="h-8 w-8 text-amber-500" /> {gameState.gameTitle} - Results
      </h2>

      {/* Winner Card */}
      {playerStats.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-amber-500" /> Winner
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="text-3xl font-bold mb-2">{playerStats[0].name}</div>
            <div className="text-xl text-muted-foreground">
              {playerStats[0].correctPredictions} correct predictions ({Math.round(playerStats[0].accuracy)}% accuracy)
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges / Highlights Section */}
      {badges && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.topHardScore && (
            <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Brain className="h-5 w-5" /> Sharp Eye
                </CardTitle>
                <CardDescription>Best at tough questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{badges.topHardScore.name}</div>
                <div className="text-sm text-muted-foreground">Score: {badges.topHardScore.hardScore.toFixed(2)}</div>
              </CardContent>
            </Card>
          )}
          {badges.topContrarian && (
            <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Activity className="h-5 w-5" /> Contrarian
                </CardTitle>
                <CardDescription>Most unique answers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{badges.topContrarian.name}</div>
                <div className="text-sm text-muted-foreground">Different {Math.round(badges.topContrarian.contrarianScore * 100)}% of the time</div>
              </CardContent>
            </Card>
          )}
          {badges.topSimilarity && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <UserPlus className="h-5 w-5" /> Twin Mind
                </CardTitle>
                <CardDescription>Highest agreement with another</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{badges.topSimilarity.name}</div>
                <div className="text-sm text-muted-foreground">Match with {badges.topSimilarity.mostSimilarPlayerName}: {Math.round(badges.topSimilarity.largestSimilarity * 100)}%</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" /> Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{gameState.players.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-purple-500" /> Rounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{gameState.rounds.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" /> Overall Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(gameStats.overallAccuracy)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-emerald-500" /> Correct Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{gameStats.totalCorrect} / {gameStats.totalPredictions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Similarity Matrix - NEW SECTION */}
      {gameState.players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-500" /> Player Similarity Matrix
            </CardTitle>
            <CardDescription>Correlation between players' answers (100% = Identical)</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  {gameState.players.map(p => (
                    <TableHead key={p.id} className="text-center">{p.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {gameState.players.map(p1 => (
                  <TableRow key={p1.id}>
                    <TableCell className="font-medium">{p1.name}</TableCell>
                    {gameState.players.map(p2 => {
                      const value = similarityMatrix[p1.id]?.[p2.id] ?? 0;
                      const isSelf = p1.id === p2.id;
                      return (
                        <TableCell key={p2.id} className={`text-center ${isSelf ? 'text-muted-foreground opacity-30' : ''}`}>
                          {isSelf ? '-' : `${Math.round(value)}%`}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detailed Insights Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-indigo-500" /> Insights & Analytics</CardTitle>
          <CardDescription>Deep dive into player performance and behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Hard Question Score</TableHead>
                <TableHead>Contrarian Score</TableHead>
                <TableHead>Most Similar To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerStats.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{player.hardScore.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">Weighted Points</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{(player.contrarianScore * 100).toFixed(0)}%</span>
                      <span className="text-xs text-muted-foreground">{player.contrarianScore > 0.5 ? 'Contrarian' : 'Crowd-aligned'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {player.mostSimilarPlayerName !== "None" ? (
                      <div className="flex flex-col">
                        <span>{player.mostSimilarPlayerName}</span>
                        <span className="text-xs text-muted-foreground">{(player.largestSimilarity * 100).toFixed(0)}% Match</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Accuracy Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Player Accuracy</CardTitle>
            <CardDescription>How well each player predicted outcomes</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={playerBarChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value, name) => [name === 'accuracy' ? `${value}%` : value, name === 'accuracy' ? 'Accuracy' : (name === 'correct' ? 'Correct Predictions' : 'Total Predictions')]} />
                <Legend />
                <Bar dataKey="accuracy" fill="#10b981" name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Prediction Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Correct Answer Distribution</CardTitle>
            <CardDescription>Distribution of "{yesLabel}" vs "{noLabel}" correct answers</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={predictionDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {predictionDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Stats</CardTitle>
          <CardDescription>Complete breakdown of all player predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Correct</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>{yesLabel}</TableHead>
                <TableHead>{noLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerStats.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{player.correctPredictions}</TableCell>
                  <TableCell>{player.totalPredictions}</TableCell>
                  <TableCell>{Math.round(player.accuracy)}%</TableCell>
                  <TableCell>{player.yesCount}</TableCell>
                  <TableCell>{player.noCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={() => setShowReview(true)} variant="secondary" size="lg" className="px-8">
            <Lightbulb className="mr-2 h-5 w-5" /> Review Answers
          </Button>
          <Button onClick={resetGame} size="lg" className="px-8">
            <Settings className="mr-2 h-5 w-5" /> New Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Results;
