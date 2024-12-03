const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
    eleventyConfig.addCollection("drawings", function(collectionApi) {
        let drawings = collectionApi.getAll().filter(item => item.inputPath.includes('/drawings/'));
        // Sort drawings by date in descending order (newest first)
        drawings.sort((a, b) => b.date - a.date);
        return drawings;
    });

    eleventyConfig.addFilter("formatDate", function(date) {
        // Format the date as needed, e.g., YYYY-MM-DD
        return new Date(date).toISOString().split('T')[0];
    });

    return {
        dir: {
            input: "src",
            output: "_site"
        }
    };
}; 
