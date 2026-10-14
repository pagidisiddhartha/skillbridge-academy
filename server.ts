import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './server/routes/authRoutes.js';
import courseRoutes from './server/routes/courseRoutes.js';
import internshipRoutes from './server/routes/internshipRoutes.js';
import projectRoutes from './server/routes/projectRoutes.js';
import certificateRoutes from './server/routes/certificateRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request logger for API calls
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    });
  }
  next();
});

// Mount modular API routers
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin', adminRoutes);

// System health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SkillBridge Academy API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Vite middleware for development or static serving for production
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SkillBridge Academy server running on http://0.0.0.0:${PORT}`);
});
