document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('show');
            mobileMenuBtn.querySelector('.hamburger').textContent = isExpanded ? '☰' : '✕';
        });

        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) && mobileMenu.classList.contains('show')) {
                mobileMenu.classList.remove('show');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.querySelector('.hamburger').textContent = '☰';
            }
        });
    }

    // Navigation Scroll Effect
    const nav = document.querySelector('nav');
    function handleNavScroll() {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    }
    window.addEventListener('scroll', handleNavScroll);

    // Ripple Effect on Buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, .btn, a[class*="bg-"]')) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${e.clientX - e.target.getBoundingClientRect().left}px`;
            ripple.style.top = `${e.clientY - e.target.getBoundingClientRect().top}px`;
            e.target.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        }
    });

    // Search Box Focus Behavior (Mobile)
    const searchBox = document.getElementById('internship-search');
    if (searchBox) {
        searchBox.addEventListener('focus', () => {
            if (window.innerWidth < 768) searchBox.style.width = '100%';
        });
        searchBox.addEventListener('blur', () => {
            if (window.innerWidth < 768) searchBox.style.width = '';
        });
    }

    // Hero Title Parallax Effect
    const heroTitle = document.querySelector('.hero-gradient');
    if (heroTitle) {
        window.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            heroTitle.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    // Counter Animation for Stats
    document.querySelectorAll('.stat-item h3').forEach(el => {
        const target = parseInt(el.textContent);
        let frame = 0;
        const totalFrames = 60;
        const increment = target / totalFrames;
        const counter = setInterval(() => {
            frame++;
            el.textContent = Math.round(increment * frame);
            if (frame >= totalFrames) {
                el.textContent = target;
                clearInterval(counter);
            }
        }, 33);
    });

    // Responsive Internship Cards
    function handleResize() {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.internship-card').forEach(card => {
                card.style.transition = 'all 0.3s ease';
            });
        }
    }
    handleResize();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 250);
    });

    // Modal Transition Optimization
    const modal = document.getElementById('details-modal');
    const modalContent = document.getElementById('modal-content');
    if (modal && modalContent) {
        modal.addEventListener('transitionstart', () => {
            modalContent.style.willChange = 'transform, opacity';
        });
        modal.addEventListener('transitionend', () => {
            modalContent.style.willChange = 'auto';
        });
    }
});

// Utility Function to Get CSRF Token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Open Apply Modal and Pre-fill Data
function openApplyModal(internshipId) {
    const modal = document.getElementById('applyModal');
    const form = document.getElementById('applyForm');
    const internshipIdField = document.getElementById('internship_id');

    internshipIdField.value = internshipId;
    form.action = `/apply-internship/${internshipId}/`;

    fetch(`/api/get-profile/`, {
        method: 'GET',
        headers: { 'X-CSRFToken': getCookie('csrftoken') },
    })
    .then(response => response.ok ? response.json() : Promise.reject('Not authenticated'))
    .then(data => {
        document.getElementById('full_name').value = data.full_name || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('skills').value = data.skills || '';
        document.getElementById('experience').value = data.experience || '';
        document.getElementById('linkedin').value = data.linkedin || '';
        document.getElementById('projects').value = data.projects || '';
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
        alert('Please log in or complete your profile to apply.');
        closeApplyModal();
    });

    modal.classList.remove('hidden');
}

// Close Apply Modal
function closeApplyModal() {
    document.getElementById('applyModal').classList.add('hidden');
}


// Close modal when clicking outside
document.addEventListener("click", (event) => {
    const modal = document.getElementById("details-modal");
    if (event.target === modal) {
        closeDetailsModal();
    }
});

function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const isActive = answer.classList.contains('active');
    document.querySelectorAll('.faq-answer').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelectorAll('.faq-item h3').forEach(item => {
        item.classList.remove('active');
    });
    if (!isActive) {
        answer.classList.add('active');
        element.classList.add('active');
    }
}