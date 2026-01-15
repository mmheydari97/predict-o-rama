import React, { useState, useContext } from 'react';
import { Settings, Video, Edit3, UserPlus, PlusCircle, Trash2, Play, Youtube, Check, X } from 'lucide-react';
import { GameContext } from '../contexts/GameContext';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input } from '../ui/shadcn-stubs';
import MessageBox from './MessageBox';
import { getYouTubeVideoId } from '../utils/helpers';

// Enhanced GameSetup Component (Improved Layout & UX)
const GameSetup = () => {
  const { gameState, newPlayerName, setNewPlayerName, addPlayer, removePlayer, startGame, errorMessage, setErrorMessage, setCustomLabels, setGameTitleAction, setVideoIdAction } = useContext(GameContext);

  // Local state for inputs to provide immediate feedback
  const [titleLocal, setTitleLocal] = useState(gameState.gameTitle);
  const [urlLocal, setUrlLocal] = useState(gameState.videoUrl);
  const [yesLabelLocal, setYesLabelLocal] = useState(gameState.yesLabel);
  const [noLabelLocal, setNoLabelLocal] = useState(gameState.noLabel);
  const [previewVideoId, setPreviewVideoId] = useState(gameState.videoId);
  const [showVideoPreview, setShowVideoPreview] = useState(!!gameState.videoId);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(''); // Separate error for preview

  // Update context on blur or significant change (debounced if needed)
  const handleTitleChange = (e) => {
    setTitleLocal(e.target.value);
    setGameTitleAction(e.target.value); // Update context immediately or debounce
  };

  const handleLabelChange = (e, labelType) => {
    const value = e.target.value;
    if (labelType === 'yes') {
      setYesLabelLocal(value);
      setCustomLabels(value, noLabelLocal); // Update context
    } else {
      setNoLabelLocal(value);
      setCustomLabels(yesLabelLocal, value); // Update context
    }
  };

  // Handle URL change to update context immediately
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrlLocal(newUrl);

    const videoId = getYouTubeVideoId(newUrl);
    // Update context immediately so 'Start Game' becomes enabled if valid
    setVideoIdAction(newUrl, videoId || null);

    // If the user changed the URL, hide the old preview if it doesn't match
    if (videoId !== previewVideoId) {
      setShowVideoPreview(false);
    }
  };

  // Preview video logic
  const handlePreviewVideo = (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear general errors
    setPreviewError(''); // Clear preview errors
    setShowVideoPreview(false);
    setPreviewVideoId(null);
    setIsPreviewLoading(true);

    const videoId = getYouTubeVideoId(urlLocal);

    // Simulate network delay for loading state
    setTimeout(() => {
      if (videoId) {
        setVideoIdAction(urlLocal, videoId); // Update context with valid URL and ID
        setPreviewVideoId(videoId);
        setShowVideoPreview(true);
        setPreviewError(''); // Clear preview error on success
      } else {
        setVideoIdAction(urlLocal, null); // Update context with invalid state
        setPreviewError("Invalid or unsupported YouTube URL. Please check the link.");
        setShowVideoPreview(false);
      }
      setIsPreviewLoading(false);
    }, 300); // Shorter delay
  };

  const handleAddPlayer = (e) => {
    e.preventDefault();
    addPlayer(); // Context handles logic and error messages
  }

  return (
    <Card className="w-full max-w-3xl mx-auto animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> Game Setup
        </CardTitle>
        <CardDescription>Configure your prediction game session below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Display general errors */}
        <MessageBox message={errorMessage} type="error" onClose={() => setErrorMessage('')} />

        {/* Section 1: Game Title & Video */}
        <section className="space-y-4 p-5 border rounded-lg bg-muted/30 shadow-inner">
          <h4 className="text-lg font-semibold flex items-center gap-2 text-primary border-b pb-2 mb-4">
            <Video className="h-5 w-5" /> Game & Video Details
          </h4>
          <div>
            <label htmlFor="gameTitle" className="block text-sm font-medium mb-1.5 text-muted-foreground">Game Title</label>
            <Input id="gameTitle" value={titleLocal} onChange={handleTitleChange} placeholder="e.g., Season Finale Predictions" required />
          </div>
          <form onSubmit={handlePreviewVideo} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium mb-1.5 text-muted-foreground">YouTube Video URL</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input id="videoUrl" value={urlLocal} onChange={handleUrlChange} placeholder="Paste YouTube link (e.g., https://www.youtube.com/watch?v=...)" required className="flex-grow" />
                <Button type="submit" disabled={isPreviewLoading || !urlLocal.trim()} className="w-full sm:w-auto">
                  {isPreviewLoading ? 'Loading...' : <><Youtube className="mr-2 h-4 w-4" /> Preview</>}
                </Button>
              </div>
              {/* Display preview errors specifically */}
              <MessageBox message={previewError} type="error" onClose={() => setPreviewError('')} />
            </div>
            {/* Video Preview Area */}
            {showVideoPreview && previewVideoId && (
              <div className="mt-4 border rounded-lg overflow-hidden shadow-md animate-fadeIn bg-black">
                {/* **FIXED YouTube Embed URL** */}
                <iframe
                  width="100%"
                  className="aspect-video block" // Ensure block display and aspect ratio
                  src={`https://www.youtube.com/embed/${previewVideoId}?modestbranding=1&rel=0&showinfo=0`}
                  title="YouTube video preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <MessageBox message="Video preview loaded successfully!" type="success" />
              </div>
            )}
          </form>
        </section>

        {/* Section 2: Custom Labels */}
        <section className="space-y-4 p-5 border rounded-lg bg-muted/30 shadow-inner">
          <h4 className="text-lg font-semibold flex items-center gap-2 text-primary border-b pb-2 mb-4">
            <Edit3 className="h-5 w-5" /> Custom Terms (Optional)
          </h4>
          <p className="text-xs text-muted-foreground -mt-3">Define custom terms instead of "Yes" / "No". Leave blank to use defaults.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="yesLabel" className="block text-sm font-medium mb-1.5 text-muted-foreground">Term for "Yes"</label>
              <Input id="yesLabel" value={yesLabelLocal} onChange={(e) => handleLabelChange(e, 'yes')} placeholder="Yes" />
            </div>
            <div>
              <label htmlFor="noLabel" className="block text-sm font-medium mb-1.5 text-muted-foreground">Term for "No"</label>
              <Input id="noLabel" value={noLabelLocal} onChange={(e) => handleLabelChange(e, 'no')} placeholder="No" />
            </div>
          </div>
        </section>

        {/* Section 3: Players */}
        <section className="space-y-4 p-5 border rounded-lg bg-muted/30 shadow-inner">
          <h4 className="text-lg font-semibold flex items-center gap-2 text-primary border-b pb-2 mb-4">
            <UserPlus className="h-5 w-5" /> Add Players ({gameState.players.length})
          </h4>
          <form onSubmit={handleAddPlayer} className="flex gap-2 mb-4">
            <Input value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="Enter player name..." className="flex-grow" />
            <Button type="submit" variant="secondary" size="icon" aria-label="Add Player" disabled={!newPlayerName.trim()}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </form>
          {/* Player List */}
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3 bg-background/50">
            {gameState.players.length > 0 ? gameState.players.map(player => (
              <div key={player.id} className="flex justify-between items-center bg-card p-2.5 rounded-md animate-fadeIn shadow-sm">
                <span className="font-medium text-sm">{player.name}</span>
                <Button onClick={() => removePlayer(player.id)} variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 w-8 h-8" aria-label={`Remove ${player.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )) : <p className="text-muted-foreground text-sm text-center py-4">No players added yet.</p>}
          </div>
        </section>
      </CardContent>
      <CardFooter>
        <Button onClick={startGame} disabled={!gameState.videoId || gameState.players.length === 0} className="w-full" size="lg">
          Start Game <Play className="ml-2 h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameSetup;
