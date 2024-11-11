// Import Firebase functions at the top level
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const userEmailElement = document.getElementById('userEmail');
    const userInfoElement = document.getElementById('userInfo');
    const userManagementLink = document.getElementById('userManagementLink');
    const logoutBtn = document.getElementById('logoutBtn');
    const signupBtn = document.getElementById('signupBtn');

    // Check login status using Firebase Authentication
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User logged in:", user.email);
            if (userEmailElement && userInfoElement) {
                userEmailElement.textContent = user.email;
                userInfoElement.style.display = "block";
            }

            if (signupBtn) {
                signupBtn.style.display = "none";
            }

            const roleRef = ref(database, `Users/${user.uid}/role`);
            get(roleRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const role = snapshot.val();
                    console.log("User Role:", role);

                    if (userManagementLink) {
                        if (role === 'Admin') {
                            userManagementLink.style.display = "block";
                        } else {
                            userManagementLink.style.display = "none";
                        }
                    }

                    // Load stories for all users
                    loadStories();
                } else {
                    console.error("User role not found in the database.");
                }
            }).catch((error) => {
                console.error("Error getting user role:", error);
            });

            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    signOut(auth).then(() => {
                        console.log('User logged out');
                        window.location.href = 'Home.html';
                    }).catch((error) => {
                        console.error("Error logging out:", error);
                    });
                });
            }

        } else {
            console.log("No user is logged in");
        }
    });
});

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

    // Check for the last read chapter when user is logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const lastReadRef = ref(database, `Users/${user.uid}/lastReadChapters/${storyId}`);
            get(lastReadRef).then((lastReadSnapshot) => {
                let lastReadChapterIndex = 0;
                if (lastReadSnapshot.exists()) {
                    lastReadChapterIndex = lastReadSnapshot.val().chapterIndex - 1;
                }
                loadStoryAndChapters(lastReadChapterIndex);
            }).catch((error) => {
                console.error("Error loading last read chapter:", error);
                loadStoryAndChapters(0);  // Default to chapter 1 if error occurs
            });
        } else {
            loadStoryAndChapters(0);  // Default to chapter 1 if no user is logged in
        }
    });

    // Function to load the story and chapters
function loadStoryAndChapters(startChapterIndex) {
    Promise.all([get(storyRef), get(chapterRef)])
        .then(([storySnapshot, chapterSnapshot]) => {
            if (storySnapshot.exists() && chapterSnapshot.exists()) {
                const storyData = storySnapshot.val();
                const chapters = chapterSnapshot.val();

                document.getElementById('story-title').innerText = storyData.name;

                let currentChapterIndex = startChapterIndex;
                loadChapter(currentChapterIndex, chapters);
                populateChapterSelect(chapters);

                // Sync dropdown after loading the chapter
                syncChapterSelect();

                document.getElementById('prev-chapter-top').addEventListener('click', () => goToPreviousChapter(chapters));
                document.getElementById('next-chapter-top').addEventListener('click', () => goToNextChapter(chapters));
                document.getElementById('prev-chapter-bottom').addEventListener('click', () => goToPreviousChapter(chapters));
                document.getElementById('next-chapter-bottom').addEventListener('click', () => goToNextChapter(chapters));

                document.getElementById('chapterSelect').addEventListener('change', (event) => {
                    currentChapterIndex = parseInt(event.target.value);
                    loadChapter(currentChapterIndex, chapters);
                    syncChapterSelect();
                });

                document.getElementById('chapterSelectBottom').addEventListener('change', (event) => {
                    currentChapterIndex = parseInt(event.target.value);
                    loadChapter(currentChapterIndex, chapters);
                    syncChapterSelect();
                });

                function updateNavigationButtons(index, chapters) {
                    const prevDisabled = index === 0;
                    const nextDisabled = index === Object.keys(chapters).length - 1;

                    document.getElementById('prev-chapter-top').disabled = prevDisabled;
                    document.getElementById('prev-chapter-bottom').disabled = prevDisabled;
                    document.getElementById('next-chapter-top').disabled = nextDisabled;
                    document.getElementById('next-chapter-bottom').disabled = nextDisabled;
                }

                function loadChapter(index, chapters) {
                    const chapter = chapters[`chapter_${index + 1}`];
                    if (chapter) {
                        document.getElementById('chapter-title').innerText = `Chương ${index + 1}: ${chapter.title}`;
                        document.getElementById('chapter-content').innerText = chapter.content;
                        updateNavigationButtons(index, chapters);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        saveLastReadChapter(storyId, index, chapter.title);
                    }
                }

                function saveLastReadChapter(storyId, chapterIndex, chapterTitle) {
                    const user = auth.currentUser;
                    if (user) {
                        const lastReadRef = ref(database, `Users/${user.uid}/lastReadChapters/${storyId}`);
                        set(lastReadRef, {
                            chapterIndex: chapterIndex + 1,
                            chapterTitle: chapterTitle,
                            storyId: storyId,
                            timestamp: Date.now()
                        }).then(() => {
                            console.log('Last read chapter saved successfully.');
                        }).catch((error) => {
                            console.error('Error saving last read chapter:', error);
                        });
                    }
                }

                function goToPreviousChapter(chapters) {
                    if (currentChapterIndex > 0) {
                        currentChapterIndex--;
                        loadChapter(currentChapterIndex, chapters);
                        syncChapterSelect();
                    }
                }

                function goToNextChapter(chapters) {
                    if (currentChapterIndex < Object.keys(chapters).length - 1) {
                        currentChapterIndex++;
                        loadChapter(currentChapterIndex, chapters);
                        syncChapterSelect();
                    }
                }

                function syncChapterSelect() {
                    document.getElementById('chapterSelect').value = currentChapterIndex;
                    document.getElementById('chapterSelectBottom').value = currentChapterIndex;
                }

                function populateChapterSelect(chapters) {
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
                }
            } else {
                alert("Truyện không tồn tại.");
            }
        })
        .catch((error) => {
            console.error("Lỗi khi lấy dữ liệu: ", error);
        });
   }

}

// Search functionality
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestionsBox');
let stories = [];

// Fetch stories data for search functionality
function loadStories() {
    const storiesRef = ref(database, 'Truyen');
    get(storiesRef).then((snapshot) => {
        if (snapshot.exists()) {
            stories = Object.values(snapshot.val());
            console.log('Fetched stories:', stories);
        } else {
            console.log('No stories found');
        }
    }).catch((error) => {
        console.error('Error fetching stories:', error);
    });
}

// Search input event listener
searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase();
    const filteredStories = stories.filter((story) => story.name.toLowerCase().includes(query));

    suggestionsBox.innerHTML = '';
    if (query) {
        filteredStories.forEach((story) => {
            const suggestion = document.createElement('div');
            suggestion.textContent = story.name;
            suggestion.classList.add('suggestion');
            suggestion.addEventListener('click', function () {
                searchInput.value = story.name;
                window.location.href = `DocTruyen.html?id=${story.id}`;
            });
            suggestionsBox.appendChild(suggestion);
        });
        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.style.display = 'none';
    }
});

document.addEventListener('click', function (event) {
    if (!suggestionsBox.contains(event.target) && event.target !== searchInput) {
        suggestionsBox.style.display = 'none';
    }
});
