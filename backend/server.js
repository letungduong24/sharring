const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-media')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app; 