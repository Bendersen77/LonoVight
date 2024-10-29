// Mock user object with role (replace this with your actual authentication logic)
const user = {
    isLoggedIn: true, // Change based on actual login state
    name: "Akito",
    email: "akito@example.com",
    avatar: "../Image/logo.png",
    role: "Admin" // Example roles: "Admin", "User"
};

// Lấy phần tử email người dùng và dropdown
const userEmailElement = document.getElementById('userEmail');
const userInfoElement = document.getElementById('userInfo');
const userManagementLink = document.getElementById('userManagementLink');

// Kiểm tra trạng thái đăng nhập
if (user.isLoggedIn) {
    // Hiển thị thông tin người dùng
    userEmailElement.textContent = user.email;
    userInfoElement.style.display = "block"; // Show user info section

    // Chỉ hiển thị liên kết Quản lý người dùng nếu người dùng là Admin
    if (user.role === "Admin") {
        userManagementLink.style.display = "block"; // Show User Management link
    }

    // Thêm sự kiện logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        // Implement your logout logic here (e.g., clearing user session)
        console.log('User logged out');
        window.location.href = 'Home.html'; // Redirect to homepage after logout
    });
} else {
    // Ẩn thông tin người dùng nếu chưa đăng nhập
    userInfoElement.style.display = "none";
    // Chuyển hướng đến trang đăng nhập
    window.location.href = 'SignUp.html';
}
