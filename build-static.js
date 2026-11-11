const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// Data shared by every template (same locals as app.js)
const locals = require('./data/locals');

// Render an EJS template to HTML
function convertEjsToHtml(ejsContent, filename) {
    // Generate a timestamp for cache busting
    const timestamp = Date.now();

    let htmlContent = ejs.render(ejsContent, locals, { filename });

    // Add cache busting to all image references
    htmlContent = htmlContent.replace(/src="\/images\/([^"]+)"/g, `src="/images/$1?v=${timestamp}"`);
    
    return htmlContent;
}

// Function to process a single EJS file
function processEjsFile(inputPath, outputPath) {
    try {
        const ejsContent = fs.readFileSync(inputPath, 'utf8');
        const htmlContent = convertEjsToHtml(ejsContent, inputPath);
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, htmlContent);
        console.log(`Converted: ${inputPath} -> ${outputPath}`);
    } catch (error) {
        console.error(`Error processing ${inputPath}:`, error.message);
        process.exitCode = 1; // fail the deploy instead of shipping a missing page
    }
}

// Function to copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Main build process
function buildStatic() {
    console.log('Building static files for Netlify...');
    
    const viewsDir = path.join(__dirname, 'views');
    const publicDir = path.join(__dirname, 'public');
    const imagesDir = path.join(__dirname, 'images');
    const publicImagesDir = path.join(publicDir, 'images');
    
    // Copy images directory to public directory
    if (fs.existsSync(imagesDir)) {
        console.log('Copying images to public directory...');
        copyDir(imagesDir, publicImagesDir);
    }
    
    // List of EJS files to convert
    const ejsFiles = [
        'index.ejs',
        'partners.ejs',
        'gallery.ejs',
        'challenge.ejs',
        'register.ejs',
        'foundry.ejs'
    ];
    
    ejsFiles.forEach(file => {
        const inputPath = path.join(viewsDir, file);
        const outputFile = file.replace('.ejs', '.html');
        const outputPath = path.join(publicDir, outputFile);
        
        if (fs.existsSync(inputPath)) {
            processEjsFile(inputPath, outputPath);
        } else {
            console.warn(`File not found: ${inputPath}`);
        }
    });
    
    console.log('Static build completed!');
}

// Run the build
buildStatic();
