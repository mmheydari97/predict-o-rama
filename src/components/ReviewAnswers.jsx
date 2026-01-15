import React, { useContext, useState } from 'react';
import { ArrowLeft, ArrowRight, Play, Check, X, Clock, Settings } from 'lucide-react';
import { GameContext } from '../contexts/GameContext';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/shadcn-stubs';

// Component to review answers question by question
const ReviewAnswers = ({ onBack }) => {
    const { gameState, resetGame } = useContext(GameContext);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const { yesLabel, noLabel } = gameState;

    const currentRound = gameState.rounds[currentRoundIndex];
    if (!currentRound) return null;

    // Helper to get video timestamp link
    const getTimestampLink = (timestamp) => {
        if (!timestamp) return null;
        let timeInSeconds = 0;
        // Simple parser for mm:ss or hh:mm:ss or just seconds
        if (timestamp.includes(':')) {
            const parts = timestamp.split(':').reverse();
            timeInSeconds += parseInt(parts[0] || 0, 10);
            timeInSeconds += (parseInt(parts[1] || 0, 10) * 60);
            timeInSeconds += (parseInt(parts[2] || 0, 10) * 3600);
        } else {
            timeInSeconds = parseInt(timestamp, 10);
        }

        // Construct YouTube URL with timestamp
        // Extract video ID safely (assuming it's stored in gameState.videoId)
        const videoId = gameState.videoId;
        return `https://youtu.be/${videoId}?t=${timeInSeconds}`;
    };

    const timestampLink = getTimestampLink(currentRound.timestamp);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
                </Button>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    Review Round {currentRound.roundNumber}
                </h2>
                <Button variant="ghost" disabled className="opacity-0">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Placeholder
                </Button>
            </div>

            <Card className="border-t-4 border-t-primary">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl mb-2">Round {currentRound.roundNumber}</CardTitle>
                            <CardDescription>
                                Correct Answer: {' '}
                                <span className={`font-bold px-2 py-0.5 rounded ${currentRound.correctAnswer === 'yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    {currentRound.correctAnswer === 'yes' ? yesLabel : noLabel}
                                </span>
                            </CardDescription>
                        </div>
                        {timestampLink && (
                            <a href={timestampLink} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="gap-2">
                                    <Play className="h-4 w-4 text-red-500" />
                                    Watch Moment ({currentRound.timestamp})
                                </Button>
                            </a>
                        )}
                        {!timestampLink && currentRound.timestamp && (
                            <div className="flex items-center text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md text-sm">
                                <Clock className="mr-2 h-4 w-4" /> Timestamp: {currentRound.timestamp}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Player</TableHead>
                                    <TableHead>Prediction</TableHead>
                                    <TableHead className="text-right">Result</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gameState.players.map(player => {
                                    const prediction = currentRound.predictions[player.id]?.prediction;
                                    const isCorrect = prediction === currentRound.correctAnswer;

                                    return (
                                        <TableRow key={player.id} className={isCorrect ? 'bg-emerald-500/5' : 'bg-red-500/5'}>
                                            <TableCell className="font-medium">{player.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {prediction === 'yes' ? (
                                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                            <Check className="h-4 w-4" /> {yesLabel}
                                                        </span>
                                                    ) : prediction === 'no' ? (
                                                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                            <X className="h-4 w-4" /> {noLabel}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isCorrect ? (
                                                    <span className="inline-flex items-center justify-end gap-1 text-emerald-600 font-medium">
                                                        <Check className="h-4 w-4" /> Correct
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-end gap-1 text-red-600 font-medium">
                                                        <X className="h-4 w-4" /> Incorrect
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentRoundIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentRoundIndex === 0}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous Round
                    </Button>

                    <div className="flex gap-2">
                        {/* Navigation Dots */}
                        <div className="hidden sm:flex items-center gap-1 px-4">
                            {gameState.rounds.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentRoundIndex(idx)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentRoundIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
                                    aria-label={`Go to round ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="default"
                        onClick={() => setCurrentRoundIndex(prev => Math.min(gameState.rounds.length - 1, prev + 1))}
                        disabled={currentRoundIndex === gameState.rounds.length - 1}
                    >
                        Next Round <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>

            <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-6 flex justify-center">
                    <Button onClick={resetGame} variant="outline" className="text-muted-foreground hover:text-foreground">
                        <Settings className="mr-2 h-4 w-4" /> Start Completely New Game
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReviewAnswers;
