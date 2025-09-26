const express = require('express');
const path = require('path');
const app = express();

// Set up static files
app.use(express.static('public'));
app.use('/images', express.static('images'));

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/challenge', (req, res) => {
    res.render('challenge');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/conference', (req, res) => {
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});