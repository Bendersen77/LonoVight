import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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
const dbRef = ref(database, 'Truyen/story_e0vkrttwh/Chuong/');  

let chapters = [];
let currentChapterIndex = 0;

// Tải tất cả chương từ Firebase
get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
        chapters = snapshot.val();
        console.log("Dữ liệu chương:", chapters);
        loadChapter(currentChapterIndex);  
        populateChapterSelect(); 
    } else {
        console.log("Không có dữ liệu");
    }
}).catch((error) => {
    console.error("Lỗi khi lấy dữ liệu: ", error);
});

// Hàm tải chương
function loadChapter(index) {
    const chapter = chapters[`chapter_${index + 1}`];
    if (chapter) {
        document.getElementById('story-title').innerText = "Bút Ký Phản Công Của Nữ Phụ Pháo Hôi"; 
        document.getElementById('chapter-title').innerText = `Chương ${index + 1}: ${chapter.title}`;
        document.getElementById('chapter-content').innerText = chapter.content;
        updateNavigationButtons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Hàm tạo danh sách dropdown chương
function populateChapterSelect() {
    const chapterSelect = document.getElementById('chapterSelect');
    const chapterSelectBottom = document.getElementById('chapterSelectBottom');

    [chapterSelect, chapterSelectBottom].forEach((select) => {
        select.innerHTML = '';
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

// Đồng bộ dropdown khi chuyển chương
function syncChapterSelect() {
    document.getElementById('chapterSelect').value = currentChapterIndex;
    document.getElementById('chapterSelectBottom').value = currentChapterIndex;
}

// Cập nhật trạng thái nút điều hướng
function updateNavigationButtons() {
    const prevDisabled = currentChapterIndex === 0;
    const nextDisabled = currentChapterIndex === Object.keys(chapters).length - 1;

    document.getElementById('prev-chapter-top').disabled = prevDisabled;
    document.getElementById('prev-chapter-bottom').disabled = prevDisabled;
    document.getElementById('next-chapter-top').disabled = nextDisabled;
    document.getElementById('next-chapter-bottom').disabled = nextDisabled;
}
