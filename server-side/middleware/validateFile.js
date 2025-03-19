const allowedMimeTypes = process.env.ALLOWED_MIME_TYPES || [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
];

module.exports = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.', code: 'NO_FILE' });
    }
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type. Only Excel files are allowed.', code: 'INVALID_FILE_TYPE' });
    }
    next();
};