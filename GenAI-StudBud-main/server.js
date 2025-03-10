require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/plan', async (req, res) => {
    try {
        const { subjects, studyHours, goals, duration } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are an expert study planner. Create a detailed, structured study plan in a professional format based on the following details:

        Subject: ${subjects.join(', ')}
        Learning Goals: ${goals}
        Available Hours per Week: ${studyHours}
        Target Duration: ${duration}

        ---
        
        Overall Structure:
        The study plan should be divided into phases, each covering key areas of the subject. Each phase should last a few weeks and progressively build knowledge.

        Phase Breakdown:
        - Describe each phase, its focus areas, and key topics covered.
        - Include a weekly schedule with a structured breakdown (e.g., Monday-Friday learning hours and topics, project days, review sessions).

        Study Techniques and Methods:
        - List effective study techniques such as active learning, project-based learning, coding challenges, etc.

        Progress Milestones:
        - Define clear goals and expected outcomes at different stages.

        Resource Recommendations:
        - Suggest relevant books, online courses, and documentation.
        -  Format the response in plain text without special characters like asterisks, hashtags, or markdown symbols.Ensure clarity using paragraph spacing  and proper sentence structuring. Use line breaks for separation where needed.ensures the gap between each phase and headings with bold and large compare to normal text.
         `;
        
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ schedule: text });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate study plan' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
