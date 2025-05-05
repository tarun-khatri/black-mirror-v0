import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import socialMediaRouter from './routes/socialMedia';
import cacheRouter from './routes/cache';
import directRouter from './api/direct';
import { connectToDatabase, closeDatabaseConnection } from './config/database';

// Load environment variables
dotenv.config();

// Set development mode if not specified
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
  console.log('NODE_ENV not set, defaulting to development mode');
}

// Set default values for required environment variables in development
if (process.env.NODE_ENV === 'development') {
  if (!process.env.RAPIDAPI_KEY) {
    console.log('RAPIDAPI_KEY not set, using mock data');
  }
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI not set, using mock data');
  }
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/social-media', socialMediaRouter);
app.use('/api/cache', cacheRouter);
app.use('/api/direct', directRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    hasApiKey: !!process.env.RAPIDAPI_KEY,
    hasDbConnection: !!process.env.MONGODB_URI
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Only connect to database if MONGODB_URI is set
    if (process.env.MONGODB_URI) {
      console.log('Connecting to database...');
      await connectToDatabase();
      console.log('Database connected successfully');
    } else {
      console.log('MONGODB_URI not set, running without database connection');
    }
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port} in ${process.env.NODE_ENV} mode`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received. Closing HTTP server and MongoDB connection...');
      if (process.env.MONGODB_URI) {
        await closeDatabaseConnection();
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 