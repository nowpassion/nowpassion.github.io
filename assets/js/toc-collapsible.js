/**
 * Table of Contents Collapsible Functionality
 * Makes ToC sub-items collapsible for better navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only run if ToC exists
    const toc = document.querySelector('.toc');
    if (!toc) return;
    
    // Find all ToC items that have sub-lists
    const tocItems = toc.querySelectorAll('.toc-item');
    
    tocItems.forEach(function(item, index) {
        const sublist = item.querySelector('.toc-sublist');
        if (sublist) {
            // Create a unique key for localStorage
            const storageKey = 'toc-item-' + index;
            
            // Create collapse toggle button
            const toggleBtn = document.createElement('span');
            toggleBtn.className = 'toc-toggle';
            toggleBtn.setAttribute('aria-label', 'Toggle sub-items');
            toggleBtn.setAttribute('role', 'button');
            toggleBtn.setAttribute('tabindex', '0');
            
            // Insert toggle button after the main link
            const mainLink = item.querySelector('.toc-link');
            if (mainLink) {
                mainLink.parentNode.insertBefore(toggleBtn, mainLink.nextSibling);
            }
            
            // Check localStorage for saved state, default to expanded
            const savedState = localStorage.getItem(storageKey);
            const isExpanded = savedState !== null ? savedState === 'true' : true;
            
            // Add event listeners for toggle
            function updateToggleState(expanded) {
                if (expanded) {
                    // Expand
                    sublist.classList.remove('collapsed');
                    toggleBtn.innerHTML = '−'; // Minus sign
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    localStorage.setItem(storageKey, 'true');
                } else {
                    // Collapse
                    sublist.classList.add('collapsed');
                    toggleBtn.innerHTML = '+'; // Plus sign
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    localStorage.setItem(storageKey, 'false');
                }
            }
            
            function toggleSublist() {
                const isCurrentlyExpanded = !sublist.classList.contains('collapsed');
                updateToggleState(!isCurrentlyExpanded);
            }
            
            // Click event
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleSublist();
            });
            
            // Keyboard event
            toggleBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSublist();
                }
            });
            
            // Initialize with saved or default state
            updateToggleState(isExpanded);
        }
    });
});