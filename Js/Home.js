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


// Function to load stories
async function loadStories() {
    try {
        const storiesRef = ref(database, 'Truyen');
        const snapshot = await get(storiesRef);
        const stories = snapshot.val();

        const storyContainer = document.getElementById('storyContainer');
        storyContainer.innerHTML = '';

        for (const id in stories) {
            const story = stories[id];

            const storyDiv = document.createElement('div');
            storyDiv.classList.add('single-card');

            storyDiv.innerHTML = `
                <div class="img-area">
                    <img src="${story.imageUrl}" alt="${story.name}">
                    <div class="overlay">
                        <h3 class="story-name">${story.name}</h3>
                        <button class="view-details" data-id="${id}">Start reading</button>
                        <button class="read-later" data-id="${id}">Read Later</button> <!-- Read Later button -->
                        <button class="add-favorite" data-id="${id}">Add Your Favorite</button>
                    </div>
                </div>
            `;
            storyContainer.appendChild(storyDiv);
        }
        // Attach event listeners to "Start Reading" buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', async (event) => {
                const storyId = event.target.getAttribute('data-id');
                
                // Save the story to the user's reading history
                await saveStoryToHistory(storyId);

                // Redirect to the story details page
                location.href = `StoryDetail.html?id=${storyId}`;
            });
        });
        // Attach event listeners to Read Later buttons
        document.querySelectorAll('.read-later').forEach(button => {
            button.addEventListener('click', (event) => {
                const storyId = event.target.getAttribute('data-id');
                addStoryToReadLater(storyId);
            });
        });
        document.querySelectorAll('.add-favorite').forEach(button => {
            button.addEventListener('click', (event) => {
                const storyId = event.target.getAttribute('data-id');
                addStoryToFavorite(storyId);
            });
        });
    } catch (error) {
        console.error("Error loading stories:", error);
        alert("Could not load stories. Please try again later.");
    }
}


// Search functionality
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

searchButton.addEventListener('click', function() {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        searchStories(query);
    } else {
        loadStories();
    }
});

searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            searchStories(query);
        } else {
            loadStories();
        }
    }
});

async function searchStories(query) {
    try {
        const storiesRef = ref(database, 'Truyen');
        const snapshot = await get(storiesRef);
        const stories = snapshot.val();
        const storyContainer = document.getElementById('storyContainer');
        storyContainer.innerHTML = '';

        for (const id in stories) {
            const story = stories[id];
            if (story.name.toLowerCase().includes(query)) {
                const storyDiv = document.createElement('div');
                storyDiv.classList.add('single-card');

                storyDiv.innerHTML = `
                    <div class="img-area">
                        <img src="${story.imageUrl}" alt="${story.name}">
                        <div class="overlay">
                            <h3 class="story-name">${story.name}</h3>
                            <button class="view-details" onclick="location.href='chi-tiet-truyen.html?id=${id}'">Start reading</button>
                        </div>
                    </div>
                `;

                storyContainer.appendChild(storyDiv);
            }
        }

        if (storyContainer.innerHTML === '') {
            storyContainer.innerHTML = '<p>No stories found matching your search.</p>';
        }
    } catch (error) {
        console.error("Error searching stories:", error);
        alert("Could not search stories. Please try again later.");
    }
}
async function addStoryToReadLater(storyId) {
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to save a story to your Read Later list.");
        return;
    }

    try {
        // Get the story data from the database
        const storyRef = ref(database, `Truyen/${storyId}`);
        const storySnapshot = await get(storyRef);
        
        if (!storySnapshot.exists()) {
            alert("Story does not exist.");
            return;
        }

        const storyData = storySnapshot.val();

        // Reference to the user's Read Later list
        const userReadLaterRef = ref(database, `Users/${user.uid}/ReadLater/${storyId}`);
        const userReadLaterSnapshot = await get(userReadLaterRef);

        if (userReadLaterSnapshot.exists()) {
            alert("This story is already in your Read Later list.");
        } else {
            // Add the story to the user's Read Later list
            await set(userReadLaterRef, {
                name: storyData.name,
                imageUrl: storyData.imageUrl,
                category: storyData.category,   
                description: storyData.description
            });

            alert("Story added to your Read Later list!");
        }
    } catch (error) {
        console.error("Error adding story to Read Later:", error);
        alert("Could not add story to Read Later list. Please try again later.");
    }
}

async function addStoryToFavorite(storyId) {
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to save a story to your Favorite list.");
        return;
    }

    try {
        // Get the story data from the database
        const storyRef = ref(database, `Truyen/${storyId}`);
        const storySnapshot = await get(storyRef);
        
        if (!storySnapshot.exists()) {
            alert("Story does not exist.");
            return;
        }

        const storyData = storySnapshot.val();

        // Reference to the user's Read Later list
        const userFavoriteRef = ref(database, `Users/${user.uid}/Favorite/${storyId}`);
        const userFavoriteSnapshot = await get(userFavoriteRef);

        if (userFavoriteSnapshot.exists()) {
            alert("This story is already in your Favorite.");
        } else {
            // Add the story to the user's Read Later list
            await set(userFavoriteRef, {
                name: storyData.name,
                imageUrl: storyData.imageUrl,
                category: storyData.category,   
                description: storyData.description
            });

            alert("Story added to your Favorite list!");
        }
    } catch (error) {
        console.error("Error adding story to Favorite:", error);
        alert("Could not add story to Favorite list. Please try again later.");
    }
}



// Function to save story to reading history with date and time
async function saveStoryToHistory(storyId) {
    const user = auth.currentUser;

    if (!user) {
        return;
    }

    try {
        // Get the current date and time
        const currentDateTime = new Date().toISOString();

        // Reference to the story's data in the database
        const storyRef = ref(database, `Truyen/${storyId}`);
        const storySnapshot = await get(storyRef);

        if (!storySnapshot.exists()) {
            return;
        }

        // Get the story's data
        const storyData = storySnapshot.val();

        // Reference to the user's reading history for the specific story
        const userHistoryRef = ref(database, `Users/${user.uid}/History/${storyId}`);
        const userHistorySnapshot = await get(userHistoryRef);

        // If history for the story doesn't exist, create it with the current timestamp and story data
        if (!userHistorySnapshot.exists()) {
            await set(userHistoryRef, {
                name: storyData.name,
                imageUrl: storyData.imageUrl,
                category: storyData.category,   
                description: storyData.description,
                lastRead: currentDateTime  // Save the timestamp when the story was last read
            });
        } else {
            // Update the timestamp if history already exists
            await set(userHistoryRef, {
                name: storyData.name,
                imageUrl: storyData.imageUrl,
                category: storyData.category,   
                description: storyData.description,
                lastRead: currentDateTime   // Update the timestamp
            });
        }


    } catch (error) {
        console.error("Error saving to history:", error);
    }
}

