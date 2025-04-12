// Load the bell sound
const bell = new Audio("./sounds/bell.wav");

// Get time display
const minutesEl = document.querySelector(".minutes");
const secondsEl = document.querySelector(".seconds");

// Buttons
const btnStart = document.querySelector(".btn-start");
const btnPause = document.querySelector(".btn-pause");
const btnReset = document.querySelector(".btn-reset");
const btnShortBreak = document.querySelector(".short-break");
const btnDefault = document.querySelector(".default");
const btnLongBreak = document.querySelector(".long-break");
const btnCustom = document.querySelector(".custom");

// Modals
const timeUpModal = document.getElementById("timeUpModal");
const customModal = document.getElementById("customModal");
const todoModal = document.getElementById("todoModal");
const closeTimeUp = document.getElementsByClassName("close")[0];
const closeCustom = document.getElementsByClassName("close")[1];
const closeTodo = document.getElementsByClassName("close")[2];
const okBtn = document.getElementById("okBtn");
const saveCustomBtn = document.getElementById("saveCustom");

// Set default time (in minutes)
let defaultTime = 25;
let timeLeft = defaultTime * 60;
let timer;
let isRunning = false;
let shortBreakTime = 5;
let longBreakTime = 15;

document.addEventListener("DOMContentLoaded", () => {
    // Load settings and tasks from localStorage
    function loadFromLocalStorage() {
        const savedSettings = localStorage.getItem("pomodoroSettings");
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            defaultTime = settings.defaultTime || 25;
            shortBreakTime = settings.shortBreakTime || 5;
            longBreakTime = settings.longBreakTime || 15;
            timeLeft = settings.timeLeft || defaultTime * 60;
            isRunning = settings.isRunning || false;
        }

        const savedTasks = localStorage.getItem("pomodoroTasks");
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            const todoBlock = document.querySelector(".todo-block");
            todoBlock.innerHTML = ""; // Clear existing tasks
            tasks.forEach(task => {
                const div = document.createElement("div");
                div.innerHTML = task.html;
                todoBlock.appendChild(div);
            });
        }

        updateTime(); // Update display with loaded time

        // Restore timer state
        if (isRunning) {
            btnStart.classList.add("hidden");
            btnPause.classList.remove("hidden");
            startTimer();
        }
    }

    // Save settings to localStorage
    function saveSettingsToLocalStorage() {
        const settings = {
            defaultTime,
            shortBreakTime,
            longBreakTime,
            timeLeft,
            isRunning
        };
        localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
    }

    // Save tasks to localStorage
    function saveTasksToLocalStorage() {
        const todoBlock = document.querySelector(".todo-block");
        const tasks = Array.from(todoBlock.children).map(div => ({
            html: div.innerHTML
        }));
        localStorage.setItem("pomodoroTasks", JSON.stringify(tasks));
    }

    function updateTime() {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        minutesEl.textContent = String(minutes).padStart(2, "0");
        secondsEl.textContent = String(seconds).padStart(2, "0");
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;

        btnStart.classList.add("hidden");
        btnPause.classList.remove("hidden");

        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTime();
                saveSettingsToLocalStorage(); // Save timeLeft on each tick
            } else {
                clearInterval(timer);
                isRunning = false;
                btnStart.classList.remove("hidden");
                btnPause.classList.add("hidden");
                timeUpModal.style.display = "block";
                bell.play();
                saveSettingsToLocalStorage(); // Save final state
            }
        }, 1000);
        saveSettingsToLocalStorage(); // Save running state
    }

    function pauseTimer() {
        isRunning = false;
        clearInterval(timer);
        btnStart.classList.remove("hidden");
        btnPause.classList.add("hidden");
        saveSettingsToLocalStorage(); // Save paused state
    }

    function resetTimer() {
        isRunning = false;
        clearInterval(timer);
        timeLeft = defaultTime * 60;
        updateTime();
        btnStart.classList.remove("hidden");
        btnPause.classList.add("hidden");
        saveSettingsToLocalStorage(); // Save reset state
    }

    function setShortBreak() {
        defaultTime = shortBreakTime;
        resetTimer();
        saveSettingsToLocalStorage(); // Save new defaultTime
    }

    function setLongBreak() {
        defaultTime = longBreakTime;
        resetTimer();
        saveSettingsToLocalStorage(); // Save new defaultTime
    }

    function setDefault() {
        defaultTime = 25;
        resetTimer();
        saveSettingsToLocalStorage(); // Save new defaultTime
    }

    function customTimer() {
        customModal.style.display = "block";
    }

    function saveCustomSettings() {
        let newDefault = Number(document.getElementById("customDefault").value) || 25;
        let newShort = Number(document.getElementById("customShortBreak").value) || 5;
        let newLong = Number(document.getElementById("customLongBreak").value) || 15;
        shortBreakTime = newShort;
        longBreakTime = newLong;
        defaultTime = newDefault;
        resetTimer();
        customModal.style.display = "none";
        saveSettingsToLocalStorage(); // Save custom settings
    }

    // To-Do Modal Logic
    function addButtonBlock() {
        console.log("addButtonBlock called");
        if (todoModal) {
            todoModal.style.display = "block";
        } else {
            console.error("todoModal element not found");
        }
    }

    function showSection(section) {
        const notes = document.querySelector(".notes");
        const checklist = document.querySelector(".checklist");
        notes.style.display = "none";
        checklist.style.display = "none";

        if (section === "notes") {
            notes.style.display = "block";
        } else if (section === "checklist") {
            checklist.style.display = "block";
        }
    }

    // Helper function to insert line breaks after every 10 words
    function insertLineBreaks(text) {
        const words = text.split(" ");
        let formattedText = "";
        for (let i = 0; i < words.length; i++) {
            formattedText += words[i];
            if ((i + 1) % 10 === 0 && i !== words.length - 1) {
                formattedText += "<br>";
            } else if (i < words.length - 1) {
                formattedText += " ";
            }
        }
        return formattedText;
    }

    // Notes Functionality
    const addSaveNotesBtn = document.getElementById("addSaveNotes");
    const taskInputNotes = document.getElementById("taskInputNotes");
    addSaveNotesBtn.addEventListener("click", () => {
        const title = document.getElementById("taskTitleNotes").value.trim();
        const notes = taskInputNotes.value.trim();
        if (title && notes) {
            const todoBlock = document.querySelector(".todo-block");
            const div = document.createElement("div");
            const formattedTitle = `<strong>${title}</strong><br>`;
            const formattedNotes = `${insertLineBreaks(notes)}<br>`;
            const formattedContent = `${formattedTitle}${formattedNotes}`;
            div.innerHTML = `<p>${formattedContent}</p><span class="edit-btn">Edit</span><span class="delete-btn">Delete</span>`;
            todoBlock.appendChild(div);
            document.getElementById("taskTitleNotes").value = "";
            taskInputNotes.value = "";
            todoModal.style.display = "none";
            saveTasksToLocalStorage(); // Save tasks after adding
        }
    });

    const closeNotes = document.querySelector(".notes .close");
    closeNotes.addEventListener("click", () => {
        document.querySelector(".notes").style.display = "none";
        todoModal.style.display = "none";
    });

    // Real-time line break for taskInputNotes
    /*taskInputNotes.addEventListener("input", function() {
        const words = this.value.trim().split(" ");
        let formattedText = " ";
        for (let i = 0; i < words.length; i++) {
            formattedText += words[i];
            if ((i + 1) % 10 === 0 && i !== words.length - 1) {
                formattedText += "\n";
            } else if (i < words.length - 1) {
                formattedText += " ";
            }
        }
        this.value = formattedText;
    });*/

    // Checklist Functionality
    const addItemChecklistBtn = document.getElementById("addItemChecklist");
    const checklistItems = document.getElementById("checklistItems");
    addItemChecklistBtn.addEventListener("click", () => {
        const item = document.getElementById("taskCheckListItem").value.trim();
        if (item) {
            const li = document.createElement("li");
            li.innerHTML = `<input type="checkbox"> <span>${item}</span><span class="edit-btn">Edit</span><span class="delete-btn">Delete</span>`;
            checklistItems.appendChild(li);
            document.getElementById("taskCheckListItem").value = "";
            li.querySelector("input").addEventListener("change", function() {
                const span = li.querySelector("span");
                if (this.checked) {
                    span.classList.add("completed");
                } else {
                    span.classList.remove("completed");
                }
            });
        }
    });

    const addSaveChecklistBtn = document.getElementById("addSaveChecklist");
    addSaveChecklistBtn.addEventListener("click", () => {
        const title = document.getElementById("taskTitleChecklist").value.trim();
        if (title && checklistItems.children.length > 0) {
            const todoBlock = document.querySelector(".todo-block");
            const div = document.createElement("div");
            let itemsList = "";
            Array.from(checklistItems.children).forEach(item => {
                const checked = item.querySelector("input").checked ? " (completed)" : "";
                itemsList += `<li>${item.querySelector("span").textContent}${checked}</li>`;
            });
            const formattedTitle = `<strong>${title}</strong><br>`;
            const formattedContent = `${formattedTitle}<ul>${itemsList}</ul><br>`;
            div.innerHTML = `<p>${formattedContent}</p><span class="edit-btn">Edit</span><span class="delete-btn">Delete</span>`;
            todoBlock.appendChild(div);
            document.getElementById("taskTitleChecklist").value = "";
            checklistItems.innerHTML = "";
            todoModal.style.display = "none";
            saveTasksToLocalStorage(); // Save tasks after adding
        }
    });

    const closeChecklist = document.querySelector(".checklist .close");
    closeChecklist.addEventListener("click", () => {
        document.querySelector(".checklist").style.display = "none";
        todoModal.style.display = "none";
    });

    // Event listeners for edit and delete buttons
    let editTaskElement = null;
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("edit-btn")) {
            editTaskElement = event.target.parentElement;
            todoModal.style.display = "block";
            if (editTaskElement.tagName === "DIV") {
                const p = editTaskElement.querySelector("p");
                const [title, content] = p.innerHTML.split("<br>");
                document.getElementById("taskTitleNotes").value = title.replace("<strong>", "").replace("</strong>", "").trim();
                document.getElementById("taskInputNotes").value = content.replace(/<br>/g, "").replace(/<\/?[^>]+(>|$)/g, "").trim();
                showSection("notes");
            } else if (editTaskElement.tagName === "LI") {
                const span = editTaskElement.querySelector("span");
                document.getElementById("taskTitleChecklist").value = "Edited Task";
                document.getElementById("taskCheckListItem").value = span.textContent;
                showSection("checklist");
            }
        } else if (event.target.classList.contains("delete-btn")) {
            if (confirm("Are you sure you want to delete this task?")) {
                event.target.parentElement.remove();
                saveTasksToLocalStorage(); // Save tasks after deletion
            }
        }
    });

    // Override save buttons to handle edit
    addSaveNotesBtn.addEventListener("click", () => {
        const title = document.getElementById("taskTitleNotes").value.trim();
        const notes = taskInputNotes.value.trim();
        if (title && notes) {
            if (editTaskElement) {
                const p = editTaskElement.querySelector("p");
                const formattedTitle = `<strong>${title}</strong><br>`;
                const formattedNotes = `${insertLineBreaks(notes)}<br>`;
                const formattedContent = `${formattedTitle}${formattedNotes}`;
                p.innerHTML = formattedContent;
                editTaskElement = null;
            } else {
                const todoBlock = document.querySelector(".todo-block");
                const div = document.createElement("div");
                const formattedTitle = `<strong>${title}</strong><br>`;
                const formattedNotes = `${insertLineBreaks(notes)}<br>`;
                const formattedContent = `${formattedTitle}${formattedNotes}`;
                div.innerHTML = `<p>${formattedContent}</p><span class="edit-btn">Edit</span><span class="delete-btn">Delete</span>`;
                todoBlock.appendChild(div);
            }
            document.getElementById("taskTitleNotes").value = "";
            taskInputNotes.value = "";
            todoModal.style.display = "none";
            saveTasksToLocalStorage(); // Save tasks after editing or adding
        }
    });

    addSaveChecklistBtn.addEventListener("click", () => {
        const title = document.getElementById("taskTitleChecklist").value.trim();
        const item = document.getElementById("taskCheckListItem").value.trim();
        if (title && item) {
            if (editTaskElement) {
                const span = editTaskElement.querySelector("span");
                span.textContent = item;
                editTaskElement.classList.remove("completed");
                editTaskElement.querySelector("input").checked = false;
                editTaskElement = null;
            } else if (document.getElementById("checklistItems").children.length > 0) {
                const todoBlock = document.querySelector(".todo-block");
                const div = document.createElement("div");
                let itemsList = "";
                Array.from(checklistItems.children).forEach(item => {
                    const checked = item.querySelector("input").checked ? " (completed)" : "";
                    itemsList += `<li>${item.querySelector("span").textContent}${checked}</li>`;
                });
                const formattedTitle = `<strong>${title}</strong><br>`;
                const formattedContent = `${formattedTitle}<ul>${itemsList}</ul><br>`;
                div.innerHTML = `<p>${formattedContent}</p><span class="edit-btn">Edit</span><span class="delete-btn">Delete</span>`;
                todoBlock.appendChild(div);
                document.getElementById("checklistItems").innerHTML = "";
            }
            document.getElementById("taskTitleChecklist").value = "";
            document.getElementById("taskCheckListItem").value = "";
            todoModal.style.display = "none";
            saveTasksToLocalStorage(); // Save tasks after editing or adding
        }
    });

    // Event listeners
    btnStart.addEventListener("click", startTimer);
    btnPause.addEventListener("click", pauseTimer);
    btnReset.addEventListener("click", resetTimer);
    btnShortBreak.addEventListener("click", setShortBreak);
    btnLongBreak.addEventListener("click", setLongBreak);
    btnDefault.addEventListener("click", setDefault);
    btnCustom.addEventListener("click", customTimer);
    saveCustomBtn.addEventListener("click", saveCustomSettings);
    closeTimeUp.addEventListener("click", () => {
        timeUpModal.style.display = "none";
        bell.pause();
        bell.currentTime = 0;
    });
    closeCustom.addEventListener("click", () => (customModal.style.display = "none"));
    closeTodo.addEventListener("click", () => {
        todoModal.style.display = "none";
        document.querySelector(".notes").style.display = "none";
        document.querySelector(".checklist").style.display = "none";
        editTaskElement = null;
    });
    okBtn.addEventListener("click", () => {
        timeUpModal.style.display = "none";
        bell.pause();
        bell.currentTime = 0;
    });
    window.addEventListener("click", (event) => {
        if (event.target == timeUpModal) {
            timeUpModal.style.display = "none";
            bell.pause();
            bell.currentTime = 0;
        }
        if (event.target == customModal) customModal.style.display = "none";
        if (event.target == todoModal) {
            todoModal.style.display = "none";
            document.querySelector(".notes").style.display = "none";
            document.querySelector(".checklist").style.display = "none";
            editTaskElement = null;
        }
    });

    // Load settings and tasks on page load
    loadFromLocalStorage();

    // Added debug for Add button
    const addButton = document.querySelector(".input-btn");
    if (addButton) {
        addButton.addEventListener("click", () => {
            console.log("Input button clicked, calling addButtonBlock");
            addButtonBlock();
        });
    } else {
        console.error("Input button (.input-btn) not found in the DOM");
    }

    // Event delegation for todoModal buttons
    todoModal.addEventListener("click", (event) => {
        if (event.target.classList.contains("notesbtn")) {
            console.log("Notes button clicked, calling showSection('notes')");
            showSection("notes");
        } else if (event.target.classList.contains("checkbtn")) {
            console.log("Check List button clicked, calling showSection('checklist')");
            showSection("checklist");
        }
    });
});