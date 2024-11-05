document.addEventListener("DOMContentLoaded", function () {
    const contactTableBody = document.querySelector("#contactTable tbody");

    // Lấy danh sách liên hệ từ localStorage
    let contactList = JSON.parse(localStorage.getItem("contacts")) || [];

    // Hiển thị từng liên hệ lên bảng
    contactList.forEach((contact, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${contact.name}</td>
            <td>${contact.message}</td>
            <td>
                <textarea id="reply-${index}" rows="3" placeholder="Nhập câu trả lời...">${contact.reply || ''}</textarea>
            </td>
            <td>
                <button onclick="sendReply(${index})">Gửi</button>
                <button onclick="deleteContact(${index})">Xóa</button>
            </td>
        `;

        contactTableBody.appendChild(row);
    });
});

function sendReply(index) {
    let contactList = JSON.parse(localStorage.getItem("contacts")) || [];

    // Lấy câu trả lời từ ô nhập liệu
    const reply = document.getElementById(`reply-${index}`).value;

    // Lưu câu trả lời vào danh sách liên hệ
    contactList[index].reply = reply;

    // Cập nhật lại localStorage với danh sách liên hệ
    localStorage.setItem("contacts", JSON.stringify(contactList));

    // Tạo thông báo mới từ câu trả lời của Admin
    const notification = {
        title: "Câu trả lời từ Admin",
        message: `Câu trả lời cho liên hệ của ${contactList[index].name}: ${reply}`,
        date: new Date().toLocaleDateString()
    };

    // Lấy danh sách thông báo từ localStorage
    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    // Thêm thông báo mới vào danh sách
    notifications.push(notification);

    // Cập nhật lại thông báo vào localStorage
    localStorage.setItem("notifications", JSON.stringify(notifications));

    alert("Đã gửi câu trả lời!");

    // Cập nhật lại bảng liên hệ nếu cần thiết
    window.location.reload();
}

// Hàm để xóa liên hệ
function deleteContact(index) {
    let contactList = JSON.parse(localStorage.getItem("contacts")) || [];

    // Xóa liên hệ khỏi danh sách
    contactList.splice(index, 1);

    // Cập nhật lại localStorage
    localStorage.setItem("contacts", JSON.stringify(contactList));

    // Tải lại trang để cập nhật danh sách
    window.location.reload();
}
