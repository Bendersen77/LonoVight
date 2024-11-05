document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.querySelector(".contact-form");

    // Khi người dùng gửi form
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const message = document.getElementById("message").value;

        const contact = {
            name: name,
            message: message,
            reply: null // Ban đầu chưa có phản hồi từ Admin
        };

        let contactList = JSON.parse(localStorage.getItem("contacts")) || [];
        contactList.push(contact);
        localStorage.setItem("contacts", JSON.stringify(contactList));

        alert("Thông tin đã gửi!");
    });

   
});
fetch('https://your-api-url.com/Contact', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'Tên', message: 'Nội dung hỗ trợ' })
});
