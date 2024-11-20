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
            // User is signed in, display user info
            console.log("User logged in:", user.email);
            if (userEmailElement && userInfoElement) {
                userEmailElement.textContent = user.email;
                userInfoElement.style.display = "block";
            }

            // Hide the "Sign Up" button when logged in
            if (signupBtn) {
                signupBtn.style.display = "none";
            }

            // Get the user's role from the Firebase Realtime Database
            const roleRef = ref(database, `Users/${user.uid}/role`);
            get(roleRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const role = snapshot.val();
                    console.log("User Role:", role);

                    if (userManagementLink) {
                        if (role === 'Admin') {
                            userManagementLink.style.display = "block";
                        } else {
                            userManagementLink.style.display = "none"; // Hide if not Admin
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

            // Logout event
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
            // No user is signed in, redirect to SignUp or Login page
            console.log("No user is logged in");
        }
    });
});

// Lấy ID truyện từ URL
const urlParams = new URLSearchParams(window.location.search);
const storyId = urlParams.get('id');

// Kiểm tra nếu không có id truyện
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

// Search functionality
const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestionsBox');

// Listen to search input
searchInput.addEventListener('input', async function () {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        await showSearchSuggestions(query);
    } else {
        suggestionsBox.innerHTML = ''; // Clear suggestions when no input
    }
});

// Show search suggestions
async function showSearchSuggestions(query) {
    try {
        const storiesRef = ref(database, 'Truyen');
        const snapshot = await get(storiesRef);
        const stories = snapshot.val();

        suggestionsBox.innerHTML = ''; // Clear old suggestions

        // Loop through stories and filter by query
        for (const id in stories) {
            const story = stories[id];
            if (story.name.toLowerCase().includes(query)) { // Search by substring
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = story.name;

                // Add click event to suggestion
                suggestionItem.addEventListener('click', () => {
                    window.location.href = `StoryDetail.html?id=${id}`;
                });

                suggestionsBox.appendChild(suggestionItem);
            }
        }

        // Show suggestions box if there are any
        suggestionsBox.style.display = suggestionsBox.innerHTML ? 'block' : 'none';
    } catch (error) {
        console.error("Error fetching stories for search:", error);
    }
}
