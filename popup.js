document.addEventListener('DOMContentLoaded', () => {
  const openDrawerBtn = document.getElementById('open-drawer');

  openDrawerBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleDrawer"
      });
      window.close();
    });
  });

  loadStats();
});

function loadStats() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "getStats"
      }, (response) => {
        if (response) {
          document.getElementById('total-tasks').textContent = response.total || 0;
          document.getElementById('in-progress').textContent = response.inProgress || 0;
          document.getElementById('completed').textContent = response.completed || 0;
        }
      });
    }
  });
}