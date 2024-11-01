let currentChapter = 1;
const totalChapters = 3; // Cập nhật số lượng chương

// Hàm để điều hướng giữa các chương
function navigateChapter(direction) {
    // Ẩn chương hiện tại
    document.getElementById(`chapter-${currentChapter}`).style.display = 'none';
    document.querySelector(`article:nth-of-type(${currentChapter})`).style.display = 'none';

    // Cập nhật chương hiện tại
    currentChapter += direction;

    // Đảm bảo chương hiện tại không vượt quá giới hạn
    if (currentChapter < 1) {
        currentChapter = 1; // Giữ lại chương đầu tiên
    } else if (currentChapter > totalChapters) {
        currentChapter = totalChapters; // Giữ lại chương cuối cùng
    }

    // Hiện chương mới
    document.getElementById(`chapter-${currentChapter}`).style.display = 'block';
    document.querySelector(`article:nth-of-type(${currentChapter})`).style.display = 'block';

    // Cuộn lên đầu trang một cách mượt mà
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Cuộn mượt mà
    });

    // Cập nhật trạng thái của nút
    updateButtonState();
}

// Hàm để cập nhật trạng thái của các nút
function updateButtonState() {
    document.getElementById('prev-chapter').disabled = currentChapter === 1;
    document.getElementById('next-chapter').disabled = currentChapter === totalChapters;
}

// Thêm các sự kiện cho nút điều hướng
document.getElementById('next-chapter').addEventListener('click', function() {
    navigateChapter(1); // Đi tới chương tiếp theo
});

document.getElementById('prev-chapter').addEventListener('click', function() {
    navigateChapter(-1); // Đi tới chương trước
});
// Hàm để cập nhật trạng thái của các nút
function updateButtonState() {
    document.getElementById('prev-chapter1').disabled = currentChapter === 1;
    document.getElementById('next-chapter1').disabled = currentChapter === totalChapters;
}

// Thêm các sự kiện cho nút điều hướng
document.getElementById('next-chapter1').addEventListener('click', function() {
    navigateChapter(1); // Đi tới chương tiếp theo
});

document.getElementById('prev-chapter1').addEventListener('click', function() {
    navigateChapter(-1); // Đi tới chương trước
});
// Gọi hàm cập nhật trạng thái ban đầu
updateButtonState();
