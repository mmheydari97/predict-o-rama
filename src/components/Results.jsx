import React, { useContext, useMemo } from 'react';
import { Trophy, Users, BarChart2, Zap, Lightbulb, Check, X, ArrowRight, Settings, Crown } from 'lucide-react';
import { GameContext } from '../contexts/GameContext';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/shadcn-stubs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Results Component (Show Game Results)
const Results = () => {
  const { gameState, resetGame } = useContext(GameContext);
  const { yesLabel, noLabel } = gameState;

  // Calculate player scores and stats
  const playerStats = useMemo(() => {
    const stats = gameState.players.map(player => {
      let correctPredictions = 0;
      let totalPredictions = 0;
      let yesCount = 0;
      let noCount = 0;

      gameState.rounds.forEach(round => {
        const playerPrediction = round.predictions[player.id]?.prediction;
        if (playerPrediction && round.correctAnswer) {
          totalPredictions++;
          if (playerPrediction === round.correctAnswer) {
            correctPredictions++;
          }
          if (playerPrediction === 'yes') {
            yesCount++;
          } else if (playerPrediction === 'no') {
            noCount++;
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
        noCount
      };
    });

    // Sort by accuracy (highest first)
    return stats.sort((a, b) => b.accuracy - a.accuracy);
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
  }, [gameState.rounds]);

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

  // Colors for charts
  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];
  const PIE_COLORS = ['#10b981', '#ef4444'];

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
          <CardTitle>Detailed Results</CardTitle>
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
        <CardFooter className="flex justify-center">
          <Button onClick={resetGame} size="lg" className="px-8">
            <Settings className="mr-2 h-5 w-5" /> New Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Results;
