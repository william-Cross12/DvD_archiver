async function postSignup(event) {
    event.preventDefault();
    const signupForm = event.target;
    const submitButton = signupForm.querySelector('button[type="submit"]');
    const username = signupForm.username.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;

    try {
        submitButton.disabled = true;
        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email, password, username}),
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }

        if (response.status == 200 || response.status == 201) {
            setTimeout(() => {
                window.location.href = '/frontend/user/login.html';
            }, 1000); 
        }

    } catch (error) {
        alert('Error during signup: \n' + error);
        submitButton.disabled = false;
    }

};

function signup() {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (event) => postSignup(event));
    }
}

document.addEventListener('DOMContentLoaded', signup);
