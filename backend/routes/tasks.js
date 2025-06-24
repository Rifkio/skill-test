const express = require('express');
const router = express.Router();
let tasks = require('../data/tasks.json');
const fs = require('fs');

// Get tasks by project
router.get('/:project_id', (req, res) => {
  const project_id = parseInt(req.params.project_id);
  const filtered = tasks.filter(t => t.project_id === project_id);
  res.json(filtered);
});

// Add task
router.post('/:project_id', (req, res) => {
  const { title, weight, status } = req.body;
  const newTask = {
    id: Date.now(),
    project_id: parseInt(req.params.project_id),
    title,
    weight: parseInt(weight),
    is_done: false,
    status: status || 'draft',
  };
  tasks.push(newTask);
  fs.writeFileSync(__dirname + '/../data/tasks.json', JSON.stringify(tasks, null, 2));
  res.json(newTask);
});

// Update task
router.put('/:id', (req, res) => {
  const fs = require('fs');
  const tasks = require('../data/tasks.json');
  const projects = require('../data/projects.json');

  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).send('Task not found');

  const { title, weight, status } = req.body;

  if (title !== undefined) task.title = title;
  if (weight !== undefined) task.weight = parseInt(weight);
  if (status !== undefined) {
    task.status = status;
    task.is_done = (status === 'done');
  }

  fs.writeFileSync(__dirname + '/../data/tasks.json', JSON.stringify(tasks, null, 2));

  const projectTasks = tasks.filter(t => t.project_id === task.project_id);
  const totalWeight = projectTasks.reduce((sum, t) => sum + t.weight, 0);
  const doneWeight = projectTasks
    .filter(t => t.status === 'done')
    .reduce((sum, t) => sum + t.weight, 0);

  const project = projects.find(p => p.id === task.project_id);
  if (project) {
    project.progress = totalWeight === 0 ? 0 : Math.round((doneWeight / totalWeight) * 100);


    if (projectTasks.every(t => t.status === 'done')) {
      project.status = 'done';
    } else if (projectTasks.every(t => t.status === 'draft')) {
      project.status = 'draft';
    } else {
      project.status = 'in_progress';
    }

    fs.writeFileSync(__dirname + '/../data/projects.json', JSON.stringify(projects, null, 2));
  }

  res.json(task);
});

router.delete('/:id', (req, res) => {
  const fs = require('fs');
  const taskPath = __dirname + '/../data/tasks.json';
  const projectPath = __dirname + '/../data/projects.json';

  let tasks = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));
  let projects = JSON.parse(fs.readFileSync(projectPath, 'utf-8'));

  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).send('Task not found');

  tasks = tasks.filter(t => t.id !== id);
  fs.writeFileSync(taskPath, JSON.stringify(tasks, null, 2));

  const project = projects.find(p => p.id === task.project_id);
  if (project) {
    const projectTasks = tasks.filter(t => t.project_id === task.project_id);
    const totalWeight = projectTasks.reduce((sum, t) => sum + t.weight, 0);
    const doneWeight = projectTasks.filter(t => t.status === 'done').reduce((sum, t) => sum + t.weight, 0);

    project.progress = totalWeight === 0 ? 0 : Math.round((doneWeight / totalWeight) * 100);
    if (projectTasks.length === 0) {
      project.status = 'draft';
    } else if (projectTasks.every(t => t.status === 'done')) {
      project.status = 'done';
    } else if (projectTasks.every(t => t.status === 'draft')) {
      project.status = 'draft';
    } else {
      project.status = 'in_progress';
    }

    fs.writeFileSync(projectPath, JSON.stringify(projects, null, 2));
  }

  res.sendStatus(204);
});

module.exports = router;