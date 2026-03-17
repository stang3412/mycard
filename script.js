// ── Theme toggle ──────────────────────────────────────────
function toggleTheme(cb) {
  const isDark = cb.checked;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

(function () {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.checked = true;
  }
})();

// ── Image handling ────────────────────────────────────────
function loadImg(e, input) {
  const file = e.target.files[0];
  if (!file) return;
  const cell = input.closest('.cell');
  const reader = new FileReader();
  reader.onload = ev => {
    cell.querySelector('.cell-img').src = ev.target.result;
    cell.classList.add('has-image');
  };
  reader.readAsDataURL(file);
}

function rmImg(e, btn) {
  e.stopPropagation();
  const cell = btn.closest('.cell');
  cell.querySelector('.cell-img').src = '';
  cell.classList.remove('has-image');
  cell.querySelector('.cell-file').value = '';
}

// ── Clear all ─────────────────────────────────────────────
function clearAll() {
  document.querySelectorAll('input[type="text"], input[type="number"]').forEach(el => el.value = '');
  document.querySelectorAll('select').forEach(el => el.value = '');
  document.querySelectorAll('.cell.has-image').forEach(cell => {
    cell.querySelector('.cell-img').src = '';
    cell.classList.remove('has-image');
    cell.querySelector('.cell-file').value = '';
  });
}

// ── Save Image ────────────────────────────────────────────
function saveImage() {
  const card = document.querySelector('.card');
  const overlayElements = document.querySelectorAll('.cell-rm, .cell-file, .theme-toggle');
  const actions = document.querySelector('.actions');
  const nameInput = document.getElementById('nameInput');

  // Workaround: html2canvas clips italic text in <input> tags. 
  // We temporarily replace the input with a <div> for the screenshot.
  const nameDiv = document.createElement('div');
  nameDiv.textContent = nameInput.value || nameInput.placeholder;
  
  const compStyle = window.getComputedStyle(nameInput);
  nameDiv.style.fontFamily = compStyle.fontFamily;
  nameDiv.style.fontStyle = compStyle.fontStyle;
  nameDiv.style.fontSize = compStyle.fontSize;
  nameDiv.style.fontWeight = compStyle.fontWeight;
  nameDiv.style.color = nameInput.value ? compStyle.color : 'var(--placeholder)';
  nameDiv.style.borderBottom = compStyle.borderBottom;
  nameDiv.style.width = compStyle.width;
  nameDiv.style.padding = compStyle.padding;
  nameDiv.style.lineHeight = compStyle.lineHeight;
  nameDiv.style.minHeight = compStyle.minHeight;
  nameDiv.style.boxSizing = 'border-box';
  nameDiv.style.display = 'block';
  nameDiv.style.whiteSpace = 'nowrap';
  nameDiv.style.overflow = 'visible';
  // Slight padding inside to ensure the left hook of "N" isn't cut off by the div bounds
  nameDiv.innerHTML = `<span style="display:inline-block; transform:translateX(2px);">${nameDiv.textContent}</span>`;

  nameInput.style.display = 'none';
  nameInput.parentNode.insertBefore(nameDiv, nameInput);

  // Hide UI elements that shouldn't be in the screenshot
  overlayElements.forEach(el => el.style.opacity = '0');
  actions.style.display = 'none';
  card.classList.add('export-mode');

  // Small delay to ensure styles are applied
  setTimeout(() => {
    html2canvas(card, {
      scale: 2,
      useCORS: true,
      backgroundColor: null // transparent background for rounded corners
    }).then(canvas => {
      // Restore UI elements
      overlayElements.forEach(el => el.style.opacity = '');
      actions.style.display = '';
      card.classList.remove('export-mode');
      
      // Restore input element
      nameDiv.remove();
      nameInput.style.display = 'block';

      // Trigger download
      const link = document.createElement('a');
      link.download = 'my-cards.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }, 100);
}