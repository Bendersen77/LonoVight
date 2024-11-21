// Import Firebase functions at the top level
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";
import { getDatabase, ref, get, remove, onValue, onChildAdded } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

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

document.addEventListener('DOMContentLoaded', function() {
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
            if (signupBtn) {
                signupBtn.style.display = "block";
            }
        }
    });
});

//Vertical navigation bar
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection + 'Container') {
                    section.classList.add('active');
                }
            });
        });
    });
});

// Load user's reading history and read later
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadHistory(user.uid);
        await loadReadLater(user.uid);
    } else {
        window.location.href = 'SignUp.html';
    }
});

// Load read later stories
async function loadReadLater(userId) {
    try {
        const readLaterRef = ref(database, `Users/${userId}/ReadLater`);
        const snapshot = await get(readLaterRef);
        const readLaterContainer = document.getElementById('readLaterContainer');
        readLaterContainer.innerHTML = ''; // Clear previous content

        if (snapshot.exists()) {
            const stories = snapshot.val();

            for (const [storyId, story] of Object.entries(stories)) {
                const storyRef = ref(database, `Truyen/${storyId}/Chuong`);
                const chaptersSnapshot = await get(storyRef);

                const chapterData = chaptersSnapshot.val();
                const newChapters = [];
                if (chapterData) {
                    for (const [chapterId, chapter] of Object.entries(chapterData)) {
                        if (new Date(chapter.createdAt) > new Date(story.lastChecked || 0)) {
                            newChapters.push({ chapterId, ...chapter });
                        }
                    }
                }

                // Create story card
                const storyCard = document.createElement('div');
                storyCard.classList.add('read-later-card');
                storyCard.innerHTML = `
                        <div class="story-containar">
    <div class="story-thumbnail">
        <h3 class="story-title">${story.name}</h3>
        <img src="${story.imageUrl}" alt="${story.name}">
    </div>
    <div class="story-details">
        <div class="chapter-list-container">
            ${newChapters.length > 0 
                ? `<p class="chapters-available">${newChapters.length} new chapters available:</p>` 
                : '<p class="chapters-available">No new chapters</p>'}
            <ul class="chapter-list">
                ${newChapters.map(chapter => `
                    <li class="chapter-item">
                        <a href="Read.html?id=${storyId}&chapter=${chapter.chapterId.replace('chapter_', '')}" 
                        class="chapter-link" 
                        data-story-id="${storyId}" 
                        data-chapter-id="${chapter.chapterId}">
                        <div class="chapter-info">
                            <i class="fas fa-book"></i>
                            <span>Chapter ${chapter.chapterId.replace('chapter_', '')}:</span> 
                            <span class="chapter-title">${chapter.title}</span>
                        </div>
                        </a>
                         <div class="chapter-meta">
                            <span><i class="fas fa-clock"></i> ${getTimeAgo(new Date(chapter.createdAt))}</span>
                        </div>
                        
                    </li>
                `).join('')}
            </ul>
        </div>
        <button class="remove-story" data-id="${storyId}"><i class="fas fa-trash-alt"></i> Remove</button>
    </div>
</div>


`;


                readLaterContainer.appendChild(storyCard);

                // Add event listener to "Remove" button
                storyCard.querySelector('.remove-story').addEventListener('click', async () => {
                    await remove(ref(database, `Users/${userId}/ReadLater/${storyId}`));
                    alert(`${story.name} has been removed from your Read Later list.`);
                    loadReadLater(userId);
                });

                storyCard.querySelector('.chapter-link').addEventListener('click', (event) => {
                    event.preventDefault();
                
                    const storyId = event.currentTarget.getAttribute('data-story-id');
                    const chapterId = event.currentTarget.getAttribute('data-chapter-id');
                
                    if (storyId && chapterId) {
                        const chapterNumber = chapterId.replace('chapter_', ''); // Extract numeric chapter ID
                        const url = `Read.html?id=${storyId}&chapter=${chapterNumber}`;
                        window.location.href = url;
                    } else {
                        console.error('Missing data attributes for story or chapter.');
                    }
                });
                



            }
        } else {
            readLaterContainer.innerHTML = '<p class="no-stories">No stories in your Read Later list.</p>';
        }
    } catch (error) {
        console.error('Error loading Read Later list:', error);
        readLaterContainer.innerHTML = '<p class="error">Failed to load your Read Later list. Please try again later.</p>';
    }
}





// Load user's reading history
async function loadHistory(userId) {
    try {
        const historyRef = ref(database, `Users/${userId}/History`);
        const snapshot = await get(historyRef);
        const historyContainer = document.getElementById('historyContainer');
        historyContainer.innerHTML = '';

        if (snapshot.exists()) {
            const histories = snapshot.val();

            for (const [storyId, story] of Object.entries(histories)) {
                const chaptersRef = ref(database, `Truyen/${storyId}/Chuong/`);
                const chaptersSnapshot = await get(chaptersRef);
                const lastReadChaptersRef = ref(database, `Users/${userId}/lastReadChapters`);

                let totalChapters = 0;
                let currentChapter = parseInt(story.currentChapter) || 1;
                const lastReadChapterSnapshot = await get(lastReadChaptersRef);
                if (lastReadChapterSnapshot.exists()) {
                    const lastReadChapters = lastReadChapterSnapshot.val();
                    if (lastReadChapters && lastReadChapters[storyId]) {
                        currentChapter = lastReadChapters[storyId].chapterIndex;
                    }
                }
                if (chaptersSnapshot.exists()) {
                    totalChapters = Object.keys(chaptersSnapshot.val()).length;
                } else {
                    totalChapters = currentChapter;
                }

                const progress = totalChapters > 0 ? ((currentChapter / totalChapters) * 100).toFixed(1) : 0;
                const lastReadDate = new Date(story.lastRead);
                const timeAgo = getTimeAgo(lastReadDate);

                const historyDiv = document.createElement('div');
                historyDiv.classList.add('history-item');
                historyDiv.innerHTML = `
                    <div class="story-info">
                        <img src="${story.imageUrl}" alt="${story.name}" class="storylib-thumbnail">
                        <div class="title-section">
                            <h3>${story.name}</h3>
                            <span class="rank">Rank ${story.rank || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="progress-section">
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">
                            Chapter ${currentChapter} / ${totalChapters} (${progress}%)
                        </span>
                    </div>
                    <div class="last-read-section">
                        <span class="time-ago">${timeAgo}</span>
                        <a href="#" class="chapter-info" data-story-id="${storyId}" data-chapter-index="${currentChapter}">
                            Continue Reading from Chapter ${currentChapter}
                        </a>
                    </div>
                `;

                // Add click event listener to chapter
                const chapterInfo = historyDiv.querySelector('.chapter-info');
                chapterInfo.addEventListener('click', (event) => {
                    event.preventDefault();
                    const storyId = event.target.dataset.storyId;
                    const chapterIndex = parseInt(event.target.dataset.chapterIndex);  // No need to subtract 1
                    window.location.href = `Read.html?id=${storyId}&chapter=${chapterIndex}`;
                });

                historyContainer.appendChild(historyDiv);
            }
        } else {
            console.error("User's history not found in the database.");
        }
    } catch (error) {
        console.error("Error loading user's history:", error);
    }
}

// Get time ago in a human-readable format
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} years ago`;
}