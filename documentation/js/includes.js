// Function to load HTML content into placeholders
function loadComponent(placeholderId, componentPath) {
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) {
        fetch(componentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                placeholder.innerHTML = html;
                
                // Reinitialize Bootstrap components after loading
                if (typeof bootstrap !== 'undefined') {
                    // Reinitialize tooltips
                    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                    tooltipTriggerList.map(function (tooltipTriggerEl) {
                        return new bootstrap.Tooltip(tooltipTriggerEl);
                    });
                    
                    // Reinitialize popovers
                    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
                    popoverTriggerList.map(function (popoverTriggerEl) {
                        return new bootstrap.Popover(popoverTriggerEl);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading component:', error);
                placeholder.innerHTML = `<div class="alert alert-warning">Error loading component: ${componentPath}</div>`;
            });
    }
}

// Function to set active navigation based on current page
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

// Function to handle mobile sidebar toggle
function initializeSidebar() {
    const sidebarToggle = document.querySelector('.navbar-toggler');
    const sidebar = document.getElementById('sidebarMenu');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
}

// Load all components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Determine the correct path based on current page location
    const currentPath = window.location.pathname;
    const isInPagesDirectory = currentPath.includes('/pages/');
    const basePath = isInPagesDirectory ? '../' : '';
    
    // Load header
    loadComponent('header-placeholder', basePath + 'include/header.html');
    
    // Load sidebar
    loadComponent('sidebar-placeholder', basePath + 'include/sidebar.html');
    
    // Load footer
    loadComponent('footer-placeholder', basePath + 'include/footer.html');
    
    // Set active navigation after components are loaded
    setTimeout(() => {
        setActiveNavigation();
        initializeSidebar();
    }, 100);
});

// Handle page navigation and update active states
window.addEventListener('popstate', function() {
    setTimeout(() => {
        setActiveNavigation();
    }, 100);
});

// Add smooth scrolling for anchor links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.hash) {
        e.preventDefault();
        const target = document.querySelector(e.target.hash);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.navbar-nav .nav-link[title="Search"]');
    if (searchInput) {
        searchInput.addEventListener('click', function(e) {
            e.preventDefault();
            const searchTerm = prompt('Enter search term:');
            if (searchTerm) {
                // Implement search functionality here
                console.log('Searching for:', searchTerm);
            }
        });
    }
}

// Initialize search after components are loaded
setTimeout(() => {
    initializeSearch();
}, 200); 