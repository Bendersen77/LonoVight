// Lấy các phần tử cần thiết từ DOM
const commentsList = document.getElementById('commentsList');
const commentInput = document.getElementById('commentInput');
const submitCommentButton = document.getElementById('submitComment');

// Hàm để hiển thị bình luận
function displayComments() {
    const comments = JSON.parse(localStorage.getItem('comments')) || [];
    commentsList.innerHTML = comments.map((comment, index) => `
        <div class="comment">
            <span>User:</span>
            <p>${comment}</p>
            <button class="deleteComment" data-index="${index}">Xóa</button>
        </div>
    `).join('');

    // Thêm sự kiện cho nút xóa
    const deleteButtons = document.querySelectorAll('.deleteComment');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleCommentDelete);
    });
}

// Hàm để xử lý gửi bình luận
function handleCommentSubmit() {
    const comment = commentInput.value.trim();
    if (comment) {
        // Lưu bình luận vào Local Storage
        const comments = JSON.parse(localStorage.getItem('comments')) || [];
        comments.push(comment);
        localStorage.setItem('comments', JSON.stringify(comments));

        // Hiển thị bình luận mới
        displayComments();
        commentInput.value = ''; // Xóa ô nhập
    } else {
        alert("Vui lòng nhập bình luận!");
    }
}

// Hàm để xử lý xóa bình luận
function handleCommentDelete(event) {
    const index = event.target.getAttribute('data-index'); // Lấy chỉ số của bình luận
    const comments = JSON.parse(localStorage.getItem('comments')) || [];
    comments.splice(index, 1); // Xóa bình luận theo chỉ số
    localStorage.setItem('comments', JSON.stringify(comments)); // Cập nhật lại Local Storage

    displayComments(); // Cập nhật hiển thị bình luận
}

// Thêm sự kiện click cho nút gửi bình luận
submitCommentButton.addEventListener('click', handleCommentSubmit);

// Hiển thị bình luận khi trang được tải
window.onload = function() {
    loadStoryDetail(); // Gọi hàm load chi tiết truyện (nếu có)
    displayComments(); // Hiển thị bình luận đã lưu
};
