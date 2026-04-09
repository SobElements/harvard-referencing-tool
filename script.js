// Accordion functionality
function initializeAccordions() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Get the content section
            const content = this.nextElementSibling;
            const icon = this.querySelector('.accordion-icon');
            
            // Toggle active class
            content.classList.toggle('active');
            icon.classList.toggle('active');
            
            // Close other accordions (optional - remove if you want multiple open)
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
document.addEventListener('DOMContentLoaded', function() {
    initializeAccordions();
    console.log('Harvard Referencing Tool loaded successfully');
});