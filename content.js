let drawer = null;
let tasks = [];
let lastMouseX = 0;
let lastMouseY = 0;

function isZentaoPage() {
  const url = window.location.href;
  return url.includes('zentao.tigermed.net')
}

function createDrawer() {
  if (drawer) return;

  drawer = document.createElement('div');
  drawer.id = 'zentao-drawer';
  drawer.innerHTML = `
    <div class="drawer-header">
      <h3>禅道任务管理</h3>
      <button class="close-btn">&times;</button>
    </div>
    <div class="drawer-content">
      <div class="task-list" id="task-list"></div>
    </div>
  `;
  document.body.appendChild(drawer);

  drawer.querySelector('.close-btn').addEventListener('click', toggleDrawer);

  loadTasks();
  console.log('抽屉创建完成，任务列表:', tasks);
}

function toggleDrawer() {
  if (!drawer) {
    createDrawer();
  }
  drawer.classList.toggle('open');
}

function extractTaskData(element) {
  try {
    if (!element) return null;

    let targetElement = element;
    if (element.nodeType === Node.TEXT_NODE) {
      targetElement = element.parentElement;
    }

    if (!targetElement || typeof targetElement.closest !== 'function') {
      console.log('元素不支持 closest 方法:', targetElement);
      return null;
    }

    const tr = targetElement.closest('tr');
    if (!tr) return null;

    const id = tr.querySelector('td.c-id')?.textContent?.trim() || '';
    const project = tr.querySelector('td.c-name')?.textContent?.trim() || '';
    // 获取 a 标签的 href 属性值
    const aElement = tr.querySelector('td.c-name a');
    const href = aElement?.getAttribute('href') || '';
    const user = tr.querySelector('td.c-user')?.textContent?.trim() || '';

    if (!id) return null;

    return {
      id,
      project,
      href,
      user,
      sort: tasks.length + 1,
      system: '',
      status: '',
      env: ''
    };
  } catch (error) {
    console.error('extractTaskData 出错:', error);
    return null;
  }
}

function addTask(taskData) {
  console.log('尝试添加/更新任务:', taskData);
  console.log('当前任务列表:', tasks);

  const existingIndex = tasks.findIndex(t => t.id === taskData.id);
  console.log('查找重复任务，索引:', existingIndex);

  if (existingIndex !== -1) {
    console.log('任务ID已存在，更新不可变字段:', taskData.id);
    const existingTask = tasks[existingIndex];

    existingTask.project = taskData.project;
    existingTask.href = taskData.href;
    existingTask.user = taskData.user;

    console.log('更新后的任务:', existingTask);
    alert(`任务 ${taskData.id} 已存在，已更新项目、链接和负责人信息！`);
  } else {
    console.log('添加新任务到数组');
    tasks.push(taskData);
    console.log('添加后的任务列表:', tasks);
  }

  console.log('保存任务到localStorage');
  saveTasks();

  console.log('重新渲染任务列表');
  renderTasks();

  console.log('任务操作成功');
  return true;
}

function saveTasks() {
  console.log('保存任务到localStorage，任务数量:', tasks.length);
  try {
    localStorage.setItem('zentaoTasks', JSON.stringify(tasks));
    console.log('保存成功');
  } catch (error) {
    console.error('保存任务失败:', error);
  }
}

function loadTasks() {
  const savedTasks = localStorage.getItem('zentaoTasks');
  if (savedTasks) {
    try {
      tasks = JSON.parse(savedTasks);
      console.log('从 localStorage 加载任务:', tasks);
    } catch (e) {
      console.error('加载任务数据失败:', e);
      tasks = [];
    }
  } else {
    console.log('localStorage 中没有任务数据');
    tasks = [];
  }
  renderTasks();
}

