async function postSearch(event) {
    event.preventDefault();
    const loginForm = event.target;
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const header = document.getElementById('login-header');
    submitButton.disabled = true;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password}),
        });

        const data = await response.json();

        if (response.status === 200) {
            sessionStorage.setItem('accessToken', data.accessToken);
            sessionStorage.setItem('user', JSON.stringify(data.user));

            header.textContent = 'Logged in successfully! Redirecting...';
            setTimeout(() => {
                window.location.href = '/frontend/index.html';
            }, 1000); 
        } else {
            header.textContent = data.message || 'Login failed. Please check your credentials.';
            submitButton.disabled = false;
        }
    } catch (error) {
        header.textContent = 'Network error. Please try again.';
        submitButton.disabled = false;
    }
};

function login() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => postSearch(event));
    }
}

document.addEventListener('DOMContentLoaded', login);
