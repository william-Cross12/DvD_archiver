import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import filmRoutes from './routes/filmRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import trailerRoutes from './routes/trailerRoutes.js';

dotenv.config();

// Create express app
const app = express();
app.use(express.json());

// Use cors
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/film', filmRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/trailer', trailerRoutes);

// Either use port set in the .env file, or the default 3000
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
