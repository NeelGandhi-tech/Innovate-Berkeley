const express = require('express');
const path = require('path');
const app = express();

// Set up static files
app.use(express.static('public'));
app.use('/images', express.static('images'));

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Data shared by every template (same locals as build-static.js).
// Re-read on every request so edits to data/*.json show up without restarting the dev server.
const dataDir = path.join(__dirname, 'data');
function loadLocals() {
    Object.keys(require.cache)
        .filter(file => file.startsWith(dataDir))
        .forEach(file => delete require.cache[file]);
    return require('./data/locals');
}
Object.assign(app.locals, loadLocals());
app.use((req, res, next) => {
    Object.assign(app.locals, loadLocals());
    next();
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// app.get('/challenge', (req, res) => {
//     res.render('challenge');
// });

app.get('/partners', (req, res) => {
    res.render('partners');
});

app.get('/gallery', (req, res) => {
    res.render('gallery');
});

// The About page was folded into the main page; old links land there (Netlify does the same)
app.get('/about', (req, res) => {
    res.redirect(301, '/');
});

app.get('/foundry', (req, res) => {
    res.render('foundry');
});

// Old /register links go straight to the Luma event (Netlify does the same in netlify.toml)
app.get('/register', (req, res) => {
    res.redirect(301, app.locals.site.registerUrl);
});

app.get('/conference', (req, res) => {
    res.redirect('/');
});

// Catch-all handler: send back the index.html file for any non-API routes
app.get('*', (req, res) => {
    // Check if it's an API route
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For all other routes, serve the appropriate page or redirect to home
    if (req.path === '/partners') {
        return res.render('partners');
    } else if (req.path === '/gallery') {
        return res.render('gallery');
    } else if (req.path === '/challenge') {
        return res.render('challenge');
    } else if (req.path === '/register') {
        return res.render('register');
    } else {
        // For any other route, serve the home page
        return res.render('index');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});