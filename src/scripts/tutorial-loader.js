// tutorial-loader.js
// Applies any admin overrides to tutorial accordion content from localStorage
// This script is loaded on every tutorial page and patches the DOM on load

function applyTutorialOverrides() {
    const raw = localStorage.getItem('harvardAdminTutorials');
    if (!raw) return;

    let allOverrides;
    try {
        allOverrides = JSON.parse(raw);
    } catch (e) {
        console.warn('tutorial-loader: Could not parse harvardAdminTutorials', e);
        return;
    }

    // Derive key from current filename, e.g. "book-tutorial.html"
    const filename = window.location.pathname.split('/').pop();
    const overrides = allOverrides[filename];
    if (!overrides || !Array.isArray(overrides)) return;

    const accordion = document.querySelector('.accordion');
    if (!accordion) return;

    const items = accordion.querySelectorAll('.accordion-item');

    // First, patch existing items
    overrides.forEach(function(override) {
        let item = items[override.index];

        if (item) {
            // Patch existing item
            const h3 = item.querySelector('.accordion-header h3');
            if (h3 && override.title != null) {
                h3.textContent = override.title;
            }

            const body = item.querySelector('.accordion-body');
            if (body && override.body != null) {
                body.innerHTML = override.body;
            }
        } else if (override.index === items.length) {
            // Create new item if it's the next sequential index
            const newItem = createAccordionItem(override.title, override.body);
            accordion.appendChild(newItem);
        }
    });
}

function createAccordionItem(title, body) {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.innerHTML = `
        <div class="accordion-header">
            <h3>${title}</h3>
            <span class="accordion-icon">▼</span>
        </div>
        <div class="accordion-content">
            <div class="accordion-body">${body}</div>
        </div>`;
    return item;
}

// Run after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTutorialOverrides);
} else {
    applyTutorialOverrides();
}
