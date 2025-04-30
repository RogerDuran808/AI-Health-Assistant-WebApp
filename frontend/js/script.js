document.addEventListener('DOMContentLoaded', function() {
    // Configuración de OAuth
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23QBN2&scope=activity+cardio_fitness+electrocardiogram+heartrate+irregular_rhythm_notifications+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&redirect_uri=https%3A%2F%2Flocalhost`;
    const fitbitLogin = document.getElementById("fitbit-login");
    if (fitbitLogin) {
        fitbitLogin.href = authUrl;
    }
    
    // Inicializar secciones:
    // Mostrar 'home' y ocultar todas las demás (incluida 'features')
    document.querySelectorAll('div[id]').forEach(section => {
        if (section.id === 'home') {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
    
    // Función para revelar la sección de 'features'
    function revealFeatures() {
        const featuresSection = document.getElementById('features');
        if (featuresSection && featuresSection.style.display === 'none') {
            featuresSection.style.display = 'block';
            // Una vez visible, comprobamos la visibilidad de sus elementos para animarlos
            checkVisibility();
        }
        window.scrollTo({
            top: featuresSection.offsetTop - 80,
            behavior: 'smooth'
        });
        // Actualizar navegación activa para 'features'
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#features') {
                link.classList.add('active');
            }
        });
    }
    
    // Función para mostrar otra sección (distinta de features)
    function showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('div[id]').forEach(section => {
            section.style.display = 'none';
        });
        const target = document.getElementById(sectionId);
        if (target) {
            target.style.display = 'block';
        }
        // Actualizar navegación activa
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            }
        });
        // Desplazarse hacia arriba con efecto suave
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    // Mostrar seccion actual
    showSection('home')

    // Configurar event listeners para la navegación
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetHash = this.getAttribute('href');
            const targetId = targetHash.substring(1);
            
            if (targetId === 'features') {
                // Al hacer clic en "conocer más"
                revealFeatures();
            } else if (targetId && document.getElementById(targetId)) {
                showSection(targetId);
            } else if (targetHash && document.querySelector(targetHash)) {
                // Navegación interna dentro de la misma sección
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
            if (hash === 'features') {
                revealFeatures();
            } else {
                showSection(hash);
            }
        }
    });
    
    // Verificar el hash inicial (si se accede con un ancla en la URL)
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            if (hash === 'features') {
                revealFeatures();
            } else {
                showSection(hash);
            }
        }
    }
    
    // Si el usuario desliza (scroll) más allá de 'home', se revela 'features'
    window.addEventListener('scroll', function() {
        const featuresSection = document.getElementById('features');
        const homeSection = document.getElementById('home');
        if (featuresSection && homeSection && featuresSection.style.display === 'none') {
            if (window.scrollY > homeSection.offsetHeight - 80) {
                featuresSection.style.display = 'block';
                checkVisibility();
            }
        }
        checkVisibility();
    });
    
    // Animación en scroll para elementos con clases .feature-card, .step y .testimonial
    const animateElements = document.querySelectorAll('.feature-card, .step, .testimonial');
    
    function checkVisibility() {
        animateElements.forEach(element => {
            // Solo se aplica la animación si el elemento (y su contenedor) son visibles
            if (window.getComputedStyle(element).display !== 'none') {
                const elementPosition = element.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                if (elementPosition < screenPosition) {
                    element.classList.add('animate');
                }
            }
        });
    }
    
    // Insertar estilos para la animación (solo efecto de aparición)
    document.head.insertAdjacentHTML('beforeend', `
        <style> static/css/styles.css </style>
    `);
});
