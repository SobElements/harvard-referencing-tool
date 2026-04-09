// ============================================================================
// SCRIPT.JS - Main Accordion Functionality
// ============================================================================
// This file handles the accordion sections on tutorial pages.
// When a user clicks on a section title, it expands to show more content.

// Accordion functionality
// Creates clickable sections that expand and collapse when clicked
function initializeAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Get the content section (the text that will expand/collapse)
            const content = this.nextElementSibling;
            // Get the arrow icon that rotates when expanded
            const icon = this.querySelector('.accordion-icon');

            // Toggle the 'active' class to show/hide content and rotate the arrow
            content.classList.toggle('active');
            icon.classList.toggle('active');

            // Close other accordions so only one section is open at a time
            accordionHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    const otherContent = otherHeader.nextElementSibling;
                    const otherIcon = otherHeader.querySelector('.accordion-icon');
                    otherContent.classList.remove('active');
                    otherIcon.classList.remove('active');
                }
            });
        });
    });
}

// Initialize when page loads
// This runs the accordion setup as soon as the page is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAccordions();
    console.log('Harvard Referencing Tool loaded successfully');
});