function renderTasks() {
  const taskList = document.getElementById('task-list');
  if (!taskList) {
    console.log('task-list 元素不存在');
    return;
  }

  const sortedTasks = [...tasks].sort((a, b) => a.sort - b.sort);
  console.log('渲染任务列表，任务数量:', sortedTasks.length);
  console.log('排序后的任务:', sortedTasks);

  if (sortedTasks.length === 0) {
    taskList.innerHTML = '<div class="empty-state">暂无任务，请添加任务</div>';
    console.log('显示空状态');
    return;
  }

  taskList.innerHTML = sortedTasks.map((task, index) => `
    <div class="task-item ${task.status === '挂起' ? 'pending' : task.status === '进行中' ? 'ongoing' : 'done'}" data-id="${task.id}" draggable="true">
      <div class="task-drag-handle" style="width: 48px;">⋮⋮ ${index + 1}</div>
      <div class="task-content">
        <div class="task-info">
          <div class="task-id">ID: ${task.id}</div>
          <div class="task-project">
            <a href="${task.href}" target="_blank" style="color: ${task.href ? '#007bff' : 'inherit'};">${task.project}</a>
          </div>
          <div class="task-user">产品: ${task.user}</div>
        </div>
        <div class="task-fields">
          <div class="field-group-container">
            <div class="field-group">
              <label>系统:</label>
              <select class="field-system" data-id="${task.id}">
                <option value="">请选择</option>
                <option value="CCMS" ${task.system === 'CCMS' ? 'selected' : ''}>CCMS</option>
                <option value="BDS" ${task.system === 'BDS' ? 'selected' : ''}>BDS</option>
                <option value="VISITRACK" ${task.system === 'VISITRACK' ? 'selected' : ''}>VISITRACK</option>
                <option value="HIM" ${task.system === 'HIM' ? 'selected' : ''}>HIM</option>
                <option value="SPAS" ${task.system === 'SPAS' ? 'selected' : ''}>SPAS</option>
              </select>
            </div>
            <div class="field-group">
              <label>状态:</label>
              <select class="field-status" data-id="${task.id}">
                <option value="">请选择</option>
                <option value="挂起" ${task.status === '挂起' ? 'selected' : ''}>挂起</option>
                <option value="进行中" ${task.status === '进行中' ? 'selected' : ''}>进行中</option>
                <option value="已完成" ${task.status === '已完成' ? 'selected' : ''}>已完成</option>
              </select>
            </div>
            <div class="field-group">
              <label>环境:</label>
              <select class="field-env" data-id="${task.id}">
                <option value="">请选择</option>
                <option value="test" ${task.env === 'test' ? 'selected' : ''}>test</option>
                <option value="uat" ${task.env === 'uat' ? 'selected' : ''}>uat</option>
                <option value="prod" ${task.env === 'prod' ? 'selected' : ''}>prod</option>
              </select>
            </div>
          </div>
          <button class="delete-btn" data-id="${task.id}">&times;</button>
        </div>
      </div>
    </div>
  `).join('');

  console.log('渲染完成，HTML长度:', taskList.innerHTML.length);
  attachTaskEventListeners();
}

function attachTaskEventListeners() {
  document.querySelectorAll('.field-system').forEach(select => {
    select.addEventListener('change', (e) => {
      const taskId = e.target.dataset.id;
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.system = e.target.value;
        saveTasks();
        renderTasks();
      }
    });
  });

  document.querySelectorAll('.field-status').forEach(select => {
    select.addEventListener('change', (e) => {
      const taskId = e.target.dataset.id;
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.status = e.target.value;
        saveTasks();
        renderTasks();
      }
    });
  });

  document.querySelectorAll('.field-env').forEach(select => {
    select.addEventListener('change', (e) => {
      const taskId = e.target.dataset.id;
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.env = e.target.value;
        saveTasks();
        renderTasks();
      }
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = e.target.dataset.id;
      tasks = tasks.filter(t => t.id !== taskId);
      saveTasks();
      renderTasks();
    });
  });

  const taskItems = document.querySelectorAll('.task-item');
  taskItems.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
  });
}

let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDrop(e) {
  e.stopPropagation();
  if (draggedItem !== this) {
    const draggedId = draggedItem.dataset.id;
    const targetId = this.dataset.id;

    const draggedIndex = tasks.findIndex(t => t.id === draggedId);
    const targetIndex = tasks.findIndex(t => t.id === targetId);

    const [removed] = tasks.splice(draggedIndex, 1);
    tasks.splice(targetIndex, 0, removed);

    tasks.forEach((task, index) => {
      task.sort = index + 1;
    });

    saveTasks();
    renderTasks();
  }
  return false;
}

function handleDragEnd() {
  this.classList.remove('dragging');
}

