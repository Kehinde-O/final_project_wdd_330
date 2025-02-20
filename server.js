// server.js
const express = require('express');
const app = express();
const port = 80; // You can choose a different port if you like

app.use(express.static('public')); // Serve static files from the 'public' directory

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Serve index.html for the root path
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});