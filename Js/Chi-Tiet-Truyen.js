import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDbH--EpZjimx-cc_HToTYyc69fOALCuA",
    authDomain: "novolight-7dbfa.firebaseapp.com",
    databaseURL: "https://novolight-7dbfa-default-rtdb.firebaseio.com",
    projectId: "novolight-7dbfa",
    storageBucket: "novolight-7dbfa.appspot.com",
    messagingSenderId: "500138366341",
    appId: "1:500138366341:web:21f3dd63f2b7a70f9aa0ec",
    measurementId: "G-7PQF6N9T85"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Lấy ID từ URL
const urlParams = new URLSearchParams(window.location.search);
const storyId = urlParams.get('id');

async function loadStoryDetails() {
    const storyRef = ref(database, `Truyen/${storyId}`);
    const snapshot = await get(storyRef);
    const story = snapshot.val();

    if (story) {
        document.getElementById('storyNameDetail').textContent = story.name;
        document.getElementById('storyCategoryDetail').textContent = `Thể loại: ${story.category}`;
        document.getElementById('storyImageDetail').src = story.imageUrl; // Đảm bảo story.imageUrl là một URL hợp lệ
        document.getElementById('storyDescriptionDetail').textContent = story.description;
        loadChapters(); // Load chapters if they exist
    } else {
        alert('Truyện không tồn tại!');
    }
}

// Hàm để tải danh sách chương
async function loadChapters() {
    const chaptersRef = ref(database, `Truyen/${storyId}/Chuong`);
    const snapshot = await get(chaptersRef);
    const chapters = snapshot.val() || {};

    const chapterList = document.getElementById('chapterList');
    chapterList.innerHTML = ''; // Xóa danh sách hiện tại

    for (const chapterId in chapters) {
        const chapter = chapters[chapterId];
        const chapterDiv = document.createElement('div');
        
        // Giới hạn nội dung ở 100 ký tự
        const contentPreview = chapter.content.length > 100 ? chapter.content.substring(0, 100) + '...' : chapter.content;

        // Thay thế các ký tự xuống dòng bằng <br> để hiển thị đúng
        const formattedContent = chapter.content.replace(/\n/g, '<br>');

        chapterDiv.innerHTML = `
            <p style="text-align: left">Chương ${chapter.chapter} - ${chapter.title}</p>
            <p class="chapter-content" style="word-wrap: break-word; max-width: 800px; text-align: left">${contentPreview}</p>
            <p class="full-content" style="display: none;">${formattedContent}</p>
            <button class="toggle-button" onclick="toggleContent(this)">Xem thêm</button>
            <button class="edit-button" onclick="editChapter('${chapterId}')">Sửa</button>
            <button class="delete-button" onclick="deleteChapter('${chapterId}')">Xóa</button>
            <hr style="border: 1px solid #ccc; margin: 10px 0;"> <!-- Đường gạch ngang -->
        `;

        chapterList.appendChild(chapterDiv);
    }
}



// Định nghĩa toggleContent để có thể sử dụng trong HTML
window.toggleContent = function(button) {
    const chapterDiv = button.parentElement;
    const chapterContent = chapterDiv.querySelector('.chapter-content');
    const fullContent = chapterDiv.querySelector('.full-content');

    if (fullContent.style.display === 'none' || !fullContent.style.display) {
        fullContent.style.display = 'block'; // Hiển thị nội dung đầy đủ
        chapterContent.style.display = 'none'; // Ẩn nội dung giới hạn
        button.textContent = 'Thu gọn'; // Đổi văn bản nút
    } else {
        fullContent.style.display = 'none'; // Ẩn nội dung đầy đủ
        chapterContent.style.display = 'block'; // Hiển thị nội dung giới hạn
        button.textContent = 'Xem thêm'; // Đổi văn bản nút
    }
};




// Xử lý thêm chương mới
document.getElementById('chapterForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const chapterNumber = document.getElementById('chapterNumber').value;
    const chapterTitle = document.getElementById('chapterTitle').value;
    const chapterContent = document.getElementById('chapterContent').value;

    const chapterId = `chapter_${chapterNumber}`;

    // Lưu chương vào đúng node
    await set(ref(database, `Truyen/${storyId}/Chuong/${chapterId}`), {
        chapter: chapterNumber,
        title: chapterTitle,
        content: chapterContent
    });

    alert('Chương đã được thêm thành công!');
    document.getElementById('chapterForm').reset();
    loadChapters(); // Reload chapters after adding
});

window.editChapter = async (chapterId) => {
    const chapterRef = ref(database, `Truyen/${storyId}/Chuong/${chapterId}`);
    const snapshot = await get(chapterRef);
    const chapter = snapshot.val();

    if (chapter) {
        const chapterNumberInput = document.getElementById('editChapterNumber');
        const chapterTitleInput = document.getElementById('editChapterTitle');
        const chapterContentInput = document.getElementById('editChapterContent');

        // Kiểm tra nếu các phần tử tồn tại
        if (chapterNumberInput && chapterTitleInput && chapterContentInput) {
            // Cập nhật giá trị
            chapterNumberInput.value = chapter.chapter;
            chapterTitleInput.value = chapter.title;
            chapterContentInput.value = chapter.content;

            // Hiển thị modal sửa chương
            document.getElementById('editChapterModal').style.display = 'block';

            // Xử lý lưu thay đổi
            document.getElementById('editChapterForm').onsubmit = async (event) => {
                event.preventDefault();

                const updatedChapter = {
                    chapter: chapterNumberInput.value,
                    title: chapterTitleInput.value,
                    content: chapterContentInput.value,
                };

                await set(ref(database, `Truyen/${storyId}/Chuong/${chapterId}`), updatedChapter);
                alert('Cập nhật chương thành công!');
                document.getElementById('editChapterModal').style.display = 'none'; // Đóng modal
                loadChapters(); // Tải lại danh sách chương
            };

            // Xử lý đóng modal
            document.getElementById('closeEditChapterModal').onclick = () => {
                document.getElementById('editChapterModal').style.display = 'none'; // Đóng modal
            };
        } else {
            console.error("Một hoặc nhiều phần tử không tìm thấy.");
        }
    } else {
        console.error("Chương không tồn tại.");
    }
};


// Hàm xóa chương
window.deleteChapter = async (chapterId) => {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa chương này không?");
    if (confirmDelete) {
        await remove(ref(database, `Truyen/${storyId}/Chuong/${chapterId}`));
        alert('Chương đã được xóa thành công!');
        loadChapters(); // Reload chapters after deleting
    } else {
        alert('Hủy xóa chương.');
    }
};
// Khi tải trang, gọi loadStoryDetails
window.onload = loadStoryDetails;