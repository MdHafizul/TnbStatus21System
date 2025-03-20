const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

// Function to upload and process the file
exports.uploadFile = async (filePath) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const readStream = fs.createReadStream(filePath);
        readStream.on('data', chunk => chunks.push(chunk));
        readStream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const result = excelToJson({
                source: buffer,
                header: {
                    rows: 1
                },
                columnToKey: {
                    '*': '{{columnHeader}}'
                }
            });
            resolve(result);
        });
        readStream.on('error', reject);
    });
};

// Generic function to calculate the number of days and categorize data
exports.calculateDaysAndCategory = (data, dateColumn, type) => {
    const today = new Date();

    return data.map(row => {
        const dateStr = row[dateColumn];
        const businessArea = row['Business Area'];
        let category = null;

        if (!businessArea) {
            return null; // Skip rows without a business area
        }

        if (type === 'disconnected' || type === 'revisit') {
            if (!dateStr) {
                return null; // Skip rows without a date
            }

            const [day, month, year] = dateStr.split('.').map(Number);
            const parsedDate = new Date(year, month - 1, day);

            if (isNaN(parsedDate)) {
                return null; // Skip rows with invalid dates
            }

            const timeDifference = today - parsedDate;
            const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

            // Categorize based on days difference
            if (daysDifference <= 30) {
                category = '0-1Months';
            } else if (daysDifference <= 90) {
                category = '<3Months';
            } else if (daysDifference <= 180) {
                category = '<6Months';
            } else if (daysDifference <= 365) {
                category = '<12Months';
            } else if (daysDifference <= 730) {
                category = '<2Years';
            } else {
                category = '>2Years';
            }

            return {
                daysSince: daysDifference,
                category,
                BusinessArea: String(businessArea)
            };
        } else if (type === 'belumrevisit') {
            // For belumrevisit, this will be calculated in the controller
            return {
                category: 'Belum Revisit',
                BusinessArea: String(businessArea)
            };
        }

        return null; // Default case
    }).filter(row => row !== null); // Filter out null rows
};
// Function to sort data by Business Area
exports.sortByBusinessArea = (data) => {
    const categories = ['0-1Months', '<3Months', '<6Months', '<12Months', '<2Years', '>2Years'];
    const BACount = {};

    // Initialize the structure for each business area
    data.forEach(row => {
        const businessArea = String(row['BusinessArea']);
        const category = row['category'];


        if (!businessArea || !category) return;

        if (!BACount[businessArea]) {
            BACount[businessArea] = { total: 0 };
            categories.forEach(cat => (BACount[businessArea][cat] = 0));
        }

        // Increment the total and the specific category count
        BACount[businessArea].total++;
        BACount[businessArea][category]++;

    });

    return BACount;
};



