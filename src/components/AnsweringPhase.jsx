import React, { useContext, useState } from 'react';
import { Check, X, ArrowRight, Trophy } from 'lucide-react';
import { GameContext } from '../contexts/GameContext';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/shadcn-stubs';
import MessageBox from './MessageBox';

// AnsweringPhase Component (Enter Correct Answers)
const AnsweringPhase = () => {
  const { gameState, submitCorrectAnswer, viewResults, removeLastRound, errorMessage, setErrorMessage } = useContext(GameContext);
  const [selectedRound, setSelectedRound] = useState(0); // Index of the currently selected round
  const { yesLabel, noLabel } = gameState;

  // Check if all rounds have answers
  const allRoundsAnswered = gameState.rounds.every(round => round.correctAnswer !== null);

  // Adjust selectedRound if it becomes invalid (e.g., after removing the last round)
  React.useEffect(() => {
    if (selectedRound >= gameState.rounds.length && gameState.rounds.length > 0) {
      setSelectedRound(gameState.rounds.length - 1);
    }
  }, [gameState.rounds.length, selectedRound]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <h2 className="text-3xl font-bold text-center">{gameState.gameTitle} - Enter Correct Answers</h2>
      <MessageBox message={errorMessage} type="error" onClose={() => setErrorMessage('')} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Select Correct Answers</CardTitle>
          <CardDescription>For each round, select whether the prediction was "{yesLabel}" or "{noLabel}".</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Round Selection */}
          <div className="flex flex-wrap gap-3 justify-center">
            {gameState.rounds.map((round, index) => {
              const isLastRound = index === gameState.rounds.length - 1;
              return (
                <div key={index} className="relative group">
                  <Button
                    onClick={() => setSelectedRound(index)}
                    variant={selectedRound === index ? 'default' : 'outline'}
                    className={`relative ${round.correctAnswer ? 'border-emerald-500/50' : ''}`}
                  >
                    Round {round.roundNumber}
                    {round.correctAnswer && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    )}
                  </Button>
                  {isLastRound && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLastRound();
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md hover:scale-110 z-10"
                      title="Remove this round"
                      aria-label="Remove last round"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Round Answer Selection */}
          {gameState.rounds.length > 0 && gameState.rounds[selectedRound] && (
            <div className="p-6 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Round {gameState.rounds[selectedRound].roundNumber} Answer
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => submitCorrectAnswer(selectedRound, 'yes')}
                  variant={gameState.rounds[selectedRound].correctAnswer === 'yes' ? 'default' : 'outline'}
                  className={`flex-1 py-6 text-lg ${gameState.rounds[selectedRound].correctAnswer === 'yes' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                >
                  <Check className="mr-2 h-5 w-5" /> {yesLabel}
                </Button>
                <Button
                  onClick={() => submitCorrectAnswer(selectedRound, 'no')}
                  variant={gameState.rounds[selectedRound].correctAnswer === 'no' ? 'default' : 'outline'}
                  className={`flex-1 py-6 text-lg ${gameState.rounds[selectedRound].correctAnswer === 'no' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                >
                  <X className="mr-2 h-5 w-5" /> {noLabel}
                </Button>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setSelectedRound(prev => Math.max(0, prev - 1))}
                  variant="ghost"
                  disabled={selectedRound === 0}
                >
                  Previous Round
                </Button>
                <Button
                  onClick={() => setSelectedRound(prev => Math.min(gameState.rounds.length - 1, prev + 1))}
                  variant="ghost"
                  disabled={selectedRound >= gameState.rounds.length - 1}
                >
                  Next Round
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={viewResults}
            disabled={!allRoundsAnswered}
            size="lg"
            className="px-8"
          >
            View Results <Trophy className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>

      {/* Progress indicator */}
      <div className="text-center text-sm text-muted-foreground">
        {gameState.rounds.filter(r => r.correctAnswer !== null).length} of {gameState.rounds.length} rounds answered
      </div>
    </div>
  );
};

export default AnsweringPhase;
