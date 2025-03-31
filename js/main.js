document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                document.getElementById('nav-toggle').checked = false;
            }
        });
    });
    
    // Add active class to navigation based on current section
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    function highlightNav() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', highlightNav);
    
    // Add animation on scroll
    const animateElements = document.querySelectorAll('.feature-card, .step, .testimonial');
    
    function checkVisibility() {
        animateElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate');
            }
        });
    }
    
    // Add CSS class for animation
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .feature-card, .step, .testimonial {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            
            .feature-card.animate, .step.animate, .testimonial.animate {
                opacity: 1;
                transform: translateY(0);
            }
            
            .feature-card:nth-child(2), .step:nth-child(2) {
                transition-delay: 0.2s;
            }
            
            .feature-card:nth-child(3), .step:nth-child(3) {
                transition-delay: 0.4s;
            }
        </style>
    `);
    
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('load', checkVisibility);
});