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
    // Get references for story and chapters
    const storyRef = ref(database, `Truyen/${storyId}`);
    const chapterRef = ref(database, `Truyen/${storyId}/Chuong/`);

    // Create a promise array to fetch both data at once
    Promise.all([get(storyRef), get(chapterRef)])
        .then(([storySnapshot, chapterSnapshot]) => {
            if (storySnapshot.exists() && chapterSnapshot.exists()) {
                const storyData = storySnapshot.val();
                const chapters = chapterSnapshot.val();

                // Display the story title
                document.getElementById('story-title').innerText = storyData.name;

                // Initialize chapter data
                let currentChapterIndex = 0;
                loadChapter(currentChapterIndex, chapters);

                // Populate chapter selection dropdowns
                populateChapterSelect(chapters);

                // Handle chapter navigation
                document.getElementById('prev-chapter-top').addEventListener('click', () => goToPreviousChapter(chapters));
                document.getElementById('next-chapter-top').addEventListener('click', () => goToNextChapter(chapters));
                document.getElementById('prev-chapter-bottom').addEventListener('click', () => goToPreviousChapter(chapters));
                document.getElementById('next-chapter-bottom').addEventListener('click', () => goToNextChapter(chapters));

                // Update content display on dropdown change
                document.getElementById('chapterSelect').addEventListener('change', (event) => {
                    currentChapterIndex = parseInt(event.target.value);
                    loadChapter(currentChapterIndex, chapters);
                    document.getElementById('chapterSelectBottom').value = currentChapterIndex;
                });

                document.getElementById('chapterSelectBottom').addEventListener('change', (event) => {
                    currentChapterIndex = parseInt(event.target.value);
                    loadChapter(currentChapterIndex, chapters);
                    document.getElementById('chapterSelect').value = currentChapterIndex;
                });

                // Update navigation button state when a chapter is loaded
                function updateNavigationButtons(index, chapters) {
                    const prevDisabled = index === 0;
                    const nextDisabled = index === Object.keys(chapters).length - 1;

                    document.getElementById('prev-chapter-top').disabled = prevDisabled;
                    document.getElementById('prev-chapter-bottom').disabled = prevDisabled;
                    document.getElementById('next-chapter-top').disabled = nextDisabled;
                    document.getElementById('next-chapter-bottom').disabled = nextDisabled;
                }

                // Load chapter function
                function loadChapter(index, chapters) {
                    const chapter = chapters[`chapter_${index + 1}`];
                    if (chapter) {
                        document.getElementById('chapter-title').innerText = `Chương ${index + 1}: ${chapter.title}`;
                        document.getElementById('chapter-content').innerText = chapter.content;
                        updateNavigationButtons(index, chapters);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }

                // Go to previous chapter
                function goToPreviousChapter(chapters) {
                    if (currentChapterIndex > 0) {
                        currentChapterIndex--;
                        loadChapter(currentChapterIndex, chapters);
                        syncChapterSelect();
                    }
                }

                // Go to next chapter
                function goToNextChapter(chapters) {
                    if (currentChapterIndex < Object.keys(chapters).length - 1) {
                        currentChapterIndex++;
                        loadChapter(currentChapterIndex, chapters);
                        syncChapterSelect();
                    }
                }

                // Synchronize chapter select dropdowns
                function syncChapterSelect() {
                    document.getElementById('chapterSelect').value = currentChapterIndex;
                    document.getElementById('chapterSelectBottom').value = currentChapterIndex;
                }

                // Populate chapter selection dropdowns
                function populateChapterSelect(chapters) {
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
                }

            } else {
                alert("Truyện không tồn tại.");
            }
        })
        .catch((error) => {
            console.error("Lỗi khi lấy dữ liệu: ", error);
        });
}
