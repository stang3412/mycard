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
  
  // Custom dropdown clear logic
  document.querySelectorAll('.custom-select').forEach(custom => {
    const select = custom.parentNode.querySelector('select');
    if (select) {
      custom.querySelector('.custom-select-trigger span').textContent = select.options[0].text;
      custom.querySelectorAll('.custom-option').forEach((opt, i) => {
        if (i===0) opt.classList.add('selected');
        else opt.classList.remove('selected');
      });
    }
  });

  document.querySelectorAll('.cell.has-image').forEach(cell => {
    cell.querySelector('.cell-img').src = '';
    cell.classList.remove('has-image');
    cell.querySelector('.cell-file').value = '';
  });
}

// ── Save Image ────────────────────────────────────────────
function saveImage() {
  const card = document.querySelector('.card');
  const overlayElements = document.querySelectorAll('.cell-rm, .cell-file, .theme-toggle, .watermark-close');
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

// ── Custom Dropdown Initialization ───────────────────────────
(function initCustomSelects() {
  document.querySelectorAll('.select-wrap').forEach(wrap => {
    const select = wrap.querySelector('select');
    if (!select) return;
    
    // Hide original select
    select.style.display = 'none';
    wrap.classList.add('customized');
    
    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select';
    
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = `<span>${select.options[select.selectedIndex].text}</span><div class="arrow"></div>`;
    
    const optionsPanel = document.createElement('div');
    optionsPanel.className = 'custom-options';
    
    Array.from(select.options).forEach((opt, idx) => {
      const optDiv = document.createElement('div');
      optDiv.className = 'custom-option' + (opt.selected ? ' selected' : '');
      optDiv.dataset.value = opt.value;
      optDiv.textContent = opt.text;
      
      optDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        select.selectedIndex = idx;
        trigger.querySelector('span').textContent = opt.text;
        
        optionsPanel.querySelectorAll('.custom-option').forEach(el => el.classList.remove('selected'));
        optDiv.classList.add('selected');
        
        customSelect.classList.remove('open');
        const parentMeta = customSelect.closest('.meta-item');
        if (parentMeta) parentMeta.classList.remove('active-dropdown');
        
        select.dispatchEvent(new Event('change'));
      });
      optionsPanel.appendChild(optDiv);
    });
    
    customSelect.appendChild(trigger);
    customSelect.appendChild(optionsPanel);
    wrap.appendChild(customSelect);
    
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-select.open').forEach(el => {
        if (el !== customSelect) {
          el.classList.remove('open');
          const parent = el.closest('.meta-item');
          if (parent) parent.classList.remove('active-dropdown');
        }
      });
      const isOpen = customSelect.classList.toggle('open');
      const parentMeta = customSelect.closest('.meta-item');
      if (parentMeta) {
        if(isOpen) parentMeta.classList.add('active-dropdown');
        else parentMeta.classList.remove('active-dropdown');
      }
    });
  });
  
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select.open').forEach(el => {
      el.classList.remove('open');
      const parent = el.closest('.meta-item');
      if (parent) parent.classList.remove('active-dropdown');
    });
  });
})();

// ── Watermark ────────────────────────────────────────────────
function closeWatermark() {
  const wm = document.getElementById('watermark');
  if (wm) wm.style.display = 'none';
}