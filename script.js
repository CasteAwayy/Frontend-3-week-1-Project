const form = document.querySelector(".form");
const timerContainer = document.querySelector(".timers-container");
const emptyLog = document.querySelector(".empty-log");
const inputFields = document.querySelectorAll("input");

class App {
  constructor() {
    this.timerArr = []; // array to manage all timers

    // listeners to manage events
    form.addEventListener("submit", this.setTimer.bind(this));
    timerContainer.addEventListener("click", this.handleActions.bind(this));
    inputFields.forEach(this.inputEle.bind(this));
  }

  getFormData(e) {
    const formData = new FormData(e.currentTarget);
    const hours = formData.get("hours") || 0;
    const minutes = formData.get("minutes") || 0;
    const seconds = formData.get("seconds") || 0;
    const totalTime =
      parseInt(hours) * 60 * 60 + parseInt(minutes) * 60 + parseInt(seconds);
    return { hours, minutes, seconds, totalTime };
  }

  setTimer(e) {
    e.preventDefault();

    // get timer data
    const { hours, minutes, seconds, totalTime } = this.getFormData(e);

    // check for invalid input
    if (!this.checkInput(hours, minutes, seconds, totalTime)) return;

    // create timer object for every timer
    const timer = new Timer(hours, minutes, seconds, totalTime);
    // update remaining time
    this.updateTime(timer);

    //method to insert timer in dom
    this.insertTimer(timer);

    // tone obj for each timer
    timer.toneObj = this.timerEndTone();

    //toggle banner text to change no timer state
    this.toggleEmptyTimerBanner();

    // create a setInterval for each timer
    const interval = setInterval(() => {
      this.updateTime(timer);
      this.renderTime(timer);
    }, 1000);

    // attach intervalId to each timer object
    timer.intervalId = interval;

    //push all timers to global timerArray
    this.timerArr.push(timer);
  }

  checkInput(hours, minutes, seconds, totalTime) {
    if (hours >= 24 || minutes >= 60 || seconds >= 60 || totalTime == 0)
      return 0;
    return 1;
  }

  insertTimer(timer) {
    // prettier-ignore
    const markup = `
    <div class="timer-number" data-id='${timer.id}'>
        <div class="timer">
            <span class="text">Time Left:</span>
            <span class="time">
                <div>${(timer.hoursRemaining + "").padStart(2,"0")}</div>
                <span>:</span>
                <div>${(timer.minutesRemaining + "").padStart(2,"0")}</div>
                <span>:</span>
                <div>${(timer.secondsRemaining + "").padStart(2,"0")}</div>
            </span>
            <button class="btn btn-delete">Delete</button>
        </div>
        <div class="timer timer-end hidden">
            <span class="times-up">Timer is Up!</span>
            <button class="btn btn-stop">Stop</button>
        </div>
    </div>`;
    timerContainer.insertAdjacentHTML("beforeend", markup);
  }

  updateTime(timer) {
    if (timer.totalTime <= 0) {
      clearInterval(timer.intervalId);
      this.timerEnd(timer.id);
      this.timerEndTonePlay(timer.toneObj);
    }
    timer.secondsRemaining = timer.totalTime % 60;
    timer.minutesRemaining = Math.floor((timer.totalTime / 60) % 60);
    timer.hoursRemaining = Math.floor(timer.totalTime / 3600);
    timer.totalTime--;
  }

  renderTime(timer) {
    const text = document.querySelector(
      `.timer-number[data-id='${timer.id}'] .time`
    );
    text.innerHTML = this.formatTime(timer);
  }

  formatTime(timer) {
    return `<div>${(timer.hoursRemaining + "").padStart(2, "0")}</div>
            <span>:</span>
            <div>${(timer.minutesRemaining + "").padStart(2, "0")}</div>
            <span>:</span>
            <div>${(timer.secondsRemaining + "").padStart(2, "0")}</div>`;
  }

  handleDeleteTimer(deleteBtn) {
    const timerELe = deleteBtn.closest(".timer-number");
    const id = timerELe.dataset.id;
    const idx = this.timerArr.findIndex((ele) => {
      return ele.id == id;
    });
    this.timerEndToneStop(this.timerArr[idx].toneObj);
    clearInterval(this.timerArr[idx].intervalId);
    this.updateTimerArray(id);
    timerELe.remove();
    this.toggleEmptyTimerBanner();
  }

  updateTimerArray(id) {
    this.timerArr = this.timerArr.filter((timer) => {
      return timer.id != id;
    });
  }

  timerEndTone() {
    const tone = new Audio();
    tone.src = "asset/timer-end-tone.wav";
    return tone;
  }

  timerEndTonePlay(tone) {
    tone.play();
  }

  timerEndToneStop(tone) {
    tone.pause();
  }

  handleActions(e) {
    if (
      e.target.classList.contains("btn-delete") ||
      e.target.classList.contains("btn-stop")
    ) {
      this.handleDeleteTimer(e.target);
    }
  }

  timerEnd(id) {
    const timerEnd = document.querySelector(
      `.timer-number[data-id='${id}'] .timer-end`
    );
    const timerEle = document.querySelector(
      `.timer-number[data-id='${id}'] .timer`
    );

    timerEle.classList.add("visible-hidden");
    timerEnd.classList.remove("hidden");
  }

  toggleEmptyTimerBanner() {
    timerContainer.childElementCount == 0
      ? emptyLog.classList.remove("hidden")
      : emptyLog.classList.add("hidden");
  }

  inputEle(input) {
    input.addEventListener("change", this.handleInputFormat);
  }

  handleInputFormat() {
    if (this.value != "") this.value = this.value.padStart(2, "0");
  }
}

class Timer {
  static id = 0;
  constructor(hours, minutes, seconds, totalTime) {
    this.id = Timer.id++;
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
    this.totalTime = totalTime;
  }
}

const app = new App();
