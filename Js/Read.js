import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

// Firebase config
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Lấy ID truyện từ URL
const urlParams = new URLSearchParams(window.location.search);
const storyId = urlParams.get('id');

// Kiểm tra nếu không có `id` truyện
if (!storyId) {
    alert("Không tìm thấy ID truyện.");
} else {
    // Get story information from Firebase
    const storyRef = ref(database, `Truyen/${storyId}`);
    const chapterRef = ref(database, `Truyen/${storyId}/Chuong/`);
    let chapters = [];
    let currentChapterIndex = 0;

    // Lấy thông tin truyện và các chương
    get(storyRef).then((snapshot) => {
        if (snapshot.exists()) {
            const storyData = snapshot.val();
            // Hiển thị thông tin truyện
            document.getElementById('story-title').innerText = storyData.name;
            loadChapter(currentChapterIndex);  
        } else {
            alert("Truyện không tồn tại.");
        }
    }).catch((error) => {
        console.error("Lỗi khi lấy dữ liệu truyện: ", error);
    });

    // Lấy các chương
    get(chapterRef).then((snapshot) => {
        if (snapshot.exists()) {
            chapters = snapshot.val();
            console.log("Dữ liệu chương:", chapters);
            populateChapterSelect(); 
        } else {
            console.log("Không có dữ liệu chương.");
        }
    }).catch((error) => {
        console.error("Lỗi khi lấy dữ liệu chương: ", error);
    });

    // Hàm hiển thị chương
    function loadChapter(index) {
        const chapter = chapters[`chapter_${index + 1}`];
        if (chapter) {
            document.getElementById('chapter-title').innerText = `Chương ${index + 1}: ${chapter.title}`;
            document.getElementById('chapter-content').innerText = chapter.content;
            updateNavigationButtons();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Hàm điền các mục trong dropdown chọn chương
    function populateChapterSelect() {
        const chapterSelect = document.getElementById('chapterSelect');
        const chapterSelectBottom = document.getElementById('chapterSelectBottom');

        [chapterSelect, chapterSelectBottom].forEach((select) => {
            select.innerHTML = '';  // Clear dropdowns
            Object.keys(chapters).forEach((chapterKey, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `Chương ${index + 1}: ${chapters[chapterKey].title}`;
                select.appendChild(option);
            });
        });

        chapterSelect.addEventListener('change', (event) => {
            currentChapterIndex = parseInt(event.target.value);
            loadChapter(currentChapterIndex);
            chapterSelectBottom.value = currentChapterIndex;
        });

        chapterSelectBottom.addEventListener('change', (event) => {
            currentChapterIndex = parseInt(event.target.value);
            loadChapter(currentChapterIndex);
            chapterSelect.value = currentChapterIndex;
        });
    }

    // Sự kiện điều hướng chương
    document.getElementById('prev-chapter-top').addEventListener('click', goToPreviousChapter);
    document.getElementById('next-chapter-top').addEventListener('click', goToNextChapter);
    document.getElementById('prev-chapter-bottom').addEventListener('click', goToPreviousChapter);
    document.getElementById('next-chapter-bottom').addEventListener('click', goToNextChapter);

    function goToPreviousChapter() {
        if (currentChapterIndex > 0) {
            currentChapterIndex--;
            loadChapter(currentChapterIndex);
            syncChapterSelect();
        }
    }

    function goToNextChapter() {
        if (currentChapterIndex < Object.keys(chapters).length - 1) {
            currentChapterIndex++;
            loadChapter(currentChapterIndex);
            syncChapterSelect();
        }
    }

    // Đồng bộ các dropdown chọn chương
    function syncChapterSelect() {
        document.getElementById('chapterSelect').value = currentChapterIndex;
        document.getElementById('chapterSelectBottom').value = currentChapterIndex;
    }

    // Cập nhật trạng thái của các nút điều hướng
    function updateNavigationButtons() {
        const prevDisabled = currentChapterIndex === 0;
        const nextDisabled = currentChapterIndex === Object.keys(chapters).length - 1;

        document.getElementById('prev-chapter-top').disabled = prevDisabled;
        document.getElementById('prev-chapter-bottom').disabled = prevDisabled;
        document.getElementById('next-chapter-top').disabled = nextDisabled;
        document.getElementById('next-chapter-bottom').disabled = nextDisabled;
    }
}
