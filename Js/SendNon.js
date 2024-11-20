document.addEventListener("DOMContentLoaded", function () {
    const notificationForm = document.getElementById("notificationForm");
    const notificationResult = document.getElementById("notificationResult");

    notificationForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn không tải lại trang

        const title = document.getElementById("title").value;
        const message = document.getElementById("message").value;
        const date = new Date().toLocaleDateString();

        // Tạo thông báo giả
        const newNotification = {
            title: title,
            message: message,
            date: date,
        };

        // Lấy danh sách thông báo từ Local Storage
        const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

        // Thêm thông báo mới vào danh sách
        notifications.push(newNotification);

        // Lưu danh sách thông báo vào Local Storage
        localStorage.setItem("notifications", JSON.stringify(notifications));

        // Hiển thị thông báo kết quả
        notificationResult.textContent = "Thông báo đã được gửi!";
        notificationResult.style.color = "black";

        // Reset form
        notificationForm.reset();
    });
});
