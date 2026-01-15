import React, { useContext } from 'react';
import { Check, X, ArrowRight, StepForward } from 'lucide-react';
import { GameContext } from '../contexts/GameContext';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/shadcn-stubs';
import MessageBox from './MessageBox';

// Gameplay Component (Improved Player Card UI)
const Gameplay = () => {
  const { gameState, makePrediction, startNewRound, allPlayersPredicted, finishGame, errorMessage, setErrorMessage } = useContext(GameContext);
  const currentRoundData = gameState.rounds[gameState.currentRound - 1];
  const { yesLabel, noLabel } = gameState;

  if (!currentRoundData) return <p className="text-center text-muted-foreground p-10">Loading round...</p>;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-center">{gameState.gameTitle} - Round {gameState.currentRound}</h2>
      <MessageBox message={errorMessage} type="error" onClose={() => setErrorMessage('')} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Make Your Prediction!</CardTitle>
          <CardDescription>Host: Pause the video at the prediction moment. Players: Choose "{yesLabel}" or "{noLabel}".</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {gameState.players.map(player => {
            const playerPrediction = currentRoundData.predictions[player.id]?.prediction;
            const hasPredicted = playerPrediction !== undefined && playerPrediction !== null;
            // Define styles based on prediction state
            const cardBaseStyle = "p-4 rounded-lg border transition-all duration-300 ease-in-out";
            const cardDefaultStyle = "bg-card hover:bg-muted/50";
            const cardPredictedStyleYes = "bg-emerald-950/30 border-emerald-500/50 shadow-lg";
            const cardPredictedStyleNo = "bg-red-950/30 border-red-500/50 shadow-lg";

            const cardStyle = hasPredicted
              ? (playerPrediction === 'yes' ? cardPredictedStyleYes : cardPredictedStyleNo)
              : cardDefaultStyle;

            return (
              <div key={player.id} className={`${cardBaseStyle} ${cardStyle}`}>
                <p className="font-semibold mb-3 text-center text-lg border-b border-border pb-2">{player.name}</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-1 h-20 items-center">
                  <Button
                    onClick={() => makePrediction(player.id, 'yes')}
                    className={`flex-1 w-full py-2.5 text-base transition-all duration-200 shadow-sm
                        ${playerPrediction === 'yes'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent scale-105 font-bold shadow-lg z-10'
                        : 'bg-emerald-700 hover:bg-emerald-600 text-white opacity-90 hover:opacity-100 hover:scale-105'}
                        ${playerPrediction === 'no' ? 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100' : ''}
                      `}
                  >
                    <Check className={`mr-1.5 h-5 w-5 ${playerPrediction === 'yes' ? 'stroke-[3px]' : ''}`} /> {yesLabel}
                  </Button>
                  <Button
                    onClick={() => makePrediction(player.id, 'no')}
                    className={`flex-1 w-full py-2.5 text-base transition-all duration-200 shadow-sm
                        ${playerPrediction === 'no'
                        ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400 ring-offset-2 ring-offset-transparent scale-105 font-bold shadow-lg z-10'
                        : 'bg-red-700 hover:bg-red-600 text-white opacity-90 hover:opacity-100 hover:scale-105'}
                        ${playerPrediction === 'yes' ? 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100' : ''}
                      `}
                  >
                    <X className={`mr-1.5 h-5 w-5 ${playerPrediction === 'no' ? 'stroke-[3px]' : ''}`} /> {noLabel}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-4 justify-between">
          <p className="text-sm text-muted-foreground flex-1 text-center sm:text-left">
            {gameState.predictionsMadeThisRound.size} / {gameState.players.length} players predicted.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button onClick={finishGame} variant="destructive" className="w-full sm:w-auto">
              <StepForward className="mr-2 h-4 w-4" /> End Game & Enter Answers
            </Button>
            <Button onClick={startNewRound} disabled={!allPlayersPredicted} className="w-full sm:w-auto">
              Next Round <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Gameplay;
