const fs = require('fs');
const path = require('path');

// Function to convert EJS to HTML by removing EJS syntax
function convertEjsToHtml(ejsContent) {
    // Remove EJS includes and other server-side code
    let htmlContent = ejsContent
        .replace(/<%[^%]*%>/g, '') // Remove EJS tags
        .replace(/<%-[^%]*%>/g, '') // Remove EJS output tags
        .replace(/<%=.*?%>/g, '') // Remove EJS output tags
        .replace(/<%.*?%>/g, ''); // Remove any remaining EJS tags
    
    return htmlContent;
}

// Function to process a single EJS file
function processEjsFile(inputPath, outputPath) {
    try {
        const ejsContent = fs.readFileSync(inputPath, 'utf8');
        const htmlContent = convertEjsToHtml(ejsContent);
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, htmlContent);
        console.log(`Converted: ${inputPath} -> ${outputPath}`);
    } catch (error) {
        console.error(`Error processing ${inputPath}:`, error.message);
    }
}

// Main build process
function buildStatic() {
    console.log('Building static files for Netlify...');
    
    const viewsDir = path.join(__dirname, 'views');
    const publicDir = path.join(__dirname, 'public');
    
    // List of EJS files to convert
    const ejsFiles = [
        'index.ejs',
        'about.ejs',
        'partners.ejs',
        'gallery.ejs',
        'challenge.ejs'
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
