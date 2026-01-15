import React, { createContext, useState, useCallback, useMemo, useRef } from 'react';

// Game Context for state management
export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    // Initial state setup
    const [gameState, setGameState] = useState({
        phase: 'setup', // setup, playing, answering, results
        gameTitle: '',
        videoUrl: '',
        videoId: null,
        players: [],
        rounds: [],
        currentRound: 0,
        predictionsMadeThisRound: new Set(),
        yesLabel: 'Yes',
        noLabel: 'No',
    });
    const [newPlayerName, setNewPlayerName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const videoPlayerRef = useRef(null); // Ref for YouTube player API control (if needed later)

    // --- Actions ---
    const setCustomLabels = useCallback((yes, no) => {
        setGameState(prev => ({
            ...prev,
            yesLabel: yes.trim() || 'Yes', // Default to 'Yes' if empty
            noLabel: no.trim() || 'No',   // Default to 'No' if empty
        }));
    }, []);

    const setGameTitleAction = useCallback((title) => {
        setGameState(prev => ({ ...prev, gameTitle: title }));
    }, []);

    const setVideoIdAction = useCallback((url, id) => {
        setGameState(prev => ({ ...prev, videoUrl: url, videoId: id }));
    }, []);

    const addPlayer = useCallback(() => {
        setErrorMessage(''); // Clear previous errors
        const trimmedName = newPlayerName.trim();
        if (trimmedName) {
            // Check for duplicates (case-insensitive)
            if (gameState.players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
                setErrorMessage(`Player "${trimmedName}" already exists.`);
                return;
            }
            // Add new player
            setGameState(prev => ({
                ...prev,
                players: [...prev.players, { id: Date.now(), name: trimmedName }]
            }));
            setNewPlayerName(''); // Clear input field
        }
    }, [newPlayerName, gameState.players]);

    const removePlayer = useCallback((id) => {
        setErrorMessage('');
        setGameState(prev => ({
            ...prev,
            players: prev.players.filter(p => p.id !== id)
        }));
    }, []);

    const startGame = useCallback(() => {
        setErrorMessage('');
        if (gameState.players.length < 1) {
            setErrorMessage("Add at least one player to start the game.");
            return;
        }
        if (!gameState.videoId) {
            setErrorMessage("Please enter and preview a valid YouTube URL first.");
            return;
        }
        // Start the first round and change phase
        startNewRound(); // This will increment currentRound to 1 and add the first round object
        setGameState(prev => ({ ...prev, phase: 'playing' }));
    }, [gameState.players, gameState.videoId]);

    const startNewRound = useCallback((timestamp = null, correctAnswer = null) => {
        setErrorMessage('');
        setGameState(prev => {
            const updatedRounds = [...prev.rounds];
            // Update the current round (the one just finishing) with timestamp and correct answer
            if (prev.currentRound > 0 && updatedRounds[prev.currentRound - 1]) {
                updatedRounds[prev.currentRound - 1] = {
                    ...updatedRounds[prev.currentRound - 1],
                    timestamp: timestamp,
                    correctAnswer: correctAnswer
                };
            }

            // Add a new round object
            updatedRounds.push({
                roundNumber: prev.currentRound + 1,
                predictions: {},
                correctAnswer: null,
                timestamp: null
            });

            return {
                ...prev,
                rounds: updatedRounds,
                currentRound: prev.currentRound + 1,
                predictionsMadeThisRound: new Set()
            };
        });
    }, []);

    const makePrediction = useCallback((playerId, prediction) => {
        setErrorMessage('');
        setGameState(prev => {
            const updatedRounds = [...prev.rounds];
            const roundIndex = prev.currentRound - 1;

            // Safety check for valid round index
            if (roundIndex < 0 || roundIndex >= updatedRounds.length) return prev;

            // Deep copy the specific round and its predictions to avoid mutation issues
            const currentRoundData = {
                ...updatedRounds[roundIndex],
                predictions: { ...updatedRounds[roundIndex].predictions }
            };

            // Record the prediction
            currentRoundData.predictions[playerId] = { prediction };
            updatedRounds[roundIndex] = currentRoundData;

            // Update the set of players who have predicted this round
            const updatedPredictionsMade = new Set(prev.predictionsMadeThisRound).add(playerId);

            return {
                ...prev,
                rounds: updatedRounds,
                predictionsMadeThisRound: updatedPredictionsMade
            };
        });
    }, []);

    // Memoized value to check if all players have made a prediction in the current round
    const allPlayersPredicted = useMemo(() => {
        return gameState.players.length > 0 && gameState.predictionsMadeThisRound.size === gameState.players.length;
    }, [gameState.players, gameState.predictionsMadeThisRound]);

    const finishGame = useCallback((timestamp = null, correctAnswer = null) => {
        setErrorMessage('');
        if (gameState.rounds.length === 0) {
            setErrorMessage("Cannot finish game - no rounds have been played.");
            return;
        }
        setGameState(prev => {
            const updatedRounds = [...prev.rounds];
            // Update the final round with provided data
            if (prev.currentRound > 0 && updatedRounds[prev.currentRound - 1]) {
                updatedRounds[prev.currentRound - 1] = {
                    ...updatedRounds[prev.currentRound - 1],
                    timestamp: timestamp,
                    // Only update correctAnswer if provided (might be null if just finishing)
                    ...(correctAnswer !== null ? { correctAnswer } : {})
                };
            }

            return {
                ...prev,
                rounds: updatedRounds,
                phase: 'answering'
            };
        });
    }, [gameState.rounds]);

    const submitCorrectAnswer = useCallback((roundIndex, answer) => {
        setErrorMessage('');
        setGameState(prev => {
            const updatedRounds = [...prev.rounds];
            // Safety check
            if (roundIndex < 0 || roundIndex >= updatedRounds.length) return prev;
            // Update the correct answer for the specified round
            updatedRounds[roundIndex] = { ...updatedRounds[roundIndex], correctAnswer: answer };
            return { ...prev, rounds: updatedRounds };
        });
    }, []);

    const viewResults = useCallback(() => {
        setErrorMessage('');
        // Check if all rounds played have a correct answer entered
        const allAnswered = gameState.rounds.every(r => r.correctAnswer !== null);
        if (!allAnswered) {
            setErrorMessage("Please enter the correct answer for all rounds before viewing results.");
            return;
        }
        // Move to the results phase
        setGameState(prev => ({ ...prev, phase: 'results' }));
    }, [gameState.rounds]);

    const resetGame = useCallback(() => {
        // Reset entire game state to initial values
        setGameState({
            phase: 'setup', gameTitle: '', videoUrl: '', videoId: null, players: [], rounds: [], currentRound: 0, predictionsMadeThisRound: new Set(), yesLabel: 'Yes', noLabel: 'No'
        });
        setNewPlayerName('');
        setErrorMessage('');
    }, []);

    const removeLastRound = useCallback(() => {
        setErrorMessage('');
        setGameState(prev => {
            if (prev.rounds.length === 0) return prev;
            const updatedRounds = prev.rounds.slice(0, -1);
            return {
                ...prev,
                rounds: updatedRounds,
                currentRound: updatedRounds.length
            };
        });
    }, []);

    // Context value passed down to consumers
    const value = useMemo(() => ({
        gameState, newPlayerName, setNewPlayerName, addPlayer, removePlayer, startGame, startNewRound, removeLastRound, makePrediction, allPlayersPredicted, finishGame, submitCorrectAnswer, viewResults, resetGame, errorMessage, setErrorMessage, videoPlayerRef, setCustomLabels, setGameTitleAction, setVideoIdAction
    }), [gameState, newPlayerName, errorMessage, allPlayersPredicted, addPlayer, removePlayer, startGame, startNewRound, removeLastRound, makePrediction, finishGame, submitCorrectAnswer, viewResults, resetGame, setCustomLabels, setGameTitleAction, setVideoIdAction]);

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
