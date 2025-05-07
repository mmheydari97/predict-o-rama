import React, { useContext } from 'react';
import { GameProvider, GameContext } from './contexts/GameContext';
import GameSetup from './components/GameSetup';
import Gameplay from './components/Gameplay';
import AnsweringPhase from './components/AnsweringPhase';
import Results from './components/Results';
import VideoPlayer from './components/VideoPlayer';

// Main App Component
const AppContent = () => {
  const { gameState, videoPlayerRef } = useContext(GameContext);

  // Render different components based on game phase
  const renderPhaseContent = () => {
    switch (gameState.phase) {
      case 'setup':
        return <GameSetup />;
      case 'playing':
        return <Gameplay />;
      case 'answering':
        return <AnsweringPhase />;
      case 'results':
        return <Results />;
      default:
        return <GameSetup />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Predict-O-Rama</h1>
          <div className="text-sm opacity-80">
            {gameState.phase !== 'setup' && gameState.gameTitle ? gameState.gameTitle : 'YouTube Prediction Game'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Video Player (shown in playing phase) */}
        {gameState.phase === 'playing' && gameState.videoId && (
          <div className="mb-8">
            <VideoPlayer videoId={gameState.videoId} playerRef={videoPlayerRef} />
          </div>
        )}

        {/* Phase-specific content */}
        {renderPhaseContent()}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>Predict-O-Rama &copy; {new Date().getFullYear()} - A YouTube Prediction Game</p>
        </div>
      </footer>
    </div>
  );
};

// Wrap the app with the GameProvider
const App = () => (
  <GameProvider>
    <AppContent />
  </GameProvider>
);

export default App;
