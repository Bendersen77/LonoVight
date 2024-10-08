const chapters = [
    { title: "Chapter 1: The Beginning", url: "#chapter-1" },
    { title: "Chapter 2: A New Journey", url: "#chapter-2" },
    { title: "Chapter 3: The Plot Thickens", url: "#chapter-3" },
    { title: "Chapter 4: Conflict Arises", url: "#chapter-4" },
    { title: "Chapter 5: The Climax", url: "#chapter-5" }
];

// Lấy phần tử danh sách chương
const chapterList = document.getElementById('chapter-list');

// Tạo danh sách chương động
chapters.forEach((chapter) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = chapter.title;
    a.href = chapter.url;
    li.appendChild(a);
    chapterList.appendChild(li);
});
const comments = [];

// Lấy phần tử form và danh sách bình luận
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const commentList = document.getElementById('comment-list');

// Thêm sự kiện khi form bình luận được submit
commentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Lấy nội dung bình luận từ input
    const newComment = commentInput.value;

    // Kiểm tra nếu bình luận không rỗng
    if (newComment.trim()) {
        // Thêm bình luận vào danh sách
        comments.push(newComment);

        // Hiển thị bình luận mới
        const li = document.createElement('li');
        li.textContent = newComment;
        commentList.appendChild(li);

        // Xóa nội dung trong ô nhập
        commentInput.value = '';
    }
});


// Thêm sự kiện cho nút "Read Now"
document.getElementById('read-now-btn').addEventListener('click', function() {
    alert("Redirecting to Wattpad to read the full novel!");
    // Thêm logic để chuyển hướng đến trang Wattpad của tiểu thuyết nếu cần
});
