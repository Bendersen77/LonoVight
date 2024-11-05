document.addEventListener("DOMContentLoaded", function () {
    const notificationList = document.getElementById("notification-list");

    // Lấy danh sách thông báo từ localStorage
    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    function displayNotifications() {
        notificationList.innerHTML = ""; // Xóa danh sách cũ

        if (notifications.length > 0) {
            notifications.forEach((notification, index) => {
                const notificationItem = document.createElement("div");
                notificationItem.classList.add("notification-item");

                notificationItem.innerHTML = `
                    <h3>${notification.title}</h3>
                    <p>${notification.message}</p>
                    <small>Ngày: ${notification.date}</small>
                    <button class="delete-btn" data-index="${index}">Xóa</button>
                `;

                notificationList.appendChild(notificationItem);
            });
        } else {
            notificationList.innerHTML = "<p>Không có thông báo nào.</p>";
        }
    }

    // Hiển thị thông báo
    displayNotifications();

    // Xử lý sự kiện xóa thông báo
    notificationList.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-btn")) {
            const index = e.target.getAttribute("data-index");
            notifications.splice(index, 1); // Xóa thông báo
            localStorage.setItem("notifications", JSON.stringify(notifications)); // Lưu lại vào localStorage
            displayNotifications(); // Cập nhật danh sách hiển thị
        }
    });
});
