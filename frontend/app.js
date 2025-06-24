let currentProjectId = null;
let currentTaskId = null;

async function fetchProjects() {
  const res = await fetch('http://localhost:5000/api/projects');
  const data = await res.json();
  const container = document.getElementById('project-list');
  container.innerHTML = '';
  data.forEach(project => {
    const div = document.createElement('div');
    div.innerHTML = `
        <h3>
            <span onclick="openProjectModal(${project.id}, '${project.name}', \`${project.description || ''}\`)"
                style="cursor:pointer; text-decoration:underline; color:blue;">
            ${project.name}
            </span>
            <button onclick="openTaskModal(${project.id})"
                    style="margin-left:10px; font-weight:bold; cursor:pointer;">
            +
            </button>
        </h3>
        <p>Status: ${project.status} | Progress: ${project.progress}%</p>
        <div id="task-container-${project.id}"></div>
    `;
    container.appendChild(div);
    showTasks(project.id);
  });
}

async function showTasks(projectId) {
  const res = await fetch(`http://localhost:5000/api/tasks/${projectId}`);
  const tasks = await res.json();
  const taskContainer = document.getElementById(`task-container-${projectId}`);
  taskContainer.innerHTML = '';
  taskContainer.innerHTML = '<ul>' + tasks.map(t => `
    <li>
    <span onclick="openTaskEditModal(${t.id}, '${t.title}', ${t.weight}, ${t.project_id}, '${t.status}')"
            style="cursor:pointer; text-decoration:underline; color:green;">
        ${t.title} (bobot ${t.weight})
    </span>
    </li>`).join('') + '</ul>';
}

function openProjectModal(id = null, name = '', desc = '') {
  currentProjectId = id;
  document.getElementById('projectName').value = name;
  document.getElementById('projectDesc').value = desc;

  const deleteBtn = document.getElementById('deleteProjectBtn');
  if (id) {
    deleteBtn.classList.remove('hidden'); // tampilkan delete
  } else {
    deleteBtn.classList.add('hidden'); // sembunyikan saat tambah
  }

  showModal('projectModal');
}

function openTaskModal(projectId) {
  currentProjectId = projectId;
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskWeight').value = '';
    document.getElementById('taskStatus').value = 'draft';
  document.getElementById('taskStatus').classList.add('hidden');
    document.getElementById('deleteTaskBtn').classList.add('hidden');
  showModal('taskModal');
}

document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('projectName').value;
  const description = document.getElementById('projectDesc').value;

  const method = currentProjectId ? 'PUT' : 'POST';
  const url = currentProjectId ? `http://localhost:5000/api/projects/${currentProjectId}` : `http://localhost:5000/api/projects`;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description })
  });

  document.getElementById('projectModal').style.display = 'none';
  fetchProjects();
});

document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value;
  const weight = document.getElementById('taskWeight').value;
  const status = currentTaskId
  ? document.getElementById('taskStatus').value
  : 'draft';

  const method = currentTaskId ? 'PUT' : 'POST';
  const url = currentTaskId
    ? `http://localhost:5000/api/tasks/${currentTaskId}`
    : `http://localhost:5000/api/tasks/${currentProjectId}`;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, weight, status })
  });

  currentTaskId = null;
  hideModal('taskModal');
  fetchProjects();
});

document.getElementById('closeProjectModal').onclick = () => {
  hideModal('projectModal');
};

document.getElementById('closeTaskModal').onclick = () => {
  hideModal('taskModal');
};

function showModal(id) {
  document.getElementById(id).style.display = 'block';
  document.body.classList.add('modal-open');
}

function hideModal(id) {
  document.getElementById(id).style.display = 'none';
  document.body.classList.remove('modal-open');
}

function openTaskEditModal(id, title, weight, projectId, status = 'draft') {
  currentTaskId = id;
  currentProjectId = projectId;
  document.getElementById('taskTitle').value = title;
  document.getElementById('taskWeight').value = weight;
  document.getElementById('taskStatus').value = status;
  document.getElementById('taskStatus').classList.remove('hidden');
    document.getElementById('deleteTaskBtn').classList.remove('hidden');
  showModal('taskModal');
}

document.getElementById('deleteTaskBtn').addEventListener('click', async () => {
  if (confirm('Yakin ingin menghapus task ini?')) {
    await fetch(`http://localhost:5000/api/tasks/${currentTaskId}`, {
      method: 'DELETE'
    });

    currentTaskId = null;
    hideModal('taskModal');
    showTasks(currentProjectId);
    fetchProjects();
    location.href = location.href;
  }
});

document.getElementById('deleteProjectBtn').addEventListener('click', async () => {
  if (confirm('Yakin ingin menghapus project ini beserta semua task-nya?')) {
    await fetch(`http://localhost:5000/api/projects/${currentProjectId}`, {
      method: 'DELETE'
    });
    location.href = location.href;
  }
});

fetchProjects();