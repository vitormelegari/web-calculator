addEventListener("load", () => {
  setupNumberButtons();
  setupOperatorButtons();
  setupUtilityButtons();
  setupAdvancedMathButtons();
});

function setupNumberButtons() {
  const numberButtons = document.querySelectorAll(
    '#num-pad .btn[data-type="number"]'
  );
  numberButtons.forEach((btn) =>
    btn.addEventListener("click", () => appendDigit(btn.dataset.value))
  );

  const decimal = document.querySelector('.btn[data-type="decimal"]');
  decimal.addEventListener("click", () => appendDigit(decimal.dataset.value));

  const toggleSignButton = document.querySelector(
    '.btn[data-action="toggle-sign"]'
  );
  toggleSignButton.addEventListener("click", toggleSign);
}

function setupAdvancedMathButtons() {
  const advancedMathButtons = document.querySelectorAll("#advanced-math .btn");
  advancedMathButtons.forEach((btn) =>
    btn.addEventListener("click", () =>
      advancedMath(currentInput, btn.dataset.operation)
    )
  );
  return advancedMathButtons;
}

function setupUtilityButtons() {
  const percentBtn = document.querySelector("#utility-btns .btn.percent");
  const clearBtn = document.querySelector("#utility-btns .btn.clear-entry");
  const clearAllBtn = document.querySelector("#utility-btns .btn.clear-all");
  const backspaceBtn = document.querySelector("#utility-btns .btn.delete");

  percentBtn.addEventListener("click", calculatePercent);
  clearBtn.addEventListener("click", clearEntry);
  clearAllBtn.addEventListener("click", clearAll);
  backspaceBtn.addEventListener("click", deleteDigit);
}

let expressionDisplay = document.getElementById("expression-display");
let resultDisplay = document.getElementById("result-display");

let firstOperand = null;
let secondOperand = null;
let currentInput = "0";
let activeOperator = null;
let isNewEntry = false;
let isOperationDone = false;

const digitLimit = 10;

function appendDigit(digit) {
  if (shouldIgnoreDigit(digit)) return;

  if (expressionDisplay.textContent.includes("(")) {
    isOperationDone = true;
  }

  if (isNewEntry || currentInput === "0") {
    if (isOperationDone) {
      updateExpressionDisplay();
      clearAll();
      isOperationDone = false;
    }
    currentInput = digit === "." ? "0." : digit;
    isNewEntry = false;
  } else {
    currentInput += digit;
  }

  updateResultDisplay(currentInput);
}

function shouldIgnoreDigit(digit) {
  return (
    (hasMaxDigits(currentInput) && !isNewEntry && digit !== ".") ||
    (hasDecimal() && digit === ".") ||
    (currentInput === "0" && digit === "0")
  );
}

function assignInputToOperand() {
  const value = currentInput.includes("e")
    ? currentInput
    : Number(currentInput);
  if (firstOperand === null || isOperationDone)
    (firstOperand = value), (isNewEntry = true);
  else if (secondOperand === null) {
    secondOperand = value;
  } else {
    secondOperand = value;
  }
}

function setOperator(operator) {
  activeOperator = operator;
}

function setupOperatorButtons() {
  const operatorButtons = document.querySelectorAll(
    '.btn[data-type="operator"]'
  );
  operatorButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      assignInputToOperand();

      if (isDivisionByZero()) {
        divisionByZeroAction();
        return;
      } else {
        handleOperator();
        setOperator(btn.dataset.operator);
        updateExpressionDisplay(firstOperand, activeOperator);
      }
    })
  );

  const calculateButton = document.querySelector(
    '.btn[data-action="calculate"]'
  );
  calculateButton.addEventListener("click", () => {
    assignInputToOperand();
    handleEquals();
  });
}

function handleEquals() {
  if (isDivisionByZero()) {
    divisionByZeroAction();
    return;
  }

  if (activeOperator === "=") return;

  if (!activeOperator && !isDivisionByZero()) {
    setOperator("=");
    updateExpressionDisplay(firstOperand, activeOperator);
    return;
  }

  const result = calculateResult();
  currentInput = String(result);

  if (result > 9.999999998e18) {
    alert("Error: Number too large!");
    clearAll();
    return;
  }
  updateExpressionDisplay(firstOperand, activeOperator, secondOperand, true);
  updateResultDisplay(currentInput);
  assignInputToOperand();
  isOperationDone = true;
  isNewEntry = true;
}

