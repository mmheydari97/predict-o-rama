// Helper to extract YouTube Video ID (Robust)
export const getYouTubeVideoId = (url) => {
    if (!url) return null;
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        // Fallback for non-standard URLs or potential errors
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(regex);
        videoId = match ? match[1] : null;
    }
    // Basic validation for 11 character ID
    return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? videoId : null;
};
