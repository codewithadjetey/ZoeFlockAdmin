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

// API Configuration
const API_BASE_URL = 'http://zoeflockadmin.org/api/v1';

// Authentication Functions
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-message');
  const loginBtnText = document.getElementById('login-btn-text');
  const loginLoading = document.getElementById('login-loading');

  errorMsg.classList.add('hidden');
  loginBtnText.textContent = 'Signing In...';
  loginLoading.classList.remove('hidden');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    // Store authentication data
    localStorage.setItem('auth_token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    localStorage.setItem('isAuthenticated', 'true');

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Login error:', error);
    errorMsg.textContent = error.message || 'Invalid email or password.';
    errorMsg.classList.remove('hidden');
  } finally {
    loginBtnText.textContent = 'Sign In';
    loginLoading.classList.add('hidden');
  }
}

// Forgot Password
async function handleReset(event) {
  event.preventDefault();
  const resetEmail = document.getElementById('reset-email').value;
  const resetMsg = document.getElementById('reset-message');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: resetEmail }),
    });

    const data = await response.json();

    if (data.success) {
      resetMsg.textContent = 'If this email exists, a reset link has been sent.';
    } else {
      resetMsg.textContent = data.message || 'Failed to send reset email.';
    }
  } catch (error) {
    console.error('Reset error:', error);
    resetMsg.textContent = 'Failed to send reset email. Please try again.';
  }
  
  resetMsg.classList.remove('hidden');
  setTimeout(() => {
    closeModal('forgot-modal');
    resetMsg.classList.add('hidden');
  }, 2000);
}

// Logout function
async function handleLogout() {
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to login
    window.location.href = 'index.html';
  }
}

// Check authentication status
function checkAuth() {
  const token = localStorage.getItem('auth_token');
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  if (!token || isAuthenticated !== 'true') {
    // Redirect to login if not authenticated
    if (window.location.pathname !== '/index.html' && !window.location.pathname.includes('index.html')) {
      window.location.href = 'index.html';
    }
  }
}

// Attach event listeners after DOM loads
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication on page load
  checkAuth();
  
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
  
  // Add logout event listener
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});
