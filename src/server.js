import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import appRoutes from './routes/appRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Public folder path — use cwd instead of __dirname (for proot compatibility)
const publicPath = path.resolve(process.cwd(), 'public');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(publicPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DTAhub Website', version: '1.0.0' });
});

app.use('/api/apps', appRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DTAhub Website running on port ${PORT}`);
  console.log(`   Public: ${publicPath}`);
});
