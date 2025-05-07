import React from 'react';

// Separate Video Player Component (Correct Embed URL)
const VideoPlayer = ({ videoId, playerRef }) => {
    if (!videoId) return null;
    // **FIXED YouTube Embed URL** and added necessary params
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1`;

    return (
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-xl border border-muted animate-fadeIn">
            <iframe
                ref={playerRef} // Ref for potential future API interactions
                key={videoId} // Force re-render if videoId changes
                width="100%"
                height="100%"
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default VideoPlayer;
