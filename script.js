const places = [
  { label: "Millions", value: 1000000 },
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
const placeTable = document.getElementById("placeTable");
const expandedForm = document.getElementById("expandedForm");
const blockRows = document.getElementById("blockRows");

function clampToRange(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getDigits(value) {
  const padded = String(value).padStart(7, "0");
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

  const millions = Math.floor(num / 1000000);
  const afterMillions = num % 1000000;
  const thousands = Math.floor(afterMillions / 1000);
  const remainder = afterMillions % 1000;

  let result = "";
  if (millions) {
    result += `${ones[millions]} million`;
  }

  if (thousands) {
    if (result) result += " ";
    result += `${threeDigitsToWords(thousands)} thousand`;
  }

  if (remainder) {
    if (result) result += " ";
    result += threeDigitsToWords(remainder);
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

function createPlaceTable(digits) {
  const valueCells = places
    .map(
      (place, index) => `
    <div class="table-cell table-head table-c${index}" role="columnheader">
      <p class="table-top-value">${formatNumber(place.value)}</p>
      <p class="table-place-name">${place.label}</p>
    </div>`
    )
    .join("");

  const digitCells = places
    .map(
      (place, index) => `
    <div class="table-cell table-digit table-c${index}" role="cell">
      <p class="table-digit-value">${digits[index]}</p>
      <p class="table-digit-total">${formatNumber(digits[index] * place.value)}</p>
    </div>`
    )
    .join("");

  placeTable.innerHTML = `
    <div class="table-row" role="row">${valueCells}</div>
    <div class="table-row" role="row">${digitCells}</div>
  `;
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
  const value = clampToRange(Number(inputValue) || 0, 0, 9999999);
  numberInput.value = value;

  const digits = getDigits(value);

  prettyNumber.textContent = formatNumber(value);
  numberWords.textContent = numberToWords(value);

  createPlaceTable(digits);
  createExpandedForm(digits);
  createBlockRows(digits);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

numberInput.addEventListener("input", (event) => {
  updateExplorer(event.target.value);
});

randomBtn.addEventListener("click", () => {
  const value = randomInt(0, 9999999);
  updateExplorer(value);
});

updateExplorer(numberInput.value);
