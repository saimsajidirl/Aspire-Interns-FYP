document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const closeBtn = mobileNav.querySelector('.close-btn');

    if (menuToggle && mobileNav && closeBtn) {
        menuToggle.addEventListener('click', () => {
            mobileNav.style.display = 'block';
            setTimeout(() => {
                mobileNav.style.opacity = '1';
                mobileNav.style.transform = 'translateX(0)';
            }, 10); // Small delay for transition to take effect
            menuToggle.setAttribute('aria-expanded', 'true');
        });

        closeBtn.addEventListener('click', () => {
            mobileNav.style.opacity = '0';
            mobileNav.style.transform = 'translateX(100%)';
            setTimeout(() => {
                mobileNav.style.display = 'none';
            }, 300); // Match CSS transition duration
            menuToggle.setAttribute('aria-expanded', 'false');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target) && mobileNav.style.display === 'block') {
                mobileNav.style.opacity = '0';
                mobileNav.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    mobileNav.style.display = 'none';
                }, 300);
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Modal Close
    window.closeModal = function() {
        const modal = document.getElementById('internship-modal');
        if (modal) {
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.8)';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Match CSS transition duration
        }
    };

    // Close modal on outside click
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('internship-modal');
        const modalContent = modal.querySelector('div > div');
        if (modal && modal.style.display === 'block' && !modalContent.contains(e.target) && !e.target.closest('button[onclick="closeModal()"]')) {
            closeModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const closeBtn = mobileNav?.querySelector('.close-btn');

  if (menuToggle && mobileNav && closeBtn) {
    menuToggle.addEventListener('click', () => {
      mobileNav.style.display = 'block';
      setTimeout(() => {
        mobileNav.style.opacity = '1';
        mobileNav.style.transform = 'translateX(0)';
      }, 10);
      menuToggle.setAttribute('aria-expanded', 'true');
    });

    closeBtn.addEventListener('click', () => {
      mobileNav.style.opacity = '0';
      mobileNav.style.transform = 'translateX(100%)';
      setTimeout(() => {
        mobileNav.style.display = 'none';
      }, 300);
      menuToggle.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('click', (e) => {
      if (
        !mobileNav.contains(e.target) &&
        !menuToggle.contains(e.target) &&
        mobileNav.style.display === 'block'
      ) {
        mobileNav.style.opacity = '0';
        mobileNav.style.transform = 'translateX(100%)';
        setTimeout(() => {
          mobileNav.style.display = 'none';
        }, 300);
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // FAQ Accordion
  window.toggleFAQ = function (element) {
    const faqItem = element.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';

    document.querySelectorAll('.faq-item .faq-answer').forEach((otherAnswer) => {
      if (otherAnswer !== answer) {
        otherAnswer.style.maxHeight = '0';
        otherAnswer.style.opacity = '0';
        otherAnswer.parentElement
          .querySelector('h3')
          .setAttribute('aria-expanded', 'false');
      }
    });

    if (isOpen) {
      answer.style.maxHeight = '0';
      answer.style.opacity = '0';
      element.setAttribute('aria-expanded', 'false');
    } else {
      answer.style.maxHeight = answer.scrollHeight + 'px';
      answer.style.opacity = '1';
      element.setAttribute('aria-expanded', 'true');
    }
  };

  document.querySelectorAll('.faq-item h3').forEach((header) => {
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFAQ(header);
      }
    });
  });

  // Modal Close
  window.closeModal = function () {
    const modal = document.getElementById('internship-modal');
    if (modal) {
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.8)';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  };

  document.addEventListener('click', (e) => {
    const modal = document.getElementById('internship-modal');
    const modalContent = modal?.querySelector('div > div');
    if (
      modal &&
      modal.style.display === 'block' &&
      !modalContent.contains(e.target) &&
      !e.target.closest('button[onclick="closeModal()"]')
    ) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Chat WebSocket
  const chatContainer = document.querySelector('.container');
  if (chatContainer) {
    const internshipId =
      chatContainer.dataset.internshipId || '{{ internship.id|escapejs }}';
    const currentUser = '{{ request.user.username|escapejs }}';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat/${internshipId}/`;

    const chatSocket = new WebSocket(wsUrl);
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const statusElement = document.getElementById('connection-status');

    function updateStatus(message, color = '#666') {
      statusElement.textContent = message;
      statusElement.style.color = color;
    }

    chatSocket.onopen = function () {
      updateStatus('Connected to chat', '#28a745');
      sendButton.disabled = false;
      const connectMsg = document.createElement('p');
      connectMsg.classList.add('received');
      connectMsg.innerHTML = '<strong>System</strong> (Now): Connected to chat';
      chatMessages.appendChild(connectMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    chatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      const messageElement = document.createElement('p');
      messageElement.classList.add(
        data.sender === currentUser ? 'sent' : 'received'
      );
      messageElement.innerHTML = `<strong>${data.sender}</strong> (${data.timestamp}): ${data.content}`;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    chatSocket.onerror = function (e) {
      updateStatus('Failed to connect to chat', '#dc3545');
      alert('Failed to connect to chat. Please refresh the page.');
      sendButton.disabled = true;
    };

    chatSocket.onclose = function (e) {
      updateStatus('Chat connection lost', '#dc3545');
      alert('Chat connection lost. Please refresh the page.');
      sendButton.disabled = true;
    };

    document.getElementById('chat-form').onsubmit = function (e) {
      e.preventDefault();
      const message = messageInput.value.trim();
      if (message && chatSocket.readyState === WebSocket.OPEN) {
        chatSocket.send(JSON.stringify({ content: message }));
        messageInput.value = '';
      } else if (chatSocket.readyState !== WebSocket.OPEN) {
        updateStatus('Cannot send - Chat not connected', '#dc3545');
        alert('Chat connection is not available. Please refresh the page.');
      }
    };

    setInterval(() => {
      if (
        chatSocket.readyState === WebSocket.CLOSED ||
        chatSocket.readyState === WebSocket.CLOSING
      ) {
        updateStatus('Reconnecting...', '#ffc107');
        const newSocket = new WebSocket(wsUrl);
        newSocket.onopen = chatSocket.onopen;
        newSocket.onmessage = chatSocket.onmessage;
        newSocket.onerror = chatSocket.onerror;
        newSocket.onclose = chatSocket.onclose;
        chatSocket.close();
        Object.assign(chatSocket, newSocket);
      }
    }, 5000);
  }
});
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const closeBtn = mobileNav?.querySelector('.close-btn');

  if (menuToggle && mobileNav && closeBtn) {
    menuToggle.addEventListener('click', () => {
      mobileNav.style.display = 'block';
      setTimeout(() => {
        mobileNav.style.opacity = '1';
        mobileNav.style.transform = 'translateX(0)';
      }, 10);
      menuToggle.setAttribute('aria-expanded', 'true');
    });

    closeBtn.addEventListener('click', () => {
      mobileNav.style.opacity = '0';
      mobileNav.style.transform = 'translateX(100%)';
      setTimeout(() => {
        mobileNav.style.display = 'none';
      }, 300);
      menuToggle.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('click', (e) => {
      if (
        !mobileNav.contains(e.target) &&
        !menuToggle.contains(e.target) &&
        mobileNav.style.display === 'block'
      ) {
        mobileNav.style.opacity = '0';
        mobileNav.style.transform = 'translateX(100%)';
        setTimeout(() => {
          mobileNav.style.display = 'none';
        }, 300);
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // FAQ Accordion
  window.toggleFAQ = function (element) {
    const faqItem = element.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';

    document.querySelectorAll('.faq-item .faq-answer').forEach((otherAnswer) => {
      if (otherAnswer !== answer) {
        otherAnswer.style.maxHeight = '0';
        otherAnswer.style.opacity = '0';
        otherAnswer.parentElement
          .querySelector('h3')
          .setAttribute('aria-expanded', 'false');
      }
    });

    if (isOpen) {
      answer.style.maxHeight = '0';
      answer.style.opacity = '0';
      element.setAttribute('aria-expanded', 'false');
    } else {
      answer.style.maxHeight = answer.scrollHeight + 'px';
      answer.style.opacity = '1';
      element.setAttribute('aria-expanded', 'true');
    }
  };

  document.querySelectorAll('.faq-item h3').forEach((header) => {
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFAQ(header);
      }
    });
  });

  // Modal Close
  window.closeModal = function () {
    const modal = document.getElementById('internship-modal');
    if (modal) {
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.8)';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  };

  document.addEventListener('click', (e) => {
    const modal = document.getElementById('internship-modal');
    const modalContent = modal?.querySelector('div > div');
    if (
      modal &&
      modal.style.display === 'block' &&
      !modalContent.contains(e.target) &&
      !e.target.closest('button[onclick="closeModal()"]')
    ) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Chat WebSocket
  const chatContainer = document.querySelector('.container');
  if (chatContainer && chatContainer.querySelector('#chat-form')) {
    const internshipId =
      chatContainer.dataset.internshipId || '{{ internship.id|escapejs }}';
    const currentUser = '{{ request.user.username|escapejs }}';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat/${internshipId}/`;

    const chatSocket = new WebSocket(wsUrl);
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const statusElement = document.getElementById('connection-status');

    function updateStatus(message, color = '#666') {
      statusElement.textContent = message;
      statusElement.style.color = color;
    }

    chatSocket.onopen = function () {
      updateStatus('Connected to chat', '#28a745');
      sendButton.disabled = false;
      const connectMsg = document.createElement('p');
      connectMsg.classList.add('received');
      connectMsg.innerHTML = '<strong>System</strong> (Now): Connected to chat';
      chatMessages.appendChild(connectMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    chatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      const messageElement = document.createElement('p');
      messageElement.classList.add(
        data.sender === currentUser ? 'sent' : 'received'
      );
      messageElement.innerHTML = `<strong>${data.sender}</strong> (${data.timestamp}): ${data.content}`;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    chatSocket.onerror = function (e) {
      updateStatus('Failed to connect to chat', '#dc3545');
      alert('Failed to connect to chat. Please refresh the page.');
      sendButton.disabled = true;
    };

    chatSocket.onclose = function (e) {
      updateStatus('Chat connection lost', '#dc3545');
      alert('Chat connection lost. Please refresh the page.');
      sendButton.disabled = true;
    };

    document.getElementById('chat-form').onsubmit = function (e) {
      e.preventDefault();
      const message = messageInput.value.trim();
      if (message && chatSocket.readyState === WebSocket.OPEN) {
        chatSocket.send(JSON.stringify({ content: message }));
        messageInput.value = '';
      } else if (chatSocket.readyState !== WebSocket.OPEN) {
        updateStatus('Cannot send - Chat not connected', '#dc3545');
        alert('Chat connection is not available. Please refresh the page.');
      }
    };

    setInterval(() => {
      if (
        chatSocket.readyState === WebSocket.CLOSED ||
        chatSocket.readyState === WebSocket.CLOSING
      ) {
        updateStatus('Reconnecting...', '#ffc107');
        const newSocket = new WebSocket(wsUrl);
        newSocket.onopen = chatSocket.onopen;
        newSocket.onmessage = chatSocket.onmessage;
        newSocket.onerror = chatSocket.onerror;
        newSocket.onclose = chatSocket.onclose;
        chatSocket.close();
        Object.assign(chatSocket, newSocket);
      }
    }, 5000);
  }

  // Signup Form Validation
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const resume = document.getElementById('resume').files[0];
      const linkedin = document.getElementById('linkedin').value;
      const projects = document.getElementById('projects').value;

      if (password !== confirmPassword) {
        e.preventDefault();
        alert('Passwords do not match.');
        return;
      }

      if (resume) {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(resume.type)) {
          e.preventDefault();
          alert('Please upload a valid resume file (PDF, DOC, or DOCX).');
          return;
        }
        if (resume.size > 5 * 1024 * 1024) {
          e.preventDefault();
          alert('Resume file size must be less than 5MB.');
          return;
        }
      }

      if (linkedin && !linkedin.match(/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/)) {
        e.preventDefault();
        alert('Please enter a valid LinkedIn profile URL.');
        return;
      }

      if (projects && !projects.match(/^https:\/\/(www\.)?(github\.com|gitlab\.com|bitbucket\.org)\/[a-zA-Z0-9-]+(\/[a-zA-Z0-9-]+)?\/?$/)) {
        e.preventDefault();
        alert('Please enter a valid projects URL (e.g., GitHub, GitLab, Bitbucket).');
        return;
      }
    });
  }

  // OTP Verification Form
  const verifyOtpForm = document.getElementById('verifyOtpForm');
  if (verifyOtpForm) {
    const otpInput = document.getElementById('otp');
    otpInput.addEventListener('input', () => {
      otpInput.value = otpInput.value.replace(/[^0-9]/g, '');
      if (otpInput.value.length > 6) {
        otpInput.value = otpInput.value.slice(0, 6);
      }
    });

    verifyOtpForm.addEventListener('submit', (e) => {
      const otp = otpInput.value;
      if (!/^\d{6}$/.test(otp)) {
        e.preventDefault();
        alert('Please enter a valid 6-digit OTP.');
      }
    });
  }

  // Profile Form Validation
  const profileForm = document.querySelector('.profile-form form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      const resume = document.querySelector('input[name="resume"]').files[0];
      const linkedin = document.querySelector('input[name="linkedin"]').value;
      const projects = document.querySelector('input[name="projects"]').value;

      if (resume) {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(resume.type)) {
          e.preventDefault();
          alert('Please upload a valid resume file (PDF, DOC, or DOCX).');
          return;
        }
        if (resume.size > 5 * 1024 * 1024) {
          e.preventDefault();
          alert('Resume file size must be less than 5MB.');
          return;
        }
      }

      if (linkedin && !linkedin.match(/^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/)) {
        e.preventDefault();
        alert('Please enter a valid LinkedIn profile URL.');
        return;
      }

      if (projects && !projects.match(/^https:\/\/(www\.)?(github\.com|gitlab\.com|bitbucket\.org)\/[a-zA-Z0-9-]+(\/[a-zA-Z0-9-]+)?\/?$/)) {
        e.preventDefault();
        alert('Please enter a valid projects URL (e.g., GitHub, GitLab, Bitbucket).');
        return;
      }
    });
  }

  // Update Application Status Form
  const updateStatusForm = document.querySelector('.profile-form form');
  if (updateStatusForm && updateStatusForm.querySelector('select[name="status"]')) {
    updateStatusForm.addEventListener('submit', (e) => {
      const status = updateStatusForm.querySelector('select[name="status"]').value;
      if (!['submitted', 'accepted', 'rejected'].includes(status)) {
        e.preventDefault();
        alert('Please select a valid status.');
      }
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  window.toggleFAQ = function (element) {
    const faqItem = element.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const isOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';

    document.querySelectorAll('.faq-item .faq-answer').forEach((otherAnswer) => {
      if (otherAnswer !== answer) {
        otherAnswer.style.maxHeight = '0';
        otherAnswer.style.opacity = '0';
        otherAnswer.style.padding = '0 1.5rem';
        otherAnswer.parentElement
          .querySelector('h3')
          .setAttribute('aria-expanded', 'false');
      }
    });

    if (isOpen) {
      answer.style.maxHeight = '0';
      answer.style.opacity = '0';
      answer.style.padding = '0 1.5rem';
      element.setAttribute('aria-expanded', 'false');
    } else {
      answer.style.maxHeight = answer.scrollHeight + 'px';
      answer.style.opacity = '1';
      answer.style.padding = '1rem 1.5rem';
      element.setAttribute('aria-expanded', 'true');
    }
  };

  document.querySelectorAll('.faq-item h3').forEach((header) => {
    header.setAttribute('aria-expanded', 'false');
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFAQ(header);
      }
    });
  });
});