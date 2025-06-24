const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));