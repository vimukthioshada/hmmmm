const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow frontend requests

// Fetch audio stream for a single video
function fetchAudio(videoUrl, res) {
    exec(`yt-dlp -g -f "bestaudio" "${videoUrl}"`, (error, stdout) => {
        if (error) return res.status(500).json({ error: "Error fetching audio" });

        const audioUrl = stdout.trim();
        res.json({ audio: audioUrl });
    });
}

// Get single video or playlist
app.get("/audio", async (req, res) => {
    let query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query is required" });

    try {
        let videoUrl = query;

        // If it's a playlist, fetch all videos
        if (query.includes("playlist?list=")) {
            exec(`yt-dlp --flat-playlist --get-id "${query}"`, (error, stdout) => {
                if (error) return res.status(500).json({ error: "Error fetching playlist" });

                let videoIds = stdout.trim().split("\n");
                let videoUrls = videoIds.map(id => `https://www.youtube.com/watch?v=${id}`);
                res.json({ playlist: videoUrls });
            });
        } else {
            fetchAudio(videoUrl, res);
        }
    } catch (error) {
        res.status(500).json({ error: "Error processing request" });
    }
});

// Run Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
