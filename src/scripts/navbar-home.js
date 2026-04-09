// ============================================================================
// NAVBAR-HOME.JS - Global Navigation Bar (Home Page Version)
// ============================================================================
// This file creates a navigation bar for the home page.
// It provides quick links and access to the style editor.

function createNavbar() {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';

    const navContent = document.createElement('div');
    navContent.className = 'navbar-content';

    // Brand
    const brand = document.createElement('span');
    brand.className = 'navbar-brand';
    brand.textContent = '📚 Harvard Referencing Tool';

    // Links container
    const links = document.createElement('div');
    links.className = 'navbar-links';

    // Style Editor button
    const styleEditorBtn = document.createElement('a');
    styleEditorBtn.className = 'navbar-button';
    styleEditorBtn.href = 'style-editor.html';
    styleEditorBtn.textContent = '🎨 Customize Styles';
    links.appendChild(styleEditorBtn);

    navContent.appendChild(brand);
    navContent.appendChild(links);
    navbar.appendChild(navContent);

    // Insert at top of body
    document.body.insertBefore(navbar, document.body.firstChild);

    // Adjust body padding
    document.body.style.paddingTop = '0';
}

// Create navbar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createNavbar);
} else {
    createNavbar();
}
