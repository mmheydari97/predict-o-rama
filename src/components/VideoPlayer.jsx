import React, { useEffect, useRef } from 'react';

// Separate Video Player Component (Correct Embed URL with API)
const VideoPlayer = ({ videoId, playerRef }) => {
    const internalPlayerRef = useRef(null);

    useEffect(() => {
        if (!videoId) return;

        // Load YouTube IFrame API if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Initialize player when API is ready
        const initPlayer = () => {
            if (internalPlayerRef.current) {
                // If playerRef is provided from parent (Context), assign the player instance to it
                const player = new window.YT.Player(internalPlayerRef.current, {
                    videoId: videoId,
                    width: '100%',
                    height: '100%',
                    playerVars: {
                        autoplay: 1,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        enablejsapi: 1,
                        origin: window.location.origin
                    },
                    events: {
                        'onReady': (event) => {
                            if (playerRef) {
                                playerRef.current = event.target;
                            }
                        }
                    }
                });
            }
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            // Cleanup if needed (though tricky with YT API, usually fine to verify)
            if (playerRef && playerRef.current && typeof playerRef.current.destroy === 'function') {
                // playerRef.current.destroy(); // Can sometimes cause issues with React re-renders, better to leave or handle carefully
            }
        };
    }, [videoId, playerRef]);

    if (!videoId) return null;

    return (
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-xl border border-muted animate-fadeIn">
            {/* The ref here is for the DIV that gets replaced by the IFrame */}
            <div ref={internalPlayerRef} className="w-full h-full" />
        </div>
    );
};

export default VideoPlayer;
