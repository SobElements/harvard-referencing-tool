// ============================================================================
// NAVBAR.JS - Global Navigation Bar
// ============================================================================
// This file creates a navigation bar that appears at the top of every page.
// It provides quick access to the home page, style editor, and key sections.

function createNavbar() {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';

    const navContent = document.createElement('div');
    navContent.className = 'navbar-content';

    // Brand/Home link
    const brand = document.createElement('a');
    brand.className = 'navbar-brand';
    brand.href = '../index.html';
    brand.textContent = '← Harvard Referencing Tool';

    // Links container
    const links = document.createElement('div');
    links.className = 'navbar-links';

    // Quick links
    const quickLinks = [
    
    ]; 

    quickLinks.forEach(link => {
        const a = document.createElement('a');
        a.className = 'navbar-link';
        a.href = link.href;
        a.textContent = link.label;
        links.appendChild(a);
    });

    // Style Editor button
    const styleEditorBtn = document.createElement('a');
    styleEditorBtn.className = 'navbar-button';
    styleEditorBtn.href = '../style-editor.html';
    styleEditorBtn.textContent = '🎨 Customize Styles';
    links.appendChild(styleEditorBtn);

    navContent.appendChild(brand);
    navContent.appendChild(links);
    navbar.appendChild(navContent);

    // Insert at top of body
    document.body.insertBefore(navbar, document.body.firstChild);

    // Adjust body padding to account for navbar
    document.body.style.paddingTop = '0';
}

// Create navbar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createNavbar);
} else {
    createNavbar();
}
