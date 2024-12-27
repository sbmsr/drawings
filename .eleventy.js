const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
    eleventyConfig.addCollection("drawings", function(collectionApi) {
        let drawings = collectionApi.getAll().filter(item => item.inputPath.includes('/drawings/'));
        
        // Map the drawings to include dates from data files
        drawings = drawings.map(item => {
            const dirName = path.basename(path.dirname(item.inputPath));
            const dataPath = path.join(__dirname, 'src', '_data', `${dirName}.json`);
            
            if (fs.existsSync(dataPath)) {
                const metadata = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                item.date = new Date(metadata.date);
            }
            return item;
        });

        // Sort drawings by date in descending order (newest first)
        drawings.sort((a, b) => b.date - a.date);
        return drawings;
    });

    eleventyConfig.addFilter("formatDate", function(date) {
        // Format the date as needed, e.g., YYYY-MM-DD
        return new Date(date).toISOString().split('T')[0];
    });

    // Add the metadata generation to the beforeBuild event
    eleventyConfig.on('beforeBuild', () => {
        // Skip metadata generation in watch/serve mode
        if (process.argv.includes('--serve')) {
            return;
        }

        const drawingsDir = path.join(__dirname, 'src', 'drawings');
        const dataDir = path.join(__dirname, 'src', '_data');

        const directories = fs.readdirSync(drawingsDir)
            .filter(item => !item.startsWith('.')) // Skip .DS_Store
            .filter(item => fs.statSync(path.join(drawingsDir, item)).isDirectory());

        directories.forEach(dir => {
            const indexPath = path.join(drawingsDir, dir, 'index.html');
            
            if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath, 'utf8');
                const dateMatch = content.match(/data-date="([^"]+)"/);

                if (dateMatch) {
                    const date = dateMatch[1];
                    const jsonFilePath = path.join(dataDir, `${dir}.json`);
                    const metadata = { date };

                    fs.writeFileSync(jsonFilePath, JSON.stringify(metadata, null, 2));
                    console.log(`Generated metadata for ${dir}: ${jsonFilePath}`);
                } else {
                    console.log(`No date found in ${indexPath}`);
                }
            }
        });
    });

    return {
        dir: {
            input: "src",
            output: "_site"
        }
    };
}; 
