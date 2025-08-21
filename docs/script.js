
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const themeToggle = document.querySelector('.theme-toggle');
    const aboutSection = document.querySelector('#about');
    const techIcons = document.querySelectorAll('.tech-icon');
//---------------------------------------------------------------------------> system theme dark/light

// ----------------> initialize theme with system preference support
    function initTheme() {
// ----------------> check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
// ----------------> function to apply theme
        const applyTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            updateThemeToggleAriaLabel(theme);
            localStorage.setItem('portfolio-theme', theme);
        };

// ----------------> check if there is a saved theme
        const savedTheme = localStorage.getItem('portfolio-theme');
        
// ----------------> if no saved theme, use system preference
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            const systemTheme = prefersDark.matches ? 'dark' : 'light';
            applyTheme(systemTheme);
        }

// ----------------> listener for system theme changes
        const handleSystemThemeChange = (e) => {
// ----------------> apply only if user has no saved preference
            if (!localStorage.getItem('portfolio-theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                applyTheme(newTheme);
            }
        };

// ----------------> add listener for system theme changes
        prefersDark.addEventListener('change', handleSystemThemeChange);

// ----------------> return a function to clean up the listener when no longer needed
        return () => {
            prefersDark.removeEventListener('change', handleSystemThemeChange); // stop here 
        };
    }
    
// ----------------> initialize theme
    initTheme();
    
// ----------------> toggle theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme'); 
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
        updateThemeToggleAriaLabel(newTheme);
        
        // Feedback visual suave
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }
    
// ----------------> update aria-label of button
    function updateThemeToggleAriaLabel(theme) {
        if (themeToggle) {
            const label = theme === 'dark' 
                ? 'Alternar para modo claro' 
                : 'Alternar para modo escuro';
            themeToggle.setAttribute('aria-label', label);
            themeToggle.setAttribute('title', label);
        }
    }
    
// ----------------> event listener for toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
// ----------------> support for keyboard
        themeToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }
// -------------------------------------------------------------------> parallax
    
// ----------------> variables for parallax control
    let mouseX = 0;
    let mouseY = 0;
    let isInAboutSection = false;
    
// ----------------> function to apply parallax effect to icons
    function applyParallaxEffect(mouseX, mouseY, sectionRect) {
        techIcons.forEach((icon, index) => {
// ----------------> calculate relative mouse position in section (0 to 1)
            const relativeX = (mouseX - sectionRect.left) / sectionRect.width;
            const relativeY = (mouseY - sectionRect.top) / sectionRect.height;
            
// ----------------> different intensities for each icon (more natural)
            const intensityX = (index % 3 + 1) * 1.5; // Increased from 0.5 to 1.5
            const intensityY = (index % 2 + 1) * 0.9; // Increased from 0.3 to 0.9
            
// ----------------> calculate displacement with more pronounced movement
            const moveX = (relativeX - 0.5) * intensityX * 40; // Increased from 20 to 40
            const moveY = (relativeY - 0.5) * intensityY * 30; // Aumentado de 20 para 30
            
// ----------------> apply transformation with additional rotation based on movement
            const rotateX = (relativeY - 0.5) * 10; // Inclinação no eixo X
            const rotateY = (relativeX - 0.5) * -10; // Inclinação no eixo Y (negativo para efeito 3D)
            
// ----------------> apply combined transformations (parallax + 3D rotation)
            icon.style.transform = `
                translate3d(${moveX}px, ${moveY}px, 0)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
            `;
            
// ----------------> smooth transition
            icon.style.transition = 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
            
// ----------------> depth effect with scale based on distance from center
            const centerX = sectionRect.width / 2;
            const centerY = sectionRect.height / 2;
            const distanceX = Math.abs(mouseX - (sectionRect.left + centerX));
            const distanceY = Math.abs(mouseY - (sectionRect.top + centerY));
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
            const scale = 1 + (1 - Math.min(distance / maxDistance, 1)) * 0.2;
            
            icon.style.transform += ` scale(${scale})`;
            
// ----------------> effect of brightness based on mouse position
            const brightness = 1 + (1 - Math.min(distance / maxDistance, 1)) * 0.5;
            icon.style.filter = `drop-shadow(0 2px 4px rgba(0,0,0,0.3)) brightness(${brightness})`;
        });
    }
    
// ----------------> function to reset icon positions
    function resetIconsPosition() {
        techIcons.forEach(icon => {
// ----------------> reset transform, keep CSS animation active
            icon.style.transform = 'translate(0px, 0px)';
            icon.style.transition = 'transform 0.3s ease-out';
        });
    }
    
