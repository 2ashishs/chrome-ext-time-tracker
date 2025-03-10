let timer;
let seconds = 0;
let isRunning = false;
let selectedTask = "taskA";

document.getElementById("task-select").addEventListener("change", (e) => {
    selectedTask = e.target.value;
});

document.getElementById("start-btn").addEventListener("click", () => {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
    }
    document.getElementById("start-btn").disabled = true;
    document.getElementById("pause-btn").disabled = false;
    document.getElementById("stop-btn").disabled = false;
});

document.getElementById("pause-btn").addEventListener("click", () => {
    if (isRunning) {
        clearInterval(timer);
        isRunning = false;
        document.getElementById("pause-btn").textContent = "Resume";
    } else {
        isRunning = true;
        timer = setInterval(() => {
            seconds++;
            updateTimerDisplay();
        }, 1000);
        document.getElementById("pause-btn").textContent = "Pause";
    }
});

document.getElementById("stop-btn").addEventListener("click", () => {
    clearInterval(timer);
    isRunning = false;
    saveTimeLog(selectedTask, seconds);
    seconds = 0;
    updateTimerDisplay();
    document.getElementById("start-btn").disabled = false;
    document.getElementById("pause-btn").disabled = true;
    document.getElementById("stop-btn").disabled = true;
    document.getElementById("pause-btn").textContent = "Pause";
});

function updateTimerDisplay() {
    let hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    let mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    let secs = String(seconds % 60).padStart(2, "0");
    document.getElementById("timer").textContent = `${hrs}:${mins}:${secs}`;
}

function saveTimeLog(task, timeSpent) {
    chrome.storage.local.get("taskLogs", (data) => {
        let logs = data.taskLogs || {};
        logs[task] = (logs[task] || 0) + timeSpent;
        chrome.storage.local.set({ taskLogs: logs }, updateLogDisplay);
    });
}

function updateLogDisplay() {
    chrome.storage.local.get("taskLogs", (data) => {
        let logs = data.taskLogs || {};
        let logList = document.getElementById("log-list");
        logList.innerHTML = "";
        Object.keys(logs).forEach(task => {
            if (logs[task] > 0) {
                let li = document.createElement("li");
                li.textContent = `${task}: ${formatTime(logs[task])}`;
                logList.appendChild(li);
            }
        });
    });
}

document.getElementById("export-btn").addEventListener("click", () => {
    chrome.storage.local.get("taskLogs", (data) => {
        let logs = data.taskLogs || {};
        let csvContent = "Task,Time Spent\n";
        Object.keys(logs).forEach(task => {
            csvContent += `${task},${formatTime(logs[task])}\n`;
        });
        let blob = new Blob([csvContent], { type: "text/csv" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "time_log.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});

function formatTime(seconds) {
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
}

document.addEventListener("DOMContentLoaded", updateLogDisplay);
