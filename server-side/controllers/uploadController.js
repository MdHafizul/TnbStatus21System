const fs = require('fs');
const fileProcessor = require('../services/fileProcessor');

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

        const data = global.uploadedData.Sheet1;

        const daysProcessed = fileProcessor.calculateNumOfDays(data);
        const categorySorted = fileProcessor.sortByCategory(daysProcessed);
        const areaSorted = fileProcessor.sortByBusinessArea(categorySorted.updatedRows);

        res.json({
            daysProcessed,
            categoryCounts: categorySorted.categoryCounts,
            BACount: areaSorted
        });
    } catch (error) {
        res.status(500).send(`Error processing file: ${error.message}`);
    }
};