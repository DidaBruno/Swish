// file responsible for starting the server
// loads all the packages, routes and middleware

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import pageRoutes from './server/routes/pages.js';
import apiRoutes from './server/routes/api.js';

// __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('client'));

app.use('/', pageRoutes);
app.use('/api', apiRoutes);

app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Swish server running on port ${PORT}`));