function showLogin() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("welcomeMessage").innerText = "Chào mừng bạn đã quay lại!";
    document.getElementById("loginBtn").classList.add("active");
    document.getElementById("registerBtn").classList.remove("active");
}

function showRegister() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("welcomeMessage").innerText = "Chào mừng bạn đã đến với web đọc truyện của chúng tôi!";
    document.getElementById("loginBtn").classList.remove("active");
    document.getElementById("registerBtn").classList.add("active");
}
