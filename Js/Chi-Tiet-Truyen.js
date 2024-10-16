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
        document.getElementById('storyImageDetail').src = story.imageUrl;
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
chapterDiv.innerHTML = `
    <h4>${chapter.title}</h4>
    <p style ="text-align: left">Chương ${chapter.chapter}</p>
    <p style="word-wrap: break-word; max-width: 800px; text-align: left">Nội dung: ${chapter.content}</p>
    <button onclick="editChapter('${chapterId}', '${chapter.title}', '${chapter.content}')">Sửa</button>
    <button onclick="deleteChapter('${chapterId}')">Xóa</button>
`;

        chapterList.appendChild(chapterDiv);
    }
}


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

// Hàm sửa chương
// Hiển thị modal để sửa thông tin truyện
function showEditModal(story) {
    document.getElementById('editStoryName').value = story.name;
    document.getElementById('editStoryCategory').value = story.category; // Cần load thể loại từ DB
    document.getElementById('editStoryDescription').value = story.description;
    
    // Hiển thị modal
    document.getElementById('editModal').style.display = 'block';

    // Xử lý lưu thay đổi
    document.getElementById('saveChangesButton').onclick = async () => {
        const updatedStory = {
            name: document.getElementById('editStoryName').value,
            category: document.getElementById('editStoryCategory').value,
            description: document.getElementById('editStoryDescription').value,
            // Cần xử lý upload hình ảnh nếu có
        };

        await set(ref(database, `Truyen/${storyId}`), updatedStory);
        alert('Cập nhật thành công!');
        document.getElementById('editModal').style.display = 'none'; // Đóng modal
        loadStoryDetails(); // Cập nhật lại thông tin truyện
    };

    // Xử lý đóng modal
    document.getElementById('closeModalButton').onclick = () => {
        document.getElementById('editModal').style.display = 'none'; // Đóng modal
    };
}

// Hàm xóa chương
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