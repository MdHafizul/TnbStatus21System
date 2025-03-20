const fs = require('fs');
const fileProcessor = require('../services/fileProcessor');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); 
// DESC: Upload the file and convert it to JSON
// ACCESS: Public
// ENDPOINT: /api/upload
// METHOD: POST
// REQUEST: File
// RESPONSE: JSON
exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        console.time('File Processing Time');

        const result = await fileProcessor.uploadFile(req.file.path);

        // Remove the uploaded file after processing
        await fs.promises.unlink(req.file.path);

        // Store the result in a global variable or database
        global.uploadedData = result;

        console.timeEnd('File Processing Time');

        res.json(result);
    } catch (error) {
        res.status(500).send(`Error processing file: ${error.message}`);
    }
};

//DESC: Retrieve the day and category
//ACCESS: Public
//ENDPOINT: /api/daysandcategory
//METHOD: GET
//RESPONSE: JSON
exports.daysAndCategory = (req, res) => {
    try {
        if(!global.uploadedData){
            return res.status(400).send('No data available.');
        }

        const data = global.uploadedData.Sheet1;
        const daysProcessedAndCategory = fileProcessor.calculateNumOfDaysAndCategory(data); 
        
        res.json({
            daysProcessedAndCategory
        })

    }catch(error){
        res.status(500).send(`Error processing file: ${error.message}`);
    }
}

// DESC: Process the uploaded data (calculate days, sort by category, sort by area)
// ACCESS: Public
// ENDPOINT: /api/process-file
// METHOD: GET
// RESPONSE: JSON
exports.processFile = (req, res) => {
    try {
        if (!global.uploadedData) {
            return res.status(400).send('No data available.');
        }

        // Check if the result is already cached
        const cachedResult = cache.get('processedData');
        if (cachedResult) {
            return res.json(cachedResult);
        }

        const data = global.uploadedData.Sheet1;

        const daysProcessedAndCategory = fileProcessor.calculateNumOfDaysAndCategory(data);
        const areaSorted = fileProcessor.sortByBusinessArea(daysProcessedAndCategory);

        const result = {
            daysProcessedAndCategory,
            BACount: areaSorted
        };

        // Cache the result
        cache.set('processedData', result);

        res.json(result);
    } catch (error) {
        res.status(500).send(`Error processing file: ${error.message}`);
    }
};
