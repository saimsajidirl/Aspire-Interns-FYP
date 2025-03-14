function showDetails(internshipId) {
    const modal = document.getElementById('internship-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');

    // Fetch internship details via AJAX
    fetch(`/app_fyp/internship/${internshipId}/details/`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest', // Indicate this is an AJAX request
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Populate modal with dynamic data
        title.textContent = data.title;
        content.innerHTML = `
            <p><strong>Company:</strong> ${data.company}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Duration:</strong> ${data.duration}</p>
            <p><strong>Stack:</strong> ${data.stack}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            ${data.stipend ? `<p><strong>Stipend:</strong> ${data.stipend}</p>` : ''}
        `;
        modal.classList.remove('hidden');
    })
    .catch(error => {
        console.error('Error fetching internship details:', error);
        title.textContent = "Error";
        content.innerHTML = "<p>Sorry, we couldn't load the internship details. Please try again later.</p>";
        modal.classList.remove('hidden');
    });
}

function closeModal() {
    document.getElementById('internship-modal').classList.add('hidden');
}
document.getElementById('mobile-menu-btn').addEventListener('click', function() {
  const nav = document.getElementById('mobile-menu');
  const expanded = this.getAttribute('aria-expanded') === 'true';
  this.setAttribute('aria-expanded', !expanded);
  nav.classList.toggle('hidden');
});

document.addEventListener('DOMContentLoaded', function() {
  const nav = document.querySelector('nav');
  const internshipCards = document.querySelectorAll('.internship-card');
  const categoryCards = document.querySelectorAll('#categories > div');
  const statItems = document.querySelectorAll('.stat-item');
  const aboutSection = document.querySelector('#about');
  const testimonialItems = document.querySelectorAll('#testimonials > div');
  const heroTitle = document.querySelector('.hero-gradient');

  function handleNavScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(function() {
        handleNavScroll();
        scrollTimeout = null;
      }, 10);
    }
  });

  const animateElements = [
    ...internshipCards,
    ...categoryCards,
    ...statItems,
    aboutSection,
    ...testimonialItems
  ].filter(Boolean);

  const buttons = document.querySelectorAll('button, .btn, a[class*="bg-"]');

  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const x = e.clientX - e.target.getBoundingClientRect().left;
      const y = e.clientY - e.target.getBoundingClientRect().top;
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  const searchBox = document.getElementById('internship-search');
  if (searchBox) {
    searchBox.addEventListener('focus', function() {
      if (window.innerWidth < 768) this.style.width = '100%';
    });
    searchBox.addEventListener('blur', function() {
      if (window.innerWidth < 768) this.style.width = '';
    });
  }

  if (heroTitle) {
    window.addEventListener('mousemove', function(e) {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
      heroTitle.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }

  function animateCounter(el) {
    const target = parseInt(el.textContent);
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = Math.round(target * progress);
      if (frame === totalFrames) {
        clearInterval(counter);
        el.textContent = target;
      } else {
        el.textContent = currentCount;
      }
    }, frameRate);
  }

  const statNumbers = document.querySelectorAll('.stat-item h3');
  statNumbers.forEach(stat => animateCounter(stat));

  function handleResize() {
    if (window.innerWidth <= 768) {
      document.querySelectorAll('.internship-card').forEach(card => {
        card.style.transition = 'all 0.3s ease';
      });
    }
  }
  handleResize();

  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 250);
  });

  const modal = document.getElementById('internship-modal');
  const modalContent = document.getElementById('modal-content');

  if (modal) {
    modal.addEventListener('transitionstart', function() {
      modalContent.style.willChange = 'transform, opacity';
    });
    modal.addEventListener('transitionend', function() {
      modalContent.style.willChange = 'auto';
    });
  }

  requestAnimationFrame(() => {
    document.body.classList.add('js-loaded');
  });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Open the Apply Modal and Pre-fill Data
