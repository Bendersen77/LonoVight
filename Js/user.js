// user.js
const user = {
    isLoggedIn: false, // Thay đổi thành false nếu chưa đăng nhập
    name: "Akito",
    avatar: "../Image/logo.png"  // Đường dẫn tới hình ảnh đại diện
};

// Lấy phần tử hình đại diện và tên
const userNameElement = document.querySelector('.user-name');
const userAvatarElement = document.querySelector('.user-avatar');

// Kiểm tra trạng thái đăng nhập
if (user.isLoggedIn) {
    userNameElement.textContent = user.name;
    userAvatarElement.src = user.avatar;

    // Thêm sự kiện click vào hình đại diện người dùng
    userAvatarElement.parentElement.addEventListener('click', function () {
        window.location.href = 'profile.html'; // Chuyển đến trang thông tin cá nhân
    });
} else {
    userNameElement.textContent = "Đăng nhập";
    userAvatarElement.src = "default-avatar.png"; // Hình đại diện mặc định

    // Thêm sự kiện click vào hình đại diện để chuyển đến trang đăng nhập
    userAvatarElement.parentElement.addEventListener('click', function () {
        window.location.href = '../View/SignUp.html'; // Chuyển đến trang đăng nhập
    });
}
