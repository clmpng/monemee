import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
dotenv.config();

// Routes
import authRoutes from './routes/auth.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import usersRoutes from './routes/users.routes.js';
import financialRoutes from './routes/financial.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import securityRoutes from './routes/security.routes.js';
import performanceRoutes from './routes/performance.routes.js';
import testsRoutes from './routes/tests.routes.js';
import rulesRoutes from './routes/rules.routes.js';
import leaderboardsRoutes from './routes/leaderboards.routes.js';
import securityCenterRoutes from './routes/security-center.routes.js';
import devtoolsRoutes from './routes/devtools.routes.js';
import businessIntelligenceRoutes from './routes/business-intelligence.routes.js';

// Middleware
import { errorHandler } from './middleware/error.js';
import { authenticateAdmin } from './middleware/auth.js';
import { dbMiddleware } from './middleware/database.js';

// Services
import { initializeWebSocket } from './services/websocket.service.js';

const app = express();
const PORT = process.env.PORT || 5001;
const WS_PORT = process.env.WS_PORT || 5002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(dbMiddleware); // DB Pool in allen Routes verfügbar

// Health Check (öffentlich)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mission-control-backend'
  });
});

// Auth Routes (öffentlich)
app.use('/api/auth', authRoutes);

// Admin Routes (geschützt)
app.use('/api/dashboard', authenticateAdmin, dashboardRoutes);
app.use('/api/users', authenticateAdmin, usersRoutes);
app.use('/api/financial', authenticateAdmin, financialRoutes);
app.use('/api/analytics', authenticateAdmin, analyticsRoutes);
app.use('/api/security', authenticateAdmin, securityRoutes);
app.use('/api/performance', authenticateAdmin, performanceRoutes);
app.use('/api/tests', authenticateAdmin, testsRoutes);
app.use('/api/rules', authenticateAdmin, rulesRoutes);
app.use('/api/leaderboards', authenticateAdmin, leaderboardsRoutes);
app.use('/api/security-center', authenticateAdmin, securityCenterRoutes);
app.use('/api/devtools', authenticateAdmin, devtoolsRoutes);
app.use('/api/bi', authenticateAdmin, businessIntelligenceRoutes);

// Error Handler
app.use(errorHandler);

// In Production: Serve Frontend Static Files
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  // SPA Fallback - alle nicht-API Routes zum Frontend
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// HTTP Server
const server = http.createServer(app);

// WebSocket Server (für Real-Time Updates)
const wss = new WebSocketServer({ port: WS_PORT });
initializeWebSocket(wss);

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Mission Control Backend running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server running on ws://localhost:${WS_PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
