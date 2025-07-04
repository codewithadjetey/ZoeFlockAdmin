// Modal Management
function openModal(modalId) {
  document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// Form Validation
function validateForm(formId) {
  const form = document.getElementById(formId);
  const inputs = form.querySelectorAll('input[required]');
  let isValid = true;
  inputs.forEach(input => {
    if (!input.value) {
      input.classList.add('border-red-500');
      isValid = false;
    } else {
      input.classList.remove('border-red-500');
    }
  });
  return isValid;
}

// Mock Authentication
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-message');
  const loginBtnText = document.getElementById('login-btn-text');
  const loginLoading = document.getElementById('login-loading');

  errorMsg.classList.add('hidden');
  loginBtnText.textContent = 'Signing In...';
  loginLoading.classList.remove('hidden');

  setTimeout(() => {
    loginBtnText.textContent = 'Sign In';
    loginLoading.classList.add('hidden');
    if (
      (email === 'admin@church.com' && password === 'admin123') ||
      (email === 'pastor@church.com' && password === 'pastor123') ||
      (email === 'member@church.com' && password === 'member123')
    ) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', email.split('@')[0]);
      window.location.href = 'dashboard.html';
    } else {
      errorMsg.textContent = 'Invalid email or password.';
      errorMsg.classList.remove('hidden');
    }
  }, 1000);
}

// Forgot Password
function handleReset(event) {
  event.preventDefault();
  const resetEmail = document.getElementById('reset-email').value;
  const resetMsg = document.getElementById('reset-message');
  resetMsg.textContent = 'If this email exists, a reset link has been sent.';
  resetMsg.classList.remove('hidden');
  setTimeout(() => {
    closeModal('forgot-modal');
    resetMsg.classList.add('hidden');
  }, 2000);
}

// Attach event listeners after DOM loads
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      if (validateForm('login-form')) {
        handleLogin(e);
      } else {
        e.preventDefault();
      }
    });
  }
  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', handleReset);
  }
});
