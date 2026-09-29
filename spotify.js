document.getElementById('login').onclick = function() {
    document.getElementById('signupForm').style.display = "block";
}
document.getElementsByClassName('close')[0].onclick = function() {
    document.getElementById('signupForm').style.display = "none";
}

window.onclick = function(event) {
    if (event.target == document.getElementById('signupForm')) {
        document.getElementById('signupForm').style.display = "none";
    }
}
function showAlert() {
    Swal.fire({
        title: 'Login Successful',
        text: 'Welcome back!',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}
const gl = document.querySelector('#gl');
gl.addEventListener('click', () => {
    window.location.href = 'https://open.spotify.com/playlist/37i9dQZEVXbLRQDuF5jeBp';
    });