// ----------------> debug: verify if elements were found
    console.log('About Section:', aboutSection);
    console.log('Tech Icons:', techIcons.length);
    
// ----------------> event listener for mouse movement in about section
    if (aboutSection && techIcons.length > 0) {
// ----------------> mouse enters section
        aboutSection.addEventListener('mouseenter', function() {
            isInAboutSection = true;
        });
        
// ----------------> mouse leaves section
        aboutSection.addEventListener('mouseleave', function() {
            isInAboutSection = false;
            resetIconsPosition();
        });
        
// ----------------> optimization: variables for performance control
    let lastTime = 0;
    const throttleDelay = 16; // ~60fps
    
// ----------------> mouse movement in section
    aboutSection.addEventListener('mousemove', function(e) {
        if (!isInAboutSection) return;
        
// ----------------> throttling for better performance
        const now = Date.now();
        if (now - lastTime < throttleDelay) return;
        lastTime = now;
        
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        const sectionRect = aboutSection.getBoundingClientRect();
        
// ----------------> apply parallax effect using requestAnimationFrame for better performance
        if (!window.requestId) {
            window.requestId = requestAnimationFrame(() => {
                applyParallaxEffect(mouseX, mouseY, sectionRect);
                window.requestId = null;
            });
        }
    });
// ----------------> touch support
        aboutSection.addEventListener('touchmove', function(e) {
            if (!isInAboutSection || !e.touches[0]) return;
            
            const touch = e.touches[0];
            mouseX = touch.clientX;
            mouseY = touch.clientY;
            
            const sectionRect = aboutSection.getBoundingClientRect();
            
            requestAnimationFrame(() => {
                applyParallaxEffect(mouseX, mouseY, sectionRect);
            });
        });
        
// ----------------> reset icons position
        aboutSection.addEventListener('touchend', function() {
            resetIconsPosition();
        });
    }

 // ----------------------------------------------------------------------------------------------->mobile navigation
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            
// ----------------> toggle menu
            navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', !isExpanded);
            
// ----------------> hamburger animation
            const hamburgers = navToggle.querySelectorAll('.hamburger');
            hamburgers.forEach((line, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) line.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) line.style.opacity = '0';
                    if (index === 2) line.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    line.style.transform = 'none';
                    line.style.opacity = '1';
                }
            });
        });

// ----------------> close menu on click link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                const hamburgers = navToggle.querySelectorAll('.hamburger');
                hamburgers.forEach(line => {
                    line.style.transform = 'none';
                    line.style.opacity = '1';
                });
            });
        });

// ----------------> close menu on click outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                
                const hamburgers = navToggle.querySelectorAll('.hamburger');
                hamburgers.forEach(line => {
                    line.style.transform = 'none';
                    line.style.opacity = '1';
                });
            }
        });
    }

    // ---------------------------------------------------------------------------------> scroll smooth and active navigation
    
    //-------------------------------> update active nav link
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
 // ----------------> update active nav link
                navLinks.forEach(link => link.classList.remove('active'));
 // ----------------> update active nav link
                if (navLink) navLink.classList.add('active');
            }
        });
    }

    // -----------------------> scroll listener
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                updateActiveNavLink();
                ticking = false;
            });
            ticking = true;
        }
    });

// ----------------------------------------------------------> animations
    
// ---------------------------------> intersection observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    const animatedElements = document.querySelectorAll('.project-card, .skill-item, .contact-link');
    animatedElements.forEach(el => observer.observe(el));




// ----------------------------------------------------------------> utils and performance
    function _debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

// -----------------------> lazy load images
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

// -----------------------> lazy load images
    lazyLoadImages();

// ----------------------------------------------------------------> accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.focus();
        }
    });

// -----------------------> trap focus
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

// -----------------------> trap focus
    const navMenuObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu.classList.contains('active')) {
                    trapFocus(navMenu);
                }
            }
        });
    });

    if (navMenu) {
        navMenuObserver.observe(navMenu, { attributes: true });
    }

// -----------------------> initialization
    updateActiveNavLink();
    
// -----------------------> Add class js-loaded
    document.body.classList.add('js-loaded');
    
    console.log('Portfolio JavaScript carregado com sucesso! 🚀');
});
// -----------------------> language toggle
const symbolToggle = document.querySelector('.header-icon');
const languageButtons = Array.from(document.getElementsByClassName('language-buttons'));
function handleClickButtonLanguage(list = []) {
    if (!symbolToggle  || !languageButtons) return;

    list.forEach( b => {
        b.classList.toggle('languageButtons-active');
    });
}
symbolToggle.addEventListener('click', () => handleClickButtonLanguage(languageButtons));
