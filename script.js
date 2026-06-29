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
  { label: "Tenths", value: 0.1, digits: 1 },
  { label: "Hundredths", value: 0.01, digits: 2 },
  { label: "Thousandths", value: 0.001, digits: 3 },
  { label: "Ten Thousandths", value: 0.0001, digits: 4 },
  { label: "Hundred Thousandths", value: 0.00001, digits: 5 },
];

const DECIMAL_PRECISION = 5;
const DECIMAL_SCALE = 10 ** DECIMAL_PRECISION;

const numberInput = document.getElementById("numberInput");
const randomBtn = document.getElementById("randomBtn");
const decimalToggle = document.getElementById("decimalToggle");
const numberInputLabel = document.querySelector('label[for="numberInput"]');
const modeToggleText = document.getElementById("modeToggleText");
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

function formatDecimal(value) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: DECIMAL_PRECISION,
  }).format(value);
}

function getCurrentPlaces() {
  return decimalToggle.checked ? decimalPlaces : wholePlaces;
}

function parseInputValue(rawValue) {
  const parsed = Number(rawValue);
  const max = decimalToggle.checked ? 0.99999 : 9999999;
  const clamped = clampToRange(Number.isFinite(parsed) ? parsed : 0, 0, max);
  return decimalToggle.checked
    ? Math.round(clamped * DECIMAL_SCALE) / DECIMAL_SCALE
    : Math.floor(clamped);
}

function getDigitsByMode(value) {
  if (!decimalToggle.checked) {
    return String(Math.floor(value))
      .padStart(wholePlaces.length, "0")
      .split("")
      .map((digit) => Number(digit));
  }

  const decimalDigits = Math.round(value * DECIMAL_SCALE)
    .toString()
    .padStart(DECIMAL_PRECISION, "0")
    .split("")
    .map((digit) => Number(digit));

  return decimalDigits;
}

function twoDigitsToWords(number, ones, teens, tens) {
  if (number < 10) return ones[number];
  if (number < 20) return teens[number - 10];

  const ten = Math.floor(number / 10);
  const one = number % 10;
  return `${tens[ten]}${one ? `-${ones[one]}` : ""}`;
}

function integerToWords(number, ones, teens, tens) {
  if (number === 0) return "zero";

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

  const millions = Math.floor(number / 1000000);
  const afterMillions = number % 1000000;
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

  return result;
}

function numberToWords(value) {
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

  if (decimalToggle.checked) {
    const decimalInt = Math.round(value * DECIMAL_SCALE);
    if (decimalInt === 0) return "Zero hundred-thousandths";
    const fractionWords = integerToWords(decimalInt, ones, teens, tens);
    return `${fractionWords.charAt(0).toUpperCase() + fractionWords.slice(1)} hundred-thousandths`;
  }

  if (value === 0) return "Zero";
  const words = integerToWords(Math.floor(value), ones, teens, tens);
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function createPlaceTable(digits) {
  const places = getCurrentPlaces();
  const cols = places.length;

  const valueCells = places
    .map((place, index) => {
      const colorClass = `table-c${Math.min(index, 6)}`;
      const decimalStartClass = decimalToggle.checked && index === 0 ? "decimal-start" : "";
      const topValue = place.value < 1 ? formatDecimal(place.value) : formatNumber(place.value);

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
      const decimalStartClass = decimalToggle.checked && index === 0 ? "decimal-start" : "";
      const total = place.value < 1 ? formatDecimal(digits[index] * place.value) : formatNumber(digits[index] * place.value);

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
    .map((entry) => (decimalToggle.checked ? formatNumber(entry, DECIMAL_PRECISION) : formatNumber(entry)));

  expandedForm.textContent = parts.length ? parts.join(" + ") : "0";
}

function createBlockRows(digits) {
  const places = getCurrentPlaces();
  blockRows.innerHTML = "";

  places.forEach((place, index) => {
    const digit = digits[index];
    const total = digit * place.value;
    const placeValueText = place.value < 1 ? formatDecimal(place.value) : formatNumber(place.value);
    const totalText = place.value < 1 ? formatNumber(total, DECIMAL_PRECISION) : formatNumber(total);

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
        <p class="block-total">${digit} x ${placeValueText} = ${totalText}</p>
      </div>
      <div class="block-items">${cubes}</div>
    `;

    blockRows.appendChild(row);
  });
}

function updateExplorer(rawValue) {
  const value = parseInputValue(rawValue);
  numberInput.value = decimalToggle.checked ? value.toFixed(DECIMAL_PRECISION) : String(Math.floor(value));

  const digits = getDigitsByMode(value);

  prettyNumber.textContent = decimalToggle.checked
    ? formatNumber(value, DECIMAL_PRECISION)
    : formatNumber(value);
  numberWords.textContent = numberToWords(value);

  createPlaceTable(digits);
  createExpandedForm(digits);
  createBlockRows(digits);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function syncModeUI() {
  if (decimalToggle.checked) {
    numberInputLabel.textContent = "Enter a decimal (0.00000 to 0.99999)";
    modeToggleText.textContent = "Mode: Decimal Only (switch to Whole Number)";
    numberInput.step = "0.00001";
    numberInput.max = "0.99999";
    numberInput.min = "0";
  } else {
    numberInputLabel.textContent = "Enter a whole number (0 to 9,999,999)";
    modeToggleText.textContent = "Mode: Whole Number (switch to Decimal Only, 5 places)";
    numberInput.step = "1";
    numberInput.max = "9999999";
    numberInput.min = "0";
  }
}

numberInput.addEventListener("input", (event) => {
  updateExplorer(event.target.value);
});

randomBtn.addEventListener("click", () => {
  const randomValue = decimalToggle.checked
    ? Math.round(Math.random() * (DECIMAL_SCALE - 1)) / DECIMAL_SCALE
    : randomInt(0, 9999999);
  updateExplorer(randomValue);
});

decimalToggle.addEventListener("change", () => {
  const current = Number(numberInput.value) || 0;
  if (decimalToggle.checked) {
    numberInput.value = (current % 1).toFixed(DECIMAL_PRECISION);
  } else {
    numberInput.value = String(Math.floor(current));
  }
  syncModeUI();
  updateExplorer(numberInput.value);
});

syncModeUI();
updateExplorer(numberInput.value);
