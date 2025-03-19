require('dotenv').config();
const express = require('express');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', uploadRoutes);
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});