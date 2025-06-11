const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// GET endpoint to read the JSON file
app.get('/api/data', async (req, res) => {
    try {
        const data = await fs.readFile('api_manager_data.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error reading data file' });
    }
});

// POST endpoint to update the JSON file
app.post('/api/data', async (req, res) => {
    try {
        await fs.writeFile(
            'api_manager_data.json',
            JSON.stringify(req.body, null, 2),
            'utf8'
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error writing data file' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});