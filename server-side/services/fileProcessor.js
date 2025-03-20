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

// Function to calculate the number of days between two dates
exports.calculateNumOfDaysAndCategory = (data) => {
    const today = new Date();
    return data.map(row => {
        const disconnectedDateStr = row['Disconnected Date'];
        if (!disconnectedDateStr) {
            return { ...row, daysSinceDisconnection: null };
        }

        const [day, month, year] = disconnectedDateStr.split('.').map(Number);
        const disconnectedDate = new Date(year, month - 1, day);

        if (isNaN(disconnectedDate)) {
            return { ...row, daysSinceDisconnection: null };
        }

        const timeDifference = today - disconnectedDate;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const businessArea = row['Business Area'];
        const categories = {
            '0-1Months': 0,
            '<3Months': 0,
            '<6Months': 0,
            '<12Months': 0,
            '<2Years': 0,
            '>2Years': 0
        };

        let category;
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

        categories[category]++;

        return {daysSinceDisconnection: daysDifference, category, BusinessArea: String(businessArea)};
    });
};

// Function to sort data by category
// exports.sortByCategory = (data) => {
//     const categories = {
//         '0-1Months': 0,
//         '<3Months': 0,
//         '<6Months': 0,
//         '<12Months': 0,
//         '<2Years': 0,
//         '>2Years': 0
//     };

//     const updatedRows = data.map(row => {
//         const daysSinceDisconnection = row['daysSinceDisconnection'];
//         if (!daysSinceDisconnection) {
//             return { ...row, category: null };
//         }

//         let category;
//         if (daysSinceDisconnection <= 30) {
//             category = '0-1Months';
//         } else if (daysSinceDisconnection <= 90) {
//             category = '<3Months';
//         } else if (daysSinceDisconnection <= 180) {
//             category = '<6Months';
//         } else if (daysSinceDisconnection <= 365) {
//             category = '<12Months';
//         } else if (daysSinceDisconnection <= 730) {
//             category = '<2Years';
//         } else {
//             category = '>2Years';
//         }

//         categories[category]++;
//         return { ...row, category };
//     });

//     return { updatedRows, categoryCounts: categories };
// };

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
