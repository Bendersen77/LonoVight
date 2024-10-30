// Mock user object with role (replace this with your actual authentication logic)
const user = {
    isLoggedIn: true, // Change based on actual login state
    name: "Akito",
    email: "akito@example.com",
    avatar: "../Image/logo.png",
    role: "Admin" // Example roles: "Admin", "User"
};

// Lấy phần tử email người dùng và dropdown
const userEmailElement = document.getElementById('userEmail');
const userInfoElement = document.getElementById('userInfo');
const userManagementLink = document.getElementById('userManagementLink');

// Kiểm tra trạng thái đăng nhập
if (user.isLoggedIn) {
    // Hiển thị thông tin người dùng
    userEmailElement.textContent = user.email;
    userInfoElement.style.display = "block"; // Show user info section

    // Chỉ hiển thị liên kết Quản lý người dùng nếu người dùng là Admin
    if (user.role === "Admin") {
        userManagementLink.style.display = "block"; // Show User Management link
    }

    // Thêm sự kiện logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        // Implement your logout logic here (e.g., clearing user session)
        console.log('User logged out');
        window.location.href = 'Home.html'; // Redirect to homepage after logout
    });
} else {
    // Ẩn thông tin người dùng nếu chưa đăng nhập
    userInfoElement.style.display = "none";
    // Chuyển hướng đến trang đăng nhập
    window.location.href = 'SignUp.html';
}





import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getDatabase, ref, set, push, get, update } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    // Your Firebase configuration
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to add a story to "Read Later" list
function addToReadLater(storyId) {
    const userId = user.email.replace('@', '_').replace('.', '_'); // Avoid special chars in Firebase paths
    const readLaterRef = ref(database, `users/${userId}/readLater/${storyId}`);

    get(readLaterRef).then(snapshot => {
        if (!snapshot.exists()) {
            // Add story ID to "Read Later" list
            set(readLaterRef, {
                storyId: storyId,
                dateAdded: new Date().toISOString()
            }).then(() => {
                alert('Story added to Read Later list!');
            }).catch(error => {
                console.error('Error adding to Read Later:', error);
            });
        } else {
            alert('This story is already in your Read Later list!');
        }
    }).catch(error => {
        console.error('Error checking Read Later:', error);
    });
}

// Function to load "Read Later" stories for the user
function loadReadLaterStories() {
    const userId = user.email.replace('@', '_').replace('.', '_');
    const readLaterRef = ref(database, `users/${userId}/readLater`);

    get(readLaterRef).then(snapshot => {
        if (snapshot.exists()) {
            const readLaterStories = Object.keys(snapshot.val());
            // Display read later stories or implement logic to fetch and show them
            console.log('Read Later stories:', readLaterStories);
        } else {
            console.log('No Read Later stories found');
        }
    }).catch(error => {
        console.error('Error loading Read Later stories:', error);
    });
}
// Function to Remove "Read Later" stories for the user
function removeFromReadLater(storyId) {
    const userId = user.email.replace('@', '_').replace('.', '_');
    const readLaterRef = ref(database, `users/${userId}/readLater/${storyId}`);

    // Remove the story from the "Read Later" list
    remove(readLaterRef).then(() => {
        alert('Story removed from Read Later list!');
        loadReadLaterStories(); // Reload the list
    }).catch(error => {
        console.error('Error removing story:', error);
    });
}
