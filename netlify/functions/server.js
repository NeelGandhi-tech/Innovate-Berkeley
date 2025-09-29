const express = require('express');
const path = require('path');
const serverless = require('serverless-http');

const app = express();

// Set up static files
app.use(express.static('public'));
app.use('/images', express.static('images'));

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/partners', (req, res) => {
    res.render('partners');
});

app.get('/gallery', (req, res) => {
    res.render('gallery');
});

app.get('/challenge', (req, res) => {
    res.render('challenge');
});

app.get('/conference', (req, res) => {
    res.redirect('/');
});

// Catch-all handler
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    if (req.path === '/about') {
        return res.render('about');
    } else if (req.path === '/partners') {
        return res.render('partners');
    } else if (req.path === '/gallery') {
        return res.render('gallery');
    } else if (req.path === '/challenge') {
        return res.render('challenge');
    } else {
        return res.render('index');
    }
});

module.exports.handler = serverless(app);
