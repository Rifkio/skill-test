const express = require('express');
const router = express.Router();
const fs = require('fs');
const tasks = require('../data/tasks.json');
const projects = require('../data/projects.json');

router.get('/', (req, res) => {
  const enrichedProjects = projects.map(project => {
    const taskList = tasks.filter(t => t.project_id === project.id);
    const totalWeight = taskList.reduce((sum, t) => sum + t.weight, 0);
    const doneWeight = taskList.filter(t => t.is_done).reduce((sum, t) => sum + t.weight, 0);
    const progress = totalWeight === 0 ? 0 : Math.round((doneWeight / totalWeight) * 100);
    let status = 'draft';
    if (taskList.length > 0) {
        if (taskList.every(t => t.status === 'done')) {
            status = 'done';
        } else if (taskList.every(t => t.status === 'draft')) {
            status = 'draft';
        } else {
            status = 'in_progress';
        }
    }
    return { ...project, progress, status };
  });
  res.json(enrichedProjects);
});

router.post('/', (req, res) => {
  const fs = require('fs');
  const projects = require('../data/projects.json');
  const { name, description } = req.body;
  const newProject = {
    id: Date.now(),
    name,
    description,
  };
  projects.push(newProject);
  fs.writeFileSync(__dirname + '/../data/projects.json', JSON.stringify(projects, null, 2));
  res.json(newProject);
});

router.put('/:id', (req, res) => {
  const fs = require('fs');
  const projects = require('../data/projects.json');
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).send('Project not found');

  const { name, description } = req.body;
  project.name = name;
  project.description = description;

  fs.writeFileSync(__dirname + '/../data/projects.json', JSON.stringify(projects, null, 2));
  res.json(project);
});

router.delete('/:id', (req, res) => {
  const fs = require('fs');
  const path = require('path');

  const projectPath = path.join(__dirname, '../data/projects.json');
  const taskPath = path.join(__dirname, '../data/tasks.json');

  let projects = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));
  let tasks = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));

  const id = parseInt(req.params.id);
  const project = projects.find(p => p.id === id);
  if (!project) return res.status(404).send('Project not found');

  projects = projects.filter(p => p.id !== id);
  fs.writeFileSync(projectPath, JSON.stringify(projects, null, 2));

  tasks = tasks.filter(t => t.project_id !== id);
  fs.writeFileSync(taskPath, JSON.stringify(tasks, null, 2));

  res.sendStatus(204);
});

module.exports = router;