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

// Validate Email Format
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

// Validate Password Length
function validatePassword(password) {
    return password.length > 6 && password.length < 20;
}

// Handle Login Form Submission
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // Perform validations
    if (!validateEmail(email)) {
        alert("Vui lòng nhập địa chỉ email hợp lệ.");
        return;
    }

    // Proceed with the login process
    console.log("Login successful with email:", email);
});

// Handle Registration Form Submission
document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-password-confirm").value;

    // Perform validations
    if (!validateEmail(email)) {
        alert("Vui lòng nhập địa chỉ email hợp lệ.");
        return;
    }
    if (!validatePassword(password)) {
        alert("Mật khẩu phải từ 7 đến 19 ký tự.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp. Vui lòng kiểm tra lại.");
        return;
    }

    // Proceed with the registration process
    console.log("Registration successful with email:", email);
});
