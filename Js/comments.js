// comments.js
document.getElementById('submit-comment').addEventListener('click', function () {
    // Lấy nội dung bình luận và tên người dùng
    const nameInput = document.getElementById('name-input');
    const commentInput = document.getElementById('comment-input');
    const userName = nameInput.value.trim();
    const commentText = commentInput.value.trim();

    if (userName && commentText) {
        // Tạo phần tử chứa bình luận
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `<p class="author">${userName}:</p><p>${commentText}</p>`;

        // Thêm bình luận vào danh sách bình luận
        document.querySelector('.comments').appendChild(commentElement);

        // Xóa nội dung trong ô nhập bình luận và tên sau khi gửi
        nameInput.value = '';
        commentInput.value = '';
    } else {
        alert('Vui lòng nhập cả tên và nội dung bình luận!');
    }
});
