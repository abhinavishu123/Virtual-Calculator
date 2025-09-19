// Calculator logic
let display = document.getElementById('display');
let currentInput = '';
let historyList = document.getElementById('historyList');

function updateDisplay(value) {
    display.textContent = value || '0';
}

function appendToDisplay(val) {
    currentInput += val;
    updateDisplay(currentInput);
}

function clearDisplay() {
    currentInput = '';
    updateDisplay(currentInput);
}

function deleteLast() {
    currentInput = currentInput.slice(0, -1);
    updateDisplay(currentInput);
}

function calculate() {
    try {
        // eslint-disable-next-line no-eval
        let result = eval(currentInput);
        addToHistory(currentInput, result);
        currentInput = result.toString();
        updateDisplay(currentInput);
    } catch {
        updateDisplay('Error');
        currentInput = '';
    }
}

function addToHistory(expr, result) {
    let item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span class="history-expression">${expr}</span>
                      <span class="history-result">${result}</span>`;
    historyList.prepend(item);
}

// Image upload and OCR logic
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const processButton = document.getElementById('processButton');
const extractedTextDiv = document.getElementById('extractedText');
const detectedExpressionDiv = document.getElementById('detectedExpression');
const loadingDiv = document.getElementById('loading');
const errorMessageDiv = document.getElementById('errorMessage');

let ocrText = '';

uploadArea.addEventListener('click', () => imageInput.click());
uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleImage(e.dataTransfer.files[0]);
    }
});
imageInput.addEventListener('change', e => {
    if (e.target.files.length) {
        handleImage(e.target.files[0]);
    }
});

function handleImage(file) {
    errorMessageDiv.style.display = 'none';
    if (!file.type.startsWith('image/')) {
        errorMessageDiv.textContent = 'Please upload a valid image file.';
        errorMessageDiv.style.display = 'block';
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        processButton.style.display = 'block';
        extractedTextDiv.style.display = 'none';
        ocrText = '';
    };
    reader.readAsDataURL(file);
}

processButton.addEventListener('click', () => {
    errorMessageDiv.style.display = 'none';
    extractedTextDiv.style.display = 'none';
    loadingDiv.style.display = 'block';
    Tesseract.recognize(
        imagePreview.src,
        'eng'
    ).then(({ data: { text } }) => {
        loadingDiv.style.display = 'none';
        ocrText = text.replace(/\s+/g, '');
        detectedExpressionDiv.textContent = ocrText;
        extractedTextDiv.style.display = 'block';
        processButton.disabled = false;
        // Optionally, auto-calculate
        if (ocrText) {
            try {
                // eslint-disable-next-line no-eval
                let result = eval(ocrText);
                addToHistory(ocrText, result);
                display.textContent = result;
            } catch {
                display.textContent = 'Error';
            }
        }
    }).catch(err => {
        loadingDiv.style.display = 'none';
        errorMessageDiv.textContent = 'Failed to process image.';
        errorMessageDiv.style.display = 'block';
    });
});