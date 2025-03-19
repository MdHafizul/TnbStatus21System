module.exports = (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    if (
      req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
      req.file.mimetype !== 'application/vnd.ms-excel'
    ) {
      return res.status(400).json({ error: 'Invalid file type. Only Excel files are allowed.' });
    }
    next();
  };