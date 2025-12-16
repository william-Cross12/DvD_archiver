async function main() {
    const nav = document.getElementById('nav');
    if (nav) {   
        try {
            const navImport = await fetch('/frontend/nav/nav.html');
            const navContent = await navImport.text();
            nav.innerHTML = navContent;
        } catch (error) {
            console.error('Error loading navigation:', error);
        } 
        const accessToken = sessionStorage.getItem('accessToken');

        if (accessToken) {
            document.getElementById("login-logout").textContent="Logout";
            document.getElementById("login-logout").href="#";
            document.getElementById("login-logout").addEventListener('click', () => {
                sessionStorage.removeItem('accessToken');
                window.location.href = '/frontend/index.html';
            });
            document.getElementById("signup").style.display="none";
            document.getElementById("my-reviews").style.display="";

        } 

        if (window.location.pathname.startsWith('/frontend/authenticated') && !accessToken) {
                window.location.href = '/frontend/user/login.html';
                return;
            }  
    }
}

function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "nav-links") {
        x.className += " responsive";
    } else {
        x.className = "nav-links";
    }
    }

document.addEventListener('DOMContentLoaded', main);