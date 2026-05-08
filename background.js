chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-to-drawer",
    title: "添加到抽屉",
    contexts: ["selection", "link", "image", "page"]
  });

  chrome.contextMenus.create({
    id: "add-all-to-drawer",
    title: "添加全部任务到抽屉",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-to-drawer") {
    chrome.tabs.sendMessage(tab.id, {
      action: "addToDrawer",
      selectedText: info.selectionText || "",
      context: info.contextMenuType
    });
  }

  if (info.menuItemId === "add-all-to-drawer") {
    chrome.tabs.sendMessage(tab.id, {
      action: "addAllToDrawer"
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTasks") {
    chrome.storage.local.get(["tasks"], (result) => {
      sendResponse(result.tasks || []);
    });
    return true;
  }

  if (request.action === "saveTasks") {
    chrome.storage.local.set({ tasks: request.tasks }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "toggleDrawer") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleDrawer"
      });
    });
  }
});