function openApplyModal(internshipId) {
    const modal = document.getElementById('applyModal');
    const form = document.getElementById('applyForm');
    const internshipIdField = document.getElementById('internship_id');

    internshipIdField.value = internshipId;
    form.action = "{% url 'app_fyp:apply_internship' 0 %}".replace('0', internshipId);

    // Fetch and Pre-fill Profile Data
    fetch("{% url 'user_auth:get_profile' %}", {
        method: 'GET',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Not authenticated or profile not found');
        }
        return response.json();
    })
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

// Close the Apply Modal
function closeApplyModal() {
    document.getElementById('applyModal').classList.add('hidden');
}

// Open the Details Modal and Load Internship Details
function showDetails(internshipId) {
    fetch(`/internship/${internshipId}/details/`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        const modalContent = `
            <h3>${data.title}</h3>
            <p><strong>Company:</strong> ${data.company}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Duration:</strong> ${data.duration}</p>
            <p><strong>Stack:</strong> ${data.stack}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Stipend:</strong> ${data.stipend || 'N/A'}</p>
        `;
        document.getElementById('modal-content').innerHTML = modalContent;
        document.getElementById('details-modal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching details:', error);
        alert('Error loading internship details.');
    });
}

// Close the Details Modal
function closeDetailsModal() {
    document.getElementById('details-modal').style.display = 'none';
}

// Utility Function to Get CSRF Token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
// Utility function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// Show internship details in modal
function showDetails(internshipId) {
    const modal = document.getElementById('details-modal');
    const content = document.getElementById('modal-content');

    fetch(`/internship/${internshipId}/details/`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        content.innerHTML = `
            <h3>${data.title}</h3>
            <p><strong>Company:</strong> ${data.company}</p>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Duration:</strong> ${data.duration}</p>
            <p><strong>Stack:</strong> ${data.stack}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Stipend:</strong> ${data.stipend || 'N/A'}</p>
        `;
        modal.style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching details:', error);
        content.innerHTML = '<p>Error loading internship details.</p>';
        modal.style.display = 'block';
    });
}

// Close the details modal
function closeDetailsModal() {
    document.getElementById('details-modal').style.display = 'none';
}

// Main DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Navigation scroll effect
    const nav = document.querySelector('nav');
    function handleNavScroll() {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    }
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                handleNavScroll();
                scrollTimeout = null;
            }, 10);
        }
    });

    // Ripple effect on buttons
    const buttons = document.querySelectorAll('button, .btn, a[class*="bg-"]');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Search box focus behavior (mobile)
    const searchBox = document.getElementById('internship-search');
    if (searchBox) {
        searchBox.addEventListener('focus', function() {
            if (window.innerWidth < 768) this.style.width = '100%';
        });
        searchBox.addEventListener('blur', function() {
            if (window.innerWidth < 768) this.style.width = '';
        });
    }

    // Hero title parallax effect
    const heroTitle = document.querySelector('.hero-gradient');
    if (heroTitle) {
        window.addEventListener('mousemove', function(e) {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            heroTitle.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    // Counter animation for stats
    function animateCounter(el) {
        const target = parseInt(el.textContent);
        const duration = 2000;
        const frameRate = 1000 / 60;
        const totalFrames = Math.round(duration / frameRate);
        let frame = 0;
        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentCount = Math.round(target * progress);
            el.textContent = frame === totalFrames ? target : currentCount;
            if (frame === totalFrames) clearInterval(counter);
        }, frameRate);
    }
    document.querySelectorAll('.stat-item h3').forEach(stat => animateCounter(stat));

    // Responsive internship cards
    function handleResize() {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.internship-card').forEach(card => {
                card.style.transition = 'all 0.3s ease';
            });
        }
    }
    handleResize();
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 250);
    });

    // Modal transition optimization
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

    // Mark page as JS-loaded
    requestAnimationFrame(() => document.body.classList.add('js-loaded'));
});
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    menuBtn.addEventListener('click', () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('show');
        menuBtn.querySelector('.hamburger').textContent = isExpanded ? '☰' : '✕';
    });

    // Close menu when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target) && mobileMenu.classList.contains('show')) {
            mobileMenu.classList.remove('show');
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.querySelector('.hamburger').textContent = '☰';
        }
    });
});