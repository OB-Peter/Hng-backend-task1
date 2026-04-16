import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profiles.route.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Profile Classification API is running',
  });
});

app.use('/api/profiles', profileRoutes);

// ── Error Handling ─────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;