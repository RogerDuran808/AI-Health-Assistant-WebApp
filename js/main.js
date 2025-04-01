document.addEventListener('DOMContentLoaded', function() {
    // Configuración de OAuth
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23QBN2&scope=activity+cardio_fitness+electrocardiogram+heartrate+irregular_rhythm_notifications+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&redirect_uri=https%3A%2F%2Flocalhost`;
    const fitbitLogin = document.getElementById("fitbit-login");
    if (fitbitLogin) {
        fitbitLogin.href = authUrl;
    }
    
    // Manejo de navegación SPA (Single Page Application)
    function showSection(sectionId) {
        // Ocultar todas las secciones (suponiendo que son divs con id)
        document.querySelectorAll('div[id]').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar la sección solicitada
        const sectionToShow = document.getElementById(sectionId);
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
        }
        
        // Actualizar la navegación activa (en la barra de navegación)
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            }
        });
        
        // Cerrar menú móvil si está abierto
        const navToggle = document.getElementById('nav-toggle');
        if (navToggle) {
            navToggle.checked = false;
        }
        
        // Scroll hacia arriba con efecto suave
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Mostrar sección inicial (home)
    showSection('home');
    
    // Configurar event listeners para la navegación
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetHash = this.getAttribute('href');
            const targetId = targetHash.substring(1);
            
            // Si existe una sección con el id indicado, se maneja como navegación SPA
            if (targetId && document.getElementById(targetId)) {
                showSection(targetId);
            } else if (targetHash && document.querySelector(targetHash)) {
                // Navegación interna dentro de la sección (smooth scrolling)
                const targetElement = document.querySelector(targetHash);
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Manejar la navegación mediante cambios en el hash de la URL
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showSection(hash);
        }
    });
    
    // Verificar el hash inicial (si se accede con un ancla en la URL)
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showSection(hash);
        }
    }
    
    // Animación en scroll para elementos con clases .feature-card, .step y .testimonial
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
    
    // Insertar estilos para la animación
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
