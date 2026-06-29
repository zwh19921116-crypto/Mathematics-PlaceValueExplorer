const wholePlaces = [
  { label: "Millions", value: 1000000 },
  { label: "Hundred Thousands", value: 100000 },
  { label: "Ten Thousands", value: 10000 },
  { label: "Thousands", value: 1000 },
  { label: "Hundreds", value: 100 },
  { label: "Tens", value: 10 },
  { label: "Ones", value: 1 },
];

const decimalPlaces = [
  { label: "Tenths", value: 0.1 },
  { label: "Hundredths", value: 0.01 },
];

const numberInput = document.getElementById("numberInput");
const randomBtn = document.getElementById("randomBtn");
const decimalToggle = document.getElementById("decimalToggle");
const prettyNumber = document.getElementById("prettyNumber");
const numberWords = document.getElementById("numberWords");
const placeTable = document.getElementById("placeTable");
const expandedForm = document.getElementById("expandedForm");
const blockRows = document.getElementById("blockRows");

function clampToRange(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatNumber(value, fractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function getCurrentPlaces() {
  return decimalToggle.checked ? [...wholePlaces, ...decimalPlaces] : wholePlaces;
}

function parseInputValue(rawValue) {
  const parsed = Number(rawValue);
  const max = decimalToggle.checked ? 9999999.99 : 9999999;
  const clamped = clampToRange(Number.isFinite(parsed) ? parsed : 0, 0, max);
  return decimalToggle.checked ? Math.round(clamped * 100) / 100 : Math.floor(clamped);
}

function getDigitsByMode(value) {
  const integerPart = Math.floor(value);
  const integerDigits = String(integerPart)
    .padStart(7, "0")
    .split("")
    .map((digit) => Number(digit));

  if (!decimalToggle.checked) {
    return integerDigits;
  }

  const cents = Math.round((value - integerPart) * 100);
  return [...integerDigits, Math.floor(cents / 10), cents % 10];
}

function twoDigitsToWords(number, ones, teens, tens) {
  if (number < 10) return ones[number];
  if (number < 20) return teens[number - 10];

  const ten = Math.floor(number / 10);
  const one = number % 10;
  return `${tens[ten]}${one ? `-${ones[one]}` : ""}`;
}

function numberToWords(value) {
  if (value === 0) return "Zero";

  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
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

  const threeDigitsToWords = (num) => {
    let text = "";
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;

    if (hundreds) {
      text += `${ones[hundreds]} hundred`;
    }

    if (rest) {
      if (text) text += " ";
      text += twoDigitsToWords(rest, ones, teens, tens);
    }

    return text;
  };

  const wholePart = Math.floor(value);
  const millions = Math.floor(wholePart / 1000000);
  const afterMillions = wholePart % 1000000;
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

  if (!decimalToggle.checked) {
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  const cents = Math.round((value - wholePart) * 100);
  if (cents === 0) {
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  const decimalText = `${twoDigitsToWords(cents, ones, teens, tens)} hundredths`;
  return `${result.charAt(0).toUpperCase() + result.slice(1)} and ${decimalText}`;
}

function createPlaceTable(digits) {
  const places = getCurrentPlaces();
  const cols = places.length;

  const valueCells = places
    .map((place, index) => {
      const colorClass = `table-c${Math.min(index, 6)}`;
      const decimalStartClass = index === 7 ? "decimal-start" : "";
      const topValue = formatNumber(place.value, place.value < 1 ? 2 : 0);

      return `
      <div class="table-cell table-head ${colorClass} ${decimalStartClass}" role="columnheader">
        <p class="table-top-value">${topValue}</p>
        <p class="table-place-name">${place.label}</p>
      </div>`;
    })
    .join("");

  const digitCells = places
    .map((place, index) => {
      const colorClass = `table-c${Math.min(index, 6)}`;
      const decimalStartClass = index === 7 ? "decimal-start" : "";
      const total = formatNumber(digits[index] * place.value, place.value < 1 ? 2 : 0);

      return `
      <div class="table-cell table-digit ${colorClass} ${decimalStartClass}" role="cell">
        <p class="table-digit-value">${digits[index]}</p>
        <p class="table-digit-total">${total}</p>
      </div>`;
    })
    .join("");

  placeTable.innerHTML = `
    <div class="table-row" role="row" style="grid-template-columns: repeat(${cols}, minmax(0, 1fr)); min-width: ${cols *
    92}px;">${valueCells}</div>
    <div class="table-row" role="row" style="grid-template-columns: repeat(${cols}, minmax(0, 1fr)); min-width: ${cols *
    92}px;">${digitCells}</div>
  `;
}

function createExpandedForm(digits) {
  const places = getCurrentPlaces();
  const parts = places
    .map((place, index) => digits[index] * place.value)
    .filter((entry) => entry > 0)
    .map((entry) => formatNumber(entry, entry < 1 ? 2 : 0));

  expandedForm.textContent = parts.length ? parts.join(" + ") : "0";
}

function createBlockRows(digits) {
  const places = getCurrentPlaces();
  blockRows.innerHTML = "";

  places.forEach((place, index) => {
    const digit = digits[index];
    const total = digit * place.value;

    const row = document.createElement("div");
    row.className = "block-row";

    const cubes = digit
      ? new Array(digit)
          .fill("")
          .map(() => '<span class="unit" aria-hidden="true"></span>')
          .join("")
      : '<span class="unit zero">No blocks for this place</span>';

    row.innerHTML = `
      <div class="block-top">
        <p class="block-title">${place.label}: ${digit}</p>
        <p class="block-total">${digit} x ${formatNumber(place.value, place.value < 1 ? 2 : 0)} = ${formatNumber(
      total,
      place.value < 1 ? 2 : 0
    )}</p>
      </div>
      <div class="block-items">${cubes}</div>
    `;

    blockRows.appendChild(row);
  });
}

function updateExplorer(rawValue) {
  const value = parseInputValue(rawValue);
  numberInput.value = decimalToggle.checked ? value.toFixed(2) : String(Math.floor(value));

  const digits = getDigitsByMode(value);

  prettyNumber.textContent = formatNumber(value, decimalToggle.checked ? 2 : 0);
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
  const randomValue = decimalToggle.checked
    ? Math.round(Math.random() * 999999999) / 100
    : randomInt(0, 9999999);
  updateExplorer(randomValue);
});

decimalToggle.addEventListener("change", () => {
  numberInput.step = decimalToggle.checked ? "0.01" : "1";
  numberInput.max = decimalToggle.checked ? "9999999.99" : "9999999";
  updateExplorer(numberInput.value);
});

updateExplorer(numberInput.value);
