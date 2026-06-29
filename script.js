const places = [
  { label: "Hundred Thousands", value: 100000 },
  { label: "Ten Thousands", value: 10000 },
  { label: "Thousands", value: 1000 },
  { label: "Hundreds", value: 100 },
  { label: "Tens", value: 10 },
  { label: "Ones", value: 1 },
];

const numberInput = document.getElementById("numberInput");
const randomBtn = document.getElementById("randomBtn");
const prettyNumber = document.getElementById("prettyNumber");
const numberWords = document.getElementById("numberWords");
const placeCards = document.getElementById("placeCards");
const expandedForm = document.getElementById("expandedForm");
const blockRows = document.getElementById("blockRows");

const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizFeedback = document.getElementById("quizFeedback");
const quizScore = document.getElementById("quizScore");
const nextQuizBtn = document.getElementById("nextQuizBtn");

let score = 0;
let currentQuiz = null;

function clampToRange(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getDigits(value) {
  const padded = String(value).padStart(6, "0");
  return padded.split("").map((digit) => Number(digit));
}

function numberToWords(num) {
  if (num === 0) return "Zero";

  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  const threeDigitsToWords = (n) => {
    let text = "";
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;

    if (hundreds) {
      text += `${ones[hundreds]} hundred`;
    }

    if (rest) {
      if (text) text += " ";
      if (rest < 10) {
        text += ones[rest];
      } else if (rest < 20) {
        text += teens[rest - 10];
      } else {
        const ten = Math.floor(rest / 10);
        const one = rest % 10;
        text += tens[ten];
        if (one) text += `-${ones[one]}`;
      }
    }

    return text;
  };

  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;

  let result = "";
  if (thousands) {
    result += `${threeDigitsToWords(thousands)} thousand`;
  }

  if (remainder) {
    if (result) result += " ";
    result += threeDigitsToWords(remainder);
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

function createPlaceCards(digits) {
  placeCards.innerHTML = "";

  places.forEach((place, index) => {
    const digit = digits[index];
    const total = digit * place.value;

    const card = document.createElement("article");
    card.className = "place-card";
    card.style.animationDelay = `${index * 60}ms`;

    card.innerHTML = `
      <p class="place-name">${place.label}</p>
      <p class="place-digit">${digit}</p>
      <p class="place-value">Value: ${formatNumber(total)}</p>
    `;

    placeCards.appendChild(card);
  });
}

function createExpandedForm(digits) {
  const parts = places
    .map((place, index) => digits[index] * place.value)
    .filter((value) => value > 0)
    .map((value) => formatNumber(value));

  expandedForm.textContent = parts.length ? parts.join(" + ") : "0";
}

function createBlockRows(digits) {
  blockRows.innerHTML = "";

  places.forEach((place, index) => {
    const digit = digits[index];
    const row = document.createElement("div");
    row.className = "block-row";

    const cubes = digit
      ? new Array(digit).fill("").map(() => '<span class="unit" aria-hidden="true"></span>').join("")
      : '<span class="unit zero">No blocks for this place</span>';

    row.innerHTML = `
      <div class="block-top">
        <p class="block-title">${place.label}: ${digit}</p>
        <p class="block-total">${digit} x ${formatNumber(place.value)} = ${formatNumber(
      digit * place.value
    )}</p>
      </div>
      <div class="block-items">${cubes}</div>
    `;

    blockRows.appendChild(row);
  });
}

function updateExplorer(inputValue) {
  const value = clampToRange(Number(inputValue) || 0, 0, 999999);
  numberInput.value = value;

  const digits = getDigits(value);

  prettyNumber.textContent = formatNumber(value);
  numberWords.textContent = numberToWords(value);

  createPlaceCards(digits);
  createExpandedForm(digits);
  createBlockRows(digits);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildQuiz() {
  const number = randomInt(1000, 999999);
  const digits = getDigits(number);

  let placeIndex = randomInt(0, places.length - 1);
  if (digits.some((digit) => digit > 0)) {
    let guard = 0;
    while (digits[placeIndex] === 0 && guard < 30) {
      placeIndex = randomInt(0, places.length - 1);
      guard += 1;
    }
  }

  const digit = digits[placeIndex];
  const place = places[placeIndex];
  const correct = digit * place.value;

  const options = new Set([correct]);
  while (options.size < 4) {
    const randomDigit = randomInt(1, 9);
    const randomPlace = places[randomInt(0, places.length - 1)].value;
    options.add(randomDigit * randomPlace);
  }

  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);

  currentQuiz = {
    number,
    digit,
    placeLabel: place.label,
    correct,
    options: shuffled,
    answered: false,
  };

  renderQuiz();
}

function renderQuiz() {
  if (!currentQuiz) return;

  quizQuestion.textContent = `In ${formatNumber(currentQuiz.number)}, what is the value of the digit ${
    currentQuiz.digit
  } in the ${currentQuiz.placeLabel} place?`;

  quizOptions.innerHTML = "";
  currentQuiz.options.forEach((value) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option";
    btn.textContent = formatNumber(value);
    btn.setAttribute("role", "listitem");

    btn.addEventListener("click", () => handleAnswer(btn, value));
    quizOptions.appendChild(btn);
  });

  quizFeedback.textContent = "Choose an answer.";
  quizFeedback.className = "quiz-feedback";
  quizScore.textContent = `Score: ${score}`;
}

function createSparkles(count = 12) {
  for (let i = 0; i < count; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${randomInt(10, 90)}vw`;
    sparkle.style.top = `${randomInt(20, 75)}vh`;
    sparkle.style.animationDelay = `${i * 24}ms`;
    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 900);
  }
}

function handleAnswer(button, value) {
  if (!currentQuiz || currentQuiz.answered) return;

  currentQuiz.answered = true;
  const optionButtons = [...quizOptions.querySelectorAll("button")];

  optionButtons.forEach((btn) => {
    const buttonValue = Number(btn.textContent.replace(/,/g, ""));
    if (buttonValue === currentQuiz.correct) {
      btn.classList.add("correct");
    }
    if (btn === button && value !== currentQuiz.correct) {
      btn.classList.add("wrong");
    }
    btn.disabled = true;
  });

  if (value === currentQuiz.correct) {
    score += 1;
    quizFeedback.textContent = "Excellent! You got it right.";
    quizFeedback.classList.add("good");
    createSparkles();
  } else {
    quizFeedback.textContent = `Not quite. Correct answer: ${formatNumber(currentQuiz.correct)}.`;
    quizFeedback.classList.add("bad");
  }

  quizScore.textContent = `Score: ${score}`;
}

numberInput.addEventListener("input", (event) => {
  updateExplorer(event.target.value);
});

randomBtn.addEventListener("click", () => {
  const value = randomInt(0, 999999);
  updateExplorer(value);
});

nextQuizBtn.addEventListener("click", () => {
  buildQuiz();
});

updateExplorer(numberInput.value);
buildQuiz();
