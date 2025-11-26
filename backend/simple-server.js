// Simple server test without database
const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(PORT, () => {
    console.log(`Simple server is running on port ${PORT}`);
});