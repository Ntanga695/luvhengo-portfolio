// === LOADING SCREEN ===
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        initAnimations();
    }, 1800);
});

// === CUSTOM CURSOR ===
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
    follower.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
});

document.querySelectorAll('a, button, .btn-primary, .btn-outline, .project-card, .skill-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform += ' scale(2)';
        follower.style.width = '60px';
        follower.style.height = '60px';
        follower.style.borderColor = 'rgba(230, 57, 116, 0.5)';
    });
    el.addEventListener('mouseleave', () => {
        follower.style.width = '40px';
        follower.style.height = '40px';
        follower.style.borderColor = '';
    });
});

// === THREE.JS NEURAL NETWORK PARTICLE BACKGROUND ===
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        const color = new THREE.Color();
        color.setHSL(0.93 + Math.random() * 0.07, 0.8, 0.5 + Math.random() * 0.3);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        velocities.push({
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Connection lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * particleCount * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xe63974,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    camera.position.z = 8;

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);

        const posArray = geometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            posArray[i * 3] += velocities[i].x;
            posArray[i * 3 + 1] += velocities[i].y;
            posArray[i * 3 + 2] += velocities[i].z;

            // Boundary check
            if (Math.abs(posArray[i * 3]) > 10) velocities[i].x *= -1;
            if (Math.abs(posArray[i * 3 + 1]) > 10) velocities[i].y *= -1;
            if (Math.abs(posArray[i * 3 + 2]) > 10) velocities[i].z *= -1;
        }
        geometry.attributes.position.needsUpdate = true;

        // Update connections
        let lineIndex = 0;
        const linePos = lines.geometry.attributes.position.array;
        const maxConnections = 150;
        let connections = 0;

        for (let i = 0; i < particleCount && connections < maxConnections; i++) {
            for (let j = i + 1; j < particleCount && connections < maxConnections; j++) {
                const dx = posArray[i * 3] - posArray[j * 3];
                const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
                const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < 2) {
                    linePos[lineIndex++] = posArray[i * 3];
                    linePos[lineIndex++] = posArray[i * 3 + 1];
                    linePos[lineIndex++] = posArray[i * 3 + 2];
                    linePos[lineIndex++] = posArray[j * 3];
                    linePos[lineIndex++] = posArray[j * 3 + 1];
                    linePos[lineIndex++] = posArray[j * 3 + 2];
                    connections++;
                }
            }
        }
        
        // Clear unused line positions
        for (let i = lineIndex; i < linePos.length; i++) {
            linePos[i] = 0;
        }
        lines.geometry.attributes.position.needsUpdate = true;

        // Mouse interaction
        particles.rotation.x += 0.001;
        particles.rotation.y += 0.001;
        particles.rotation.x += mouseY * 0.0005;
        particles.rotation.y += mouseX * 0.0005;

        lines.rotation.x = particles.rotation.x;
        lines.rotation.y = particles.rotation.y;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// === TYPED TEXT EFFECT ===
function initTypedText() {
    const phrases = [
        'scalable enterprise solutions.',
        'full-stack web applications.',
        'AI-powered software.',
        'clean & maintainable code.',
        'RESTful API systems.',
        'database-driven platforms.'
    ];
    
    const typedEl = document.getElementById('typed-text');
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typedEl.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40;
        } else {
            typedEl.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    type();
}

// === GSAP ANIMATIONS ===
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero content entrance
    gsap.from('.hero-badge', { opacity: 0, y: 30, duration: 0.8, delay: 0.2 });
    gsap.from('.hero-title .line', { opacity: 0, y: 50, duration: 0.8, stagger: 0.2, delay: 0.4 });
    gsap.from('.typed-wrapper', { opacity: 0, y: 30, duration: 0.8, delay: 0.8 });
    gsap.from('.hero-description', { opacity: 0, y: 30, duration: 0.8, delay: 1 });
    gsap.from('.hero-cta', { opacity: 0, y: 30, duration: 0.8, delay: 1.2 });
    gsap.from('.hero-stats .stat', { opacity: 0, y: 30, duration: 0.6, stagger: 0.15, delay: 1.4 });
    gsap.from('.scroll-indicator', { opacity: 0, duration: 1, delay: 2 });

    // Counter animation
    document.querySelectorAll('.stat-number').forEach(stat => {
        const target = parseInt(stat.dataset.count);
        gsap.to(stat, {
            textContent: target,
            duration: 2,
            delay: 1.5,
            snap: { textContent: 1 },
            ease: 'power1.out'
        });
    });

    // Scroll-triggered animations using fromTo to avoid invisible state
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.fromTo(header, 
            { opacity: 0, y: 50 },
            { scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' }, opacity: 1, y: 0, duration: 0.8 }
        );
    });

    gsap.fromTo('.about-text', 
        { opacity: 0, x: -50 },
        { scrollTrigger: { trigger: '.about-grid', start: 'top 85%', toggleActions: 'play none none none' }, opacity: 1, x: 0, duration: 0.8 }
    );
    gsap.fromTo('.about-visual', 
        { opacity: 0, x: 50 },
        { scrollTrigger: { trigger: '.about-grid', start: 'top 85%', toggleActions: 'play none none none' }, opacity: 1, x: 0, duration: 0.8 }
    );

    gsap.utils.toArray('.highlight-item').forEach((item, i) => {
        gsap.fromTo(item, 
            { opacity: 0, x: -30 },
            { scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' }, opacity: 1, x: 0, duration: 0.6, delay: i * 0.1 }
        );
    });

    gsap.utils.toArray('.skill-card').forEach((card, i) => {
        gsap.fromTo(card, 
            { opacity: 0, y: 40 },
            { scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' }, opacity: 1, y: 0, duration: 0.6, delay: i * 0.1 }
        );
    });

    gsap.utils.toArray('.exp-item').forEach((item, i) => {
        gsap.fromTo(item, 
            { opacity: 0, x: -40 },
            { scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' }, opacity: 1, x: 0, duration: 0.7, delay: i * 0.1 }
        );
    });

    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.fromTo(card, 
            { opacity: 0, y: 50 },
            { scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' }, opacity: 1, y: 0, duration: 0.7, delay: i * 0.1 }
        );
    });

    gsap.utils.toArray('.ai-card').forEach((card, i) => {
        gsap.fromTo(card, 
            { opacity: 0, y: 40, scale: 0.95 },
            { scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' }, opacity: 1, y: 0, scale: 1, duration: 0.7, delay: i * 0.1 }
        );
    });

    gsap.utils.toArray('.contact-card').forEach((card, i) => {
        gsap.fromTo(card, 
            { opacity: 0, y: 30 },
            { scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: 'play none none none' }, opacity: 1, y: 0, duration: 0.6, delay: i * 0.1 }
        );
    });

    gsap.fromTo('.resume-cta', 
        { opacity: 0, y: 40 },
        { scrollTrigger: { trigger: '.resume-section', start: 'top 85%', toggleActions: 'play none none none' }, opacity: 1, y: 0, duration: 0.8 }
    );
}

// === NAVIGATION ===
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-links');

// Scroll effect
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    
    // Active link based on scroll
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        if (window.scrollY >= top) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Mobile toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
    });
});

// === VANILLA TILT INIT ===
VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
    max: 8,
    speed: 400,
    glare: true,
    "max-glare": 0.15,
    perspective: 1000
});

// === DARK/LIGHT THEME TOGGLE ===
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

// === INITIALIZE ===
initThreeJS();
initTypedText();
initThemeToggle();
