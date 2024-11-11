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

                    
                    loadFavoriteStories(user.uid);
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
// Function to remove a story from the "Read Later" list
function removeFromFavorite(storyId) {
    // Get the current logged-in user
    const user = auth.currentUser;
    if (user) {
        const FavoriteRef = ref(database, `Users/${user.uid}/Favorite/${storyId}`);
        remove(FavoriteRef)
            .then(() => {
                console.log(`Story with ID ${storyId} removed from Favorite list.`);
                alert("Story removed from Favorite.");
                // Reload the Read Later stories after removal
                loadFavoriteStories(user.uid);
            })
            .catch((error) => {
                console.error("Error removing story from Favorite:", error);
                alert("Failed to remove the story. Please try again.");
            });
    } else {
        console.log("No user logged in. Cannot remove story.");
    }
}
// Function to load user's Read Later stories
async function loadFavoriteStories(userId) {
    try {
        const FavoriteRef = ref(database, `Users/${userId}/Favorite`);
        const snapshot = await get(FavoriteRef);
        const FavoriteStories = snapshot.val();

        const FavoriteContainer = document.getElementById('FavoriteContainer');
        FavoriteContainer.innerHTML = '';

        if (!FavoriteStories) {
            FavoriteContainer.innerHTML = '<p>No stories saved for Favorite.</p>';
            return;
        }

        for (const storyId in FavoriteStories) {
            const story = FavoriteStories[storyId];

            const storyDiv = document.createElement('div');
            storyDiv.classList.add('single-card');

            // Create the HTML structure
            storyDiv.innerHTML = `
                <div class="img-area">
                    <img src="${story.imageUrl}" alt="${story.name}">
                    <div class="overlay">
                        <h3 class="story-name">${story.name}</h3>
                        <button class="view-details" id="startReadingBtn-${storyId}">Start reading</button>
                        <button class="view-details" id="removeBtn-${storyId}">Remove</button>
                    </div>
                </div>
            `;

            FavoriteContainer.appendChild(storyDiv);

            // Attach event listener for the "Remove" button
            const removeButton = document.getElementById(`removeBtn-${storyId}`);
            removeButton.addEventListener('click', () => {
                removeFromFavorite(storyId);
            });

            // Attach event listener for the "Start reading" button
            const startReadingButton = document.getElementById(`startReadingBtn-${storyId}`);
            startReadingButton.addEventListener('click', () => {
                // location.href = `chi-tiet-truyen.html?id=${storyId}`;
            });
        }

    } catch (error) {
        console.error("Error loading Favorite stories:", error);
        alert("Could not load your saved stories. Please try again later.");
    }
}



