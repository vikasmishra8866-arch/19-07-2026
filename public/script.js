/* ==========================================
   DYNAMIC AUTH ROTATION LAYER (3D CARD FLIP)
   ========================================== */
function toggleAuthForm(showRegister) {
    const container = document.querySelector('.card-container');
    if (showRegister) {
        container.classList.add('is-flipped');
    } else {
        container.classList.remove('is-flipped');
    }
}

/* ==========================================
   PREMIUM NOTIFICATION MESSAGING MODULE (TOAST)
   ========================================== */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const icon = document.getElementById('toast-icon');
    const text = document.getElementById('toast-text');

    toast.className = `toast ${type}`;
    text.textContent = message;

    if (type === 'success') {
        icon.className = 'fa-solid fa-circle-check';
    } else {
        icon.className = 'fa-solid fa-circle-exclamation';
    }

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

/* ==========================================
   REGISTRATION HANDSHAKE CONTROLLER
   ========================================== */
async function handleRegister(event) {
    event.preventDefault();
    
    const mobile = document.getElementById('reg-mobile').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm').value;
    const secretKey = document.getElementById('reg-secret').value.trim();
    const submitBtn = document.getElementById('register-submit-btn');

    // Frontend Hard Gate Verification Logic
    if (secretKey !== '9696') {
        showToast('Access Blocked: Invalid Registration Secret Key.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Password verification mismatch.', 'error');
        return;
    }

    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, password, confirmPassword, secretKey })
        });
        
        const data = await response.json();

        if (response.ok) {
            showToast(data.message, 'success');
            document.getElementById('register-form').reset();
            setTimeout(() => {
                toggleAuthForm(false);
            }, 1500);
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Network error processing synchronization.', 'error');
    } finally {
        submitBtn.disabled = false;
    }
}

/* ==========================================
   AUTHENTICATED LOGIN HANDSHAKE MODULE
   ========================================== */
async function handleLogin(event) {
    event.preventDefault();

    const mobile = document.getElementById('login-mobile').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-submit-btn');

    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, password })
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Handshake complete. Directing portal access...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Authentication engine handshake error.', 'error');
    } finally {
        submitBtn.disabled = false;
    }
}

/* ==========================================
   SESSION TERMINATION LAYER
   ========================================== */
async function terminateUserSession() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        if (response.ok) {
            window.location.href = '/login.html';
        } else {
            alert('Failed to terminate session safely.');
        }
    } catch (error) {
        console.error('Session clearance exception context.');
    }
}

/* ==========================================
   REAL-TIME LOG TIME CLOCK (DASHBOARD RUNTIME)
   ========================================== */
function runLiveDashboardClock() {
    const clockEl = document.getElementById('digital-clock');
    if (!clockEl) return; 

    function updateTime() {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        }).replace(/\//g, '-');
        
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });

        clockEl.textContent = `${dateString} | ${timeString}`;
    }
    updateTime();
    setInterval(updateTime, 1000);
}

// Route Guard Verification Checking Layer initialization
if (window.location.pathname.includes('dashboard.html')) {
    fetch('/api/verify')
        .then(res => res.json())
        .then(data => {
            if (!data.authenticated) {
                window.location.href = '/login.html';
            } else {
                runLiveDashboardClock();
            }
        })
        .catch(() => {
            window.location.href = '/login.html';
        });
}
