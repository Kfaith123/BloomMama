require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/pregnancy', require('./routes/pregnancy'));
app.use('/api/health',    require('./routes/health'));
app.use('/api/kicks',     require('./routes/kicks'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/chat',      require('./routes/chat'));

// Health check
app.get('/api/ping', (_, res) => res.json({ status: 'BloomMama API running' }));

// 404 fallback
app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`BloomMama API running on port ${PORT}`));
