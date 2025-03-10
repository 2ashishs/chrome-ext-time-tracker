chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get("taskLogs", (data) => {
        if (!data.taskLogs) {
            chrome.storage.local.set({ taskLogs: {} });
        }
    });
});
chrome.action.onClicked.addListener(() => {
    const extensionUrl = chrome.runtime.getURL("time_tracker.html");

    chrome.tabs.query({}, (tabs) => {
        const existingTab = tabs.find(tab => tab.url === extensionUrl);
        if (existingTab) {
            chrome.tabs.update(existingTab.id, { active: true });
        } else {
            chrome.tabs.create({ url: extensionUrl });
        }
    });
});
