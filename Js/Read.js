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
const dbRef = ref(database, 'Truyen/story_e0vkrttwh/Chuong/');  // Đảm bảo đường dẫn đúng

let chapters = [];
let currentChapterIndex = 0;

// Load all chapters from Firebase
get(dbRef).then((snapshot) => {
    if (snapshot.exists()) {
        chapters = snapshot.val();
        console.log("Dữ liệu chương:", chapters);  // Kiểm tra dữ liệu lấy được từ Firebase
        loadChapter(currentChapterIndex);  // Load chương đầu tiên
    } else {
        console.log("Không có dữ liệu");
    }
}).catch((error) => {
    console.error("Lỗi khi lấy dữ liệu: ", error);
});

// Load a chapter
function loadChapter(index) {
    const chapter = chapters[`chapter_${index + 1}`];  // Lấy chương theo index
    if (chapter) {
        // Tên truyện có thể lấy từ Firebase nếu có
        document.getElementById('story-title').innerText = "Bút Ký Phản Công Của Nữ Phụ Pháo Hôi";  // Hoặc lấy từ dữ liệu Firebase nếu có
        document.getElementById('chapter-title').innerText = `Chương ${index + 1}: ${chapter.title}`;
        document.getElementById('chapter-content').innerText = chapter.content;

        // Cuộn đến phần nội dung chương mà không cuộn lên đầu
        const chapterContent = document.getElementById('chapter-content');
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Cuộn mượt mà
        });
    } else {
        console.log("Chương không tồn tại");
    }
}

// Handle next chapter
document.getElementById('next-chapter-top').addEventListener('click', (event) => {
    event.preventDefault();  // Ngừng hành động mặc định (tránh cuộn lên đầu trang)
    if (currentChapterIndex < Object.keys(chapters).length - 1) {
        currentChapterIndex++;
        loadChapter(currentChapterIndex);
    }
});

// Handle previous chapter
document.getElementById('prev-chapter-top').addEventListener('click', (event) => {
    event.preventDefault();  // Ngừng hành động mặc định
    if (currentChapterIndex > 0) {
        currentChapterIndex--;
        loadChapter(currentChapterIndex);
    }
});

// Handle next chapter
document.getElementById('next-chapter-bottom').addEventListener('click', (event) => {
    event.preventDefault();  // Ngừng hành động mặc định
    if (currentChapterIndex < Object.keys(chapters).length - 1) {
        currentChapterIndex++;
        loadChapter(currentChapterIndex);
    }
});

// Handle previous chapter
document.getElementById('prev-chapter-bottom').addEventListener('click', (event) => {
    event.preventDefault();  // Ngừng hành động mặc định
    if (currentChapterIndex > 0) {
        currentChapterIndex--;
        loadChapter(currentChapterIndex);
    }
});
