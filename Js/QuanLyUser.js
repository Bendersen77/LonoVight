import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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

// Function to load users and display them in the table
async function loadUsers() {
    try {
        const userTableBody = document.querySelector("#userTable tbody");
        userTableBody.innerHTML = ''; // Clear existing users

        const usersRef = ref(database, 'Users'); // Reference to the 'Users' node in the Realtime Database
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
            const users = snapshot.val();
            for (const uid in users) {
                const userData = users[uid];
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${userData.email}</td>
                    <td>${userData.role || "N/A"}</td> <!-- Display user role -->
                    <td>${uid}</td>
                    <td>
                        <button class="delete-button" data-id="${uid}">Xóa</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            }
        } else {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="4">Không tìm thấy người dùng</td>`;
            userTableBody.appendChild(row);
        }

        setupDeleteButtons();
    } catch (error) {
        console.error("Lỗi khi tải người dùng:", error);
    }
}

// Setup delete buttons
function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-id');
            deleteUserAccount(userId);
        });
    });
}

// Delete user
async function deleteUserAccount(userId) {
    const confirmDelete = confirm('Bạn có chắc chắn muốn xóa người dùng này không?');

    if (confirmDelete) {
        try {
            // Remove user from Realtime Database
            const userRef = ref(database, 'Users/' + userId);
            await set(userRef, null); // Delete user data from Realtime Database

            // Delete user from Firebase Authentication
            const user = auth.currentUser; // User must be signed in to delete
            if (user) {
                await deleteUser(user);
                alert('Xóa người dùng thành công!');
                loadUsers(); // Refresh the user list
            }
        } catch (error) {
            console.error('Lỗi khi xóa người dùng:', error);
            alert('Có lỗi xảy ra khi xóa người dùng: ' + error.message);
        }
    }
}

// Search users by email
document.getElementById('searchBar').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    const userTableBody = document.querySelector("#userTable tbody");
    const rows = userTableBody.querySelectorAll("tr");

    rows.forEach(row => {
        const emailCell = row.cells[0].textContent.toLowerCase();
        if (emailCell.includes(searchTerm) || searchTerm === "") {
            row.style.display = ""; // Show row
        } else {
            row.style.display = "none"; // Hide row
        }
    });
});

// Load users when the page is loaded
window.onload = loadUsers;