function showAddTaskModal() {
  const modal = document.createElement('div');
  modal.className = 'task-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>手动添加任务</h3>
      <div class="form-group">
        <label>任务ID:</label>
        <input type="text" id="manual-task-id" placeholder="请输入任务ID">
      </div>
      <div class="form-group">
        <label>项目名称:</label>
        <input type="text" id="manual-task-project" placeholder="请输入项目名称">
      </div>
      <div class="form-group">
        <label>负责人:</label>
        <input type="text" id="manual-task-user" placeholder="请输入负责人">
      </div>
      <div class="modal-buttons">
        <button class="cancel-btn">取消</button>
        <button class="confirm-btn">确认</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('.cancel-btn').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('.confirm-btn').addEventListener('click', () => {
    const id = document.getElementById('manual-task-id').value.trim();
    const project = document.getElementById('manual-task-project').value.trim();
    const user = document.getElementById('manual-task-user').value.trim();

    if (!id) {
      alert('请输入任务ID');
      return;
    }

    const taskData = {
      id,
      project,
      user,
      sort: tasks.length + 1,
      system: '',
      status: '',
      env: ''
    };

    if (addTask(taskData)) {
      modal.remove();
    }
  });
}

function addAllTasks() {
  try {
    const taskTable = document.querySelector('table');
    if (!taskTable) {
      alert('未找到任务表格');
      return;
    }

    const rows = taskTable.querySelectorAll('tbody tr');
    console.log('找到任务行数:', rows.length);

    let addedCount = 0;
    let skippedCount = 0;
    const importedTaskIds = [];

    for (const row of rows) {
      const idCell = row.querySelector('td.c-id');
      const projectCell = row.querySelector('td.c-name');
      const aElement = row.querySelector('td.c-name a');
      const userCell = row.querySelector('td.c-user');

      const id = idCell?.textContent?.trim() || '';
      const project = projectCell?.textContent?.trim() || '';
      const href = aElement?.getAttribute('href') || '';
      const user = userCell?.textContent?.trim() || '';

      if (id) {
        importedTaskIds.push(id);
        const existingIndex = tasks.findIndex(t => t.id === id);
        if (existingIndex === -1) {
          const taskData = {
            id,
            project,
            href,
            user,
            sort: tasks.length + 1,
            system: '',
            status: '挂起',
            env: ''
          };
          tasks.push(taskData);
          addedCount++;
        } else {
          const existingTask = tasks[existingIndex];
          existingTask.project = project;
          existingTask.href = href;
          existingTask.user = user;
          skippedCount++;
        }
      }
    }

    let deletedCount = 0;
    const tasksToDelete = tasks.filter(t => !importedTaskIds.includes(t.id));
    if (tasksToDelete.length > 0) {
      tasksToDelete.forEach(taskToDelete => {
        const deleteIndex = tasks.findIndex(t => t.id === taskToDelete.id);
        if (deleteIndex !== -1) {
          tasks.splice(deleteIndex, 1);
          deletedCount++;
        }
      });
      console.log(`删除了 ${deletedCount} 个不在导入列表中的任务`);
    }

    if (addedCount > 0 || deletedCount > 0) {
      saveTasks();
      renderTasks();
      let message = '';
      if (addedCount > 0) {
        message += `成功添加 ${addedCount} 个任务`;
      }
      if (skippedCount > 0) {
        message += `，更新 ${skippedCount} 个已存在的任务`;
      }
      if (deletedCount > 0) {
        message += `，删除 ${deletedCount} 个不在导入列表中的任务`;
      }
      alert(message);
    } else if (skippedCount > 0) {
      saveTasks();
      renderTasks();
      alert(`所有 ${skippedCount} 个任务都已存在`);
    } else {
      alert('未找到可添加的任务');
    }
  } catch (error) {
    console.error('添加全部任务时出错:', error);
    alert('添加任务失败，请查看控制台了解详情');
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "addToDrawer") {
    const selection = window.getSelection();
    let taskData = null;

    if (selection.rangeCount > 0 && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      taskData = extractTaskData(range.commonAncestorContainer);
      console.log('从选中文本提取任务:', taskData);
    } else {
      taskData = extractTaskDataFromMousePosition();
      console.log('从鼠标位置提取任务:', taskData, '鼠标位置:', lastMouseX, lastMouseY);
    }

    if (taskData) {
      console.log('提取到的任务ID:', taskData.id);
      console.log('当前任务列表:', tasks.map(t => t.id));

      if (!drawer) {
        createDrawer();
      }
      drawer.classList.add('open');
      if (addTask(taskData)) {
        console.log('任务添加成功:', taskData);
      }
    } else {
      alert('无法识别任务数据，请确保选中了任务行或在任务行上右键点击');
    }
  }

  if (request.action === "toggleDrawer") {
    toggleDrawer();
  }

  if (request.action === "getStats") {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === '进行中').length;
    const completed = tasks.filter(t => t.status === '已完成').length;
    sendResponse({
      total,
      inProgress,
      completed
    });
    return true;
  }

  if (request.action === "addAllToDrawer") {
    if (!drawer) {
      createDrawer();
    }
    drawer.classList.add('open');
    addAllTasks();
  }
});

