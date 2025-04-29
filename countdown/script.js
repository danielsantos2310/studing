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

        this.alarm = document.getElementById("alarm");

        // Timer state
        this.totalSeconds = 0;
        this.remainingSeconds = 0;
        this.timerInterval = null;
        this.isRunning = false;

        this.init();
    }

    init() {
        this.startBtn.addEventListener("click", () => this.startTimer());
        this.pauseBtn.addEventListener("click", () => this.pauseTimer());
        this.resetBtn.addEventListener("click", () => this.resetTimer());
    }

    startTimer() {
        if (this.isRunning) return;

        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;

        this.totalSeconds = hours * 3600 + minutes * 60 + seconds;
        this.remainingSeconds = this.totalSeconds;

        if (this.remainingSeconds <= 0) return;

        this.isRunning = true;
        this.updateDisplay();

        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay();

            if (this.remainingSeconds <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }

    pauseTimer() {
        if (!this.isRunning) return;
        clearInterval(this.timerInterval);
        this.isRunning = false;
    }

    resetTimer() {
        this.pauseTimer();
        this.remainingSeconds = 0;
        this.totalSeconds = 0;
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
        }
    }

    timerComplete() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.alarm.play();
        setTimeout(() => {
            alert("Time's up!");
            this.alarm.pause();
            this.alarm.currentTime = 0;
        }, 100);
    }
}

// Initialize the timer
const timer = new CountdownTimer();