function calculateResult() {
  const operations = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "÷": (a, b) => a / b,
    "×": (a, b) => a * b,
  };

  const a =
    typeof firstOperand === "string" ? Number(firstOperand) : firstOperand;
  const b =
    typeof secondOperand === "string" ? Number(secondOperand) : secondOperand;

  result = Number(operations[activeOperator](a, b).toFixed(digitLimit - 1));

  if (result > 9 * Math.pow(10, digitLimit - 1)) {
    result = toScientificNotation(result);
  }

  return result;
}

function updateResultDisplay(result) {
  resultDisplay.textContent = result;
}

function updateExpressionDisplay(
  a = "",
  operator = "",
  b = "",
  showEquals = false
) {
  let expressionToDisplay = `${a} ${operator} ${b} ${showEquals ? " =" : ""}`;
  expressionDisplay.textContent = expressionToDisplay;
}

function clearEntry() {
  currentInput = "0";
  updateResultDisplay(currentInput);
}

function clearAll() {
  firstOperand = null;
  secondOperand = null;
  currentInput = "0";
  expressionDisplay.textContent = "";
  isNewEntry = false;
  isOperationDone = false;
  activeOperator = "";
  updateResultDisplay(currentInput);
}

function deleteDigit() {
  if (currentInput.length === 1) {
    currentInput = "0";
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateResultDisplay(currentInput);
}

function hasMaxDigits(input) {
  let digitCount = input?.match(/\d/g)?.length;
  return digitCount >= digitLimit;
}

function hasDecimal() {
  return currentInput?.includes(".") && !isNewEntry;
}

function resetCurrentInput() {
  currentInput = "0";
}

function isDivisionByZero() {
  return secondOperand === 0 && activeOperator === "÷";
}

function divisionByZeroAction() {
  clearAll();
  updateResultDisplay(currentInput);
  updateExpressionDisplay();
  window.alert("Error: Cannot divide by zero");
}

function handleOperator() {
  if (!isNewEntry) {
    let result = calculateResult();
    firstOperand = result;
    currentInput = String(result);
    updateResultDisplay(result);
    isNewEntry = true;
  }
  isOperationDone = false;
}

function toggleSign() {
  if (Number(currentInput) > 0) {
    currentInput = "-" + currentInput;
  } else if (Number(currentInput) < 0) {
    currentInput = currentInput.slice(1);
  } else {
    return;
  }

  if (isOperationDone) {
    updateExpressionDisplay();
  }
  updateResultDisplay(currentInput);
}

function calculatePercent() {
  currentInput = Number(currentInput);
  currentInput = firstOperand * (currentInput / 100);
  currentInput = String(currentInput);
  secondOperand = currentInput;

  if (currentInput === "0") {
    assignInputToOperand();
    updateExpressionDisplay(firstOperand);
    updateResultDisplay(firstOperand);
    return;
  }

  updateExpressionDisplay(firstOperand, activeOperator, secondOperand);
  updateResultDisplay(currentInput);
}

function toScientificNotation(num) {
  let digitCount = String(Math.trunc(num)).length;
  let exponent = Math.pow(10, digitCount - 1);
  let coefficient = Number((num / exponent).toFixed(digitLimit - 1));

  if (String(coefficient).length === 1) coefficient += ".";

  return `${coefficient}e+${digitCount - 1}`;
}

function advancedMath(num, operation) {
  const operations = {
    "1/": (num) => 1 / num,
    "√": (num) => Math.sqrt(num),
    sqr: (num) => Math.pow(num, 2),
  };

  if (num === "0" && operation === "1/") {
    divisionByZeroAction();
    return "0";
  }

  if (num < 0 && operation === "√") {
    window.alert(
      "Error: the square root of a negative number is not a real number"
    );
    clearAll();
    return;
  }

  const result = Number(operations[operation](num).toFixed(digitLimit - 1));
  currentInput = String(result);
  const formatted = `${operation}(${num})`;

  if (!activeOperator || isOperationDone) {
    updateExpressionDisplay(formatted);
    activeOperator = null;
  } else {
    setOperator(activeOperator);
    updateExpressionDisplay(firstOperand, activeOperator, formatted);
  }

  if (secondOperand === null) {
    isOperationDone = true;
  }

  isNewEntry = true;
  updateResultDisplay(currentInput);
}
