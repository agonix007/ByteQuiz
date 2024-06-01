// Elements
const labelTime = document.querySelector(".time");
const labelQuestion = document.querySelector(".question");
const labelSummaryCount = document.querySelector(".sum--count");
const labelSummaryTotal = document.querySelector(".sum--total");
const labelScore = document.querySelector(".score");
const labelMessage = document.querySelector(".message");

const containerOptions = document.querySelector(".options");
const containerQuiz = document.querySelector(".quiz--main");
const containerSummary = document.querySelector(".summary");
const containerTimer = document.querySelector(".timer-div");

const topicButtons = document.querySelectorAll(".topics");
const btnNext = document.querySelector(".next");
const btnQuit = document.querySelector(".quit");
const btnCloseModal = document.querySelector(".close-modal");

const overlay = document.querySelector(".overlay");

const modal = document.querySelector(".modal");
const overlay2 = document.querySelector(".overlay2");

/////////////////////////////////////////////////////

//For Confetti
const jsConfetti = new JSConfetti();

let data, topicData, timer, nextTimer;

let questionCount = 0;
let questionNum = 1;
let userScore = 0;

const getData = async function () {
  try {
    const response = await fetch("./questions.json");
    if (response.ok) {
      data = await response.json();
    }
  } catch (error) {
    console.error("Failed to Fetch Data." + error);
  }
};

const formattingAnswer = function (ans) {
  const str = ans.split(" ").slice();
  str.splice(0, 1);
  return str.join(" ").trim();
};

const displayScore = function () {
  labelScore.textContent = `${userScore}/${topicData.length}`;
  if (userScore === topicData.length) {
    labelMessage.textContent = "Fantastic! You did it!";
  } else {
    labelMessage.textContent = "Nice try, you'll crush it next time!";
  }
  modal.classList.add("show-modal");
  overlay2.classList.add("show-modal");
  jsConfetti.addConfetti();
};

const displayNextQuestion = function () {
  if (questionCount < topicData.length - 1) {
    questionCount++;
    displayQuestions(questionCount);

    questionNum++;
    displaySummary(questionNum);

    if (nextTimer) clearTimeout(nextTimer);
    if (timer) clearInterval(timer);
    timer = quizTimer();

    btnNext.classList.remove("btn--active");
  } else {
    displayScore();
  }
};

const optionSelected = function (answer) {
  const userAnswer = formattingAnswer(answer.textContent);
  const correctAnswer = topicData[questionCount].answer.trim();

  if (userAnswer === correctAnswer) {
    userScore++;
    answer.classList.add("option--correct");
    nextTimer = setTimeout(displayNextQuestion, 1000);
  } else {
    answer.classList.add("option--wrong");

    // If answer incorrect, autoselect the correct answer
    [...containerOptions.children].forEach((op) => {
      if (formattingAnswer(op.textContent) === correctAnswer) {
        op.classList.add("option--correct");
      }
    });

    nextTimer = setTimeout(displayNextQuestion, 1000);
  }

  // If the answer has been already selected
  [...containerOptions.children].forEach((op) =>
    op.classList.add("option--disabled")
  );

  btnNext.classList.add("btn--active");
};

const displayQuestions = function (ind) {
  labelQuestion.textContent = `${ind + 1}. ${topicData[ind].question}`;

  containerOptions.innerHTML = "";

  containerOptions.innerHTML = `
    <div class="option"><p>A. ${topicData[ind].options[0]}</p></div>
    <div class="option"><p>B. ${topicData[ind].options[1]}</p></div>
    <div class="option"><p>C. ${topicData[ind].options[2]}</p></div>
    <div class="option"><p>D. ${topicData[ind].options[3]}</p></div>
  `;

  const eachOption = document.querySelectorAll(".option");
  Array.from(eachOption, (op) => {
    op.classList.remove("option--correct", "option--wrong", "option--disabled");
    op.addEventListener("click", () => {
      optionSelected(op);
    });
  });
};

const displaySummary = function (ind) {
  labelSummaryCount.textContent = `${ind}`;
  labelSummaryTotal.textContent = `${topicData.length}`;
};

const getTopics = async function (topic) {
  if (!data) {
    await getData();
  }
  topicData = data.find((top) => top.name === topic).questions;

  displayQuestions(0);
  displaySummary(1);
};

const quizTimer = function () {
  const tick = function () {
    labelTime.textContent = `${time}`;

    if (time === 0) {
      clearInterval(timer);
      displayNextQuestion();
    }

    time--;
  };
  let time = 10;

  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

const topicArr = Array.from(topicButtons);

topicArr.forEach((button) =>
  button.addEventListener("click", function () {
    topicArr.forEach((btn) => {
      btn.classList.remove("active");
      btn.classList.add("inactive");
    });

    this.classList.add("active");
    this.classList.remove("inactive");

    let topic;
    switch (this.id) {
      case "btnJava":
        topic = "Java";
        break;
      case "btnNet":
        topic = "Networking";
        break;
      case "btnOs":
        topic = "Operating System";
        break;
      case "btnDbms":
        topic = "DBMS";
        break;
      case "btnSe":
        topic = "Software Engineering";
        break;
    }
    getTopics(topic);

    containerQuiz.style.opacity = 1;
    overlay.classList.add("hidden");

    containerSummary.style.opacity = 1;
    containerTimer.style.opacity = 1;

    if (nextTimer) clearTimeout(nextTimer);
    if (timer) clearInterval(timer);
    timer = quizTimer();
  })
);

const refreshQuiz = function () {
  modal.classList.remove("show-modal");
  overlay2.classList.remove("show-modal");

  containerQuiz.style.opacity = 0;
  overlay.classList.remove("hidden");

  topicArr.forEach((btn) => {
    btn.classList.remove("active", "inactive");
  });

  questionCount = 0;
  questionNum = 1;
  labelSummaryCount.textContent = `${questionNum}`;

  userScore = 0;

  containerSummary.style.opacity = 0;
  containerTimer.style.opacity = 0;

  btnNext.classList.remove("btn--active");

  containerOptions.innerHTML = "";
  if (nextTimer) clearTimeout(nextTimer);
  if (timer) clearInterval(timer);
};

btnNext.addEventListener("click", displayNextQuestion);

btnQuit.addEventListener("click", refreshQuiz);
btnCloseModal.addEventListener("click", refreshQuiz);
overlay2.addEventListener("click", refreshQuiz);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modal.classList.contains("show-modal")) {
    refreshQuiz();
  }
});
