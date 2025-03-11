const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Allows frontend to call API from different origin

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Load questions from JSON file
const dataFilePath = path.join(__dirname, 'questions.json');

function loadQuestions() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data file:", err);
        return { questions: [] }; // Return an empty array if file read fails
    }
}
app.get("/api/questions", (req, res) => {
    try {
        const questions = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
        res.json(questions);
    } catch (err) {
        console.error("Error reading questions file:", err);
        res.status(500).json({ error: "Failed to load questions" });
    }
});

// Catch-all route to serve frontend
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.post("/api/submit", (req, res) => {
    try {
        const { answers } = req.body;
        const questions = loadQuestions();

        let score = 0;
        questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                score++;
            }
        });

        res.json({ score, total: questions.length });
    } catch (err) {
        console.error("Error processing answers:", err);
        res.status(500).json({ error: "Failed to process answers" });
    }
});


// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
