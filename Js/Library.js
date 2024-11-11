// Import Firebase functions at the top level
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";
import { getDatabase, ref, get , remove} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

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

                    
                    loadReadLaterStories(user.uid);
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

// Load user's reading history amd read later
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadReadLater(user.uid);
        await loadHistory(user.uid);
    } else {
        window.location.href = 'SignUp.html';
    }
});

// Keep original loadReadLater function
async function loadReadLater(userId) {
    try {
        const readLaterRef = ref(database, `Users/${userId}/ReadLater`);
        const snapshot = await get(readLaterRef);
        const readLaterContainer = document.getElementById('readLaterContainer');
        readLaterContainer.innerHTML = '';

        if (snapshot.exists()) {
            const stories = snapshot.val();

            for (const storyId in stories) {
                const story = stories[storyId];
                const storyDiv = document.createElement('div');
                storyDiv.classList.add('single-card');

                storyDiv.innerHTML = `
                    <div class="img-area">
                        <img src="${story.imageUrl}" alt="${story.name}">
                        <div class="overlay">
                            <h3 class="story-name">${story.name}</h3>
                            <button class="view-details" data-id="${storyId}">Start reading</button>
                            <button class="remove-story" data-id="${storyId}">Remove</button>
                        </div>
                    </div>
                `;

                readLaterContainer.appendChild(storyDiv);
            }

            // Add event listeners for Start Reading buttons
            document.querySelectorAll('.view-details').forEach(button => {
                button.addEventListener('click', (event) => {
                    const storyId = event.target.getAttribute('data-id');
                    window.location.href = `StoryDetail.html?id=${storyId}`;
                });
            });

            // Add event listeners for Remove buttons
            document.querySelectorAll('.remove-story').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const storyId = event.target.getAttribute('data-id');
                    const user = auth.currentUser;
                    if (user) {
                        const storyRef = ref(database, `Users/${user.uid}/ReadLater/${storyId}`);
                        try {
                            await remove(storyRef);
                            // Refresh the display after removal
                            loadReadLater(user.uid);
                        } catch (error) {
                            console.error("Error removing story:", error);
                            alert("Failed to remove story. Please try again.");
                        }
                    }
                });
            });
        } else {
            readLaterContainer.innerHTML = '<p class="no-stories">No stories in your library yet.</p>';
        }
    } catch (error) {
        console.error("Error loading read later list:", error);
        readLaterContainer.innerHTML = '<p class="error">Failed to load stories. Please try again later.</p>';
    }
}




async function loadHistory(userId) {
    try {
        const historyRef = ref(database, `Users/${userId}/History`);
        const snapshot = await get(historyRef);
        const historyContainer = document.getElementById('historyContainer');
        historyContainer.innerHTML = '';

        // Add header
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('history-header');
        headerDiv.innerHTML = `
            <div class="novel-title">Novel Title</div>
            <div class="progress">Progress</div>
            <div class="last-read">Last Read</div>
        `;
        historyContainer.appendChild(headerDiv);

        if (snapshot.exists()) {
            const histories = snapshot.val();
            
            for (const [storyId, story] of Object.entries(histories)) {
                // Get the chapters data for this story - update path to match your structure
                const chaptersRef = ref(database, `Truyen/${storyId}/Chuong`);
                const chaptersSnapshot = await get(chaptersRef);
                
                // Calculate total chapters and progress
                let totalChapters = 0;
                let currentChapter = parseInt(story.currentChapter) || 1;
                
                if (chaptersSnapshot.exists()) {
                    // Count actual chapters
                    totalChapters = Object.keys(chaptersSnapshot.val()).length;
                } else {
                    totalChapters = currentChapter; // Fallback if no chapters found
                }

                // Calculate progress percentage
                const progress = totalChapters > 0 
                    ? ((currentChapter / totalChapters) * 100).toFixed(1) 
                    : 0;
                
                // Calculate time ago
                const lastReadDate = new Date(story.lastRead);
                const timeAgo = getTimeAgo(lastReadDate);

                const historyDiv = document.createElement('div');
                historyDiv.classList.add('history-item');
                historyDiv.innerHTML = `
                    <div class="story-info">
                        <img src="${story.imageUrl}" alt="${story.name}" class="story-thumbnail">
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
                        <a href="Read.html?id=${storyId}" class="chapter-info">
                            Continue Chapter ${currentChapter}
                        </a>
                    </div>
                `;
                historyContainer.appendChild(historyDiv);
            }
        } else {
            historyContainer.innerHTML += '<p class="no-stories">No reading history yet.</p>';
        }
    } catch (error) {
        console.error("Error loading history:", error);
        historyContainer.innerHTML = '<p class="error">Failed to load reading history. Please try again later.</p>';
    }
}
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