document.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

// 监听 click 事件，判断是否点击了提交按钮
// document.addEventListener('click', (e) => {
//   // 页面点击事件，检查是否有完成 dialog
//   monitorIframeSubmit();
// })
function monitorIframeSubmit() {
  const iframe = document.getElementById('iframe-triggerModal');
  if (!iframe) {
    console.log('未找到 iframe-triggerModal iframe');
    return;
  }

  const checkIframeLoaded = setInterval(() => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc && iframeDoc.readyState === 'complete') {
        clearInterval(checkIframeLoaded);
        console.log('iframe 已加载完成');

        const submitBtn = iframeDoc.getElementById('submit');
        if (submitBtn) {
          submitBtn.addEventListener('click', () => {
            console.log('检测到 iframe 内的提交按钮点击');

            const labelId = iframeDoc.querySelector('span.label-id');
            const taskId = labelId?.textContent?.trim();

            if (taskId) {
              console.log('提取到任务ID:', taskId);
              const taskIndex = tasks.findIndex(t => t.id === taskId);
              if (taskIndex !== -1) {
                tasks.splice(taskIndex, 1);
                saveTasks();
                renderTasks();
                console.log('已自动删除抽屉中的任务:', taskId);
                alert(`任务 ${taskId} 已从抽屉中自动移除`);
              }
            }
          });
        } else {
          console.log('iframe 内未找到 submit 按钮');
        }
      }
    } catch (error) {
      console.log('iframe 尚未加载完成，等待中...');
    }
  }, 500);

  setTimeout(() => {
    clearInterval(checkIframeLoaded);
    console.log('iframe 加载检测超时');
  }, 10000);
}

function extractTaskDataFromMousePosition() {
  try {
    const taskTable = document.querySelector('table');
    if (!taskTable) {
      console.log('未找到任务表格');
      return null;
    }

    const rows = taskTable.querySelectorAll('tbody tr');
    console.log('找到任务行数:', rows.length);

    for (const row of rows) {
      const rect = row.getBoundingClientRect();
      if (lastMouseX >= rect.left && lastMouseX <= rect.right &&
          lastMouseY >= rect.top && lastMouseY <= rect.bottom) {

        console.log('找到鼠标位置对应的任务行');

        const idCell = row.querySelector('td.c-id');
        const projectCell = row.querySelector('td.c-name');
        const userCell = row.querySelector('td.c-user');

        console.log('ID单元格:', idCell);
        console.log('项目单元格:', projectCell);
        console.log('用户单元格:', userCell);

        const id = idCell?.textContent?.trim() || '';
        const project = projectCell?.textContent?.trim() || '';
        const user = userCell?.textContent?.trim() || '';

        console.log('提取的数据:', { id, project, user });

        if (id) {
          return {
            id,
            project,
            user,
            sort: tasks.length + 1,
            system: '',
            status: '挂起',
            env: ''
          };
        }
      }
    }

    console.log('未找到鼠标位置对应的任务');
    return null;
  } catch (error) {
    console.error('提取任务数据时出错:', error);
    return null;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

function initExtension() {
  if (isZentaoPage()) {
    const drawerButton = document.createElement('button');
    drawerButton.id = 'zentao-drawer-btn';
    drawerButton.innerHTML = '📋 任务抽屉';
    drawerButton.addEventListener('click', toggleDrawer);
    document.body.appendChild(drawerButton);
    console.log('扩展初始化完成');

    // monitorIframeSubmit();
  }
}