class CountdownTimer {
    constructor() {
        // DOM Elements
        this.hoursDisplay = document.getElementById("hours");
        this.minutesDisplay = document.getElementById("minutes");
        this.secondsDisplay = document.getElementById("seconds");
        this.progressBar = document.getElementById("progress");

        this.hoursInput = document.getElementById("hours-input");
        this.minutesInput = document.getElementById("minutes-input");
        this.secondsInput = document.getElementById("seconds-input");

        this.startBtn = document.getElementById("start-btn");
        this.pauseBtn = document.getElementById("pause-btn");
        this.resetBtn = document.getElementById("reset-btn");
        this.themeBtn = document.getElementById("theme-btn");

        this.alarm = document.getElementById("alarm");

        // Timer state
        this.totalSeconds = 0;
        this.remainingSeconds = 0;
        this.timerInterval = null;
        this.isRunning = false;
        this.isPaused = false;

        this.init();
    }

    init() {
        // Initialize event listeners
        this.startBtn.addEventListener("click", () => this.handleStart());
        this.pauseBtn.addEventListener("click", () => this.togglePause());
        this.resetBtn.addEventListener("click", () => this.resetTimer());
        this.themeBtn.addEventListener("click", () => this.toggleTheme());

        // Disable pause button initially
        this.pauseBtn.disabled = true;
    }

    handleStart() {
        if (this.isRunning && !this.isPaused) return;
        
        if (this.isPaused) {
            this.resumeTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;

        this.totalSeconds = hours * 3600 + minutes * 60 + seconds;
        this.remainingSeconds = this.totalSeconds;

        if (this.remainingSeconds <= 0) return;

        this.isRunning = true;
        this.isPaused = false;
        this.pauseBtn.disabled = false;
        this.pauseBtn.textContent = "Pause";
        this.updateDisplay();

        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay();

            if (this.remainingSeconds <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }

    togglePause() {
        if (!this.isRunning) return;
        
        if (this.isPaused) {
            this.resumeTimer();
        } else {
            this.pauseTimer();
        }
    }

    pauseTimer() {
        clearInterval(this.timerInterval);
        this.isPaused = true;
        this.pauseBtn.textContent = "Resume";
    }

    resumeTimer() {
        this.isPaused = false;
        this.pauseBtn.textContent = "Pause";
        
        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay();

            if (this.remainingSeconds <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }

    resetTimer() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isPaused = false;
        this.remainingSeconds = 0;
        this.totalSeconds = 0;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = "Pause";
        this.updateDisplay();
    }

    updateDisplay() {
        const hours = Math.floor(this.remainingSeconds / 3600);
        const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
        const seconds = this.remainingSeconds % 60;

        this.hoursDisplay.textContent = hours.toString().padStart(2, "0");
        this.minutesDisplay.textContent = minutes.toString().padStart(2, "0");
        this.secondsDisplay.textContent = seconds.toString().padStart(2, "0");

        // Update progress bar
        if (this.totalSeconds > 0) {
            const progressPercent = (this.remainingSeconds / this.totalSeconds) * 100;
            this.progressBar.style.width = `${progressPercent}%`;
            
            // Change progress bar color when time is running out
            if (progressPercent < 20) {
                this.progressBar.style.backgroundColor = "#ff7675";
            } else {
                this.progressBar.style.backgroundColor = "#6c5ce7";
            }
        }
    }

    timerComplete() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isPaused = false;
        this.pauseBtn.disabled = true;
        
        // Play alarm and show alert
        this.alarm.play();
        setTimeout(() => {
            alert("Time's up!");
            this.alarm.pause();
            this.alarm.currentTime = 0;
        }, 100);
    }

    toggleTheme() {
        document.body.classList.toggle("dark-mode");
        
        // Save theme preference to localStorage
        const isDarkMode = document.body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isDarkMode);
        
        // Update progress bar color based on theme
        const progressPercent = (this.remainingSeconds / this.totalSeconds) * 100;
        if (progressPercent < 20) {
            this.progressBar.style.backgroundColor = "#ff7675";
        } else {
            this.progressBar.style.backgroundColor = isDarkMode ? "#a29bfe" : "#6c5ce7";
        }
    }
}

// Initialize the timer when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    const timer = new CountdownTimer();
    
    // Load saved theme preference
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }
});