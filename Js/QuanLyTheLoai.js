import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

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
const database = getDatabase(app);
const auth = getAuth(app);

let currentPage = 1;
const categoriesPerPage = 5; // Số thể loại trên mỗi trang
let categories = {};

// Reference to categories in Firebase
const categoriesRef = ref(database, 'Thể loại');

async function loadCategories() {
    const snapshot = await get(categoriesRef);
    const categories = snapshot.val();

    const genreList = document.getElementById('genreList');
    genreList.innerHTML = ''; // Xóa nội dung cũ trước khi thêm mới

    const storiesRef = ref(database, 'Truyen');
    const storiesSnapshot = await get(storiesRef);
    const stories = storiesSnapshot.val() || {};

    const genreStoryCount = {};

    for (const key in stories) {
        const genreId = stories[key].category;
        if (genreId) {
            genreStoryCount[genreId] = (genreStoryCount[genreId] || 0) + 1;
        }
    }

    if (categories) {
        for (const key in categories) {
            const row = document.createElement('tr');
            
            // Thêm sự kiện click để tải truyện của thể loại
            row.setAttribute("dataGenre", categories[key]);
            row.addEventListener("click", function (event){
                const genreName = this.getAttribute("dataGenre");
                window.location.href = `ChiTietTheLoai.html?genreName=${genreName}`;
            });

            const idCell = document.createElement('td');
            idCell.textContent = key;
            row.appendChild(idCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = categories[key];
            row.appendChild(nameCell);

            const storyCountCell = document.createElement('td');
            storyCountCell.textContent = genreStoryCount[categories[key]] || 0;
            row.appendChild(storyCountCell);

            const actionCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Chỉnh sửa';
            editButton.onclick = (event) => {
                event.stopPropagation();
                const genreId = key;
                document.getElementById('editGenreName').value = categories[key];
                document.getElementById('editModal').setAttribute('data-genre-id', genreId);
                document.getElementById('editModal').style.display = 'block';
            };
            actionCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Xóa';
            deleteButton.style.marginLeft = '10px';
            deleteButton.onclick = async (event) => {
                event.stopPropagation();
                const confirmDelete = confirm("Bạn có chắc chắn muốn xóa thể loại này không?");
                if (confirmDelete) {
                    await deleteCategory(key);
                }
            };
            actionCell.appendChild(deleteButton);

            row.appendChild(actionCell);
            genreList.appendChild(row);
        }
    } else {
        console.log("Không có thể loại nào được tìm thấy.");
    }
}

// Hàm để lấy ID cuối cùng
async function getLastCategoryId() {
    const snapshot = await get(ref(database, 'Thể loại'));
    if (snapshot.exists()) {
        const categories = snapshot.val();
        const ids = Object.keys(categories).map(Number); // Chuyển đổi từ chuỗi thành số
        return Math.max(...ids) + 1; // Trả về ID lớn nhất cộng thêm 1
    }
    return 1; // Nếu không có thể loại nào, bắt đầu từ ID 1
}

document.getElementById('addGenreBtn').addEventListener('click', async () => {
    const genreName = document.getElementById('genreName').value;

    if (genreName) {
        const nextId = await getLastCategoryId(); // Get the next available ID
        const newGenreRef = ref(database, `Thể loại/${nextId}`); // Use the new format
        await set(newGenreRef, genreName);
        alert('Thể loại đã được thêm thành công!');
        document.getElementById('genreName').value = ''; // Reset input
        loadCategories(); // Reload categories
    } else {
        alert('Vui lòng nhập tên thể loại!');
    }
});

// Function to delete a category
async function deleteCategory(name) {
        await remove(ref(database, `Thể loại/${name}`));
        alert('Thể loại đã được xóa thành công!');
        loadCategories(); // Reload categories after deletion
}

// Function to handle edit button click
document.getElementById('genreList').addEventListener('click', (event) => {
    if (event.target.matches('button')) {
        const genreName = event.target.parentNode.parentNode.children[1].textContent; // Lấy tên thể loại từ cột
        const genreId = event.target.parentNode.parentNode.children[0].textContent; // Lấy ID thể loại từ cột
        const editInput = document.getElementById('editGenreName');
        editInput.value = genreName; // Set the input to the current genre name
        document.getElementById('editModal').style.display = 'block'; // Show modal
        // Lưu ID thể loại để sử dụng khi lưu thay đổi
        document.getElementById('editModal').setAttribute('data-genre-id', genreId);
    }
});

// Handle save changes in modal
document.getElementById('saveEditBtn').addEventListener('click', async () => {
    const newGenreName = document.getElementById('editGenreName').value;
    const genreId = document.getElementById('editModal').getAttribute('data-genre-id'); // Lấy ID thể loại từ modal

    if (newGenreName) {
        await set(ref(database, `Thể loại/${genreId}`), newGenreName); // Sửa thể loại dựa trên ID
        alert('Thể loại đã được cập nhật thành công!');
        loadCategories(); // Reload categories
        document.getElementById('closeEditBtn').addEventListener('click',async()=>{
            document.getElementById('editModal').style.display = 'none'; // Ẩn modal
            document.getElementById('editGenreName').value = ''; // Xóa nội dung ô nhập
        })
    } else {
        alert('Vui lòng nhập tên thể loại!');
    }
});


// Close edit modal
document.getElementById('closeEditBtn').addEventListener('click',async()=>{
    document.getElementById('editModal').style.display = 'none'; // Ẩn modal
    document.getElementById('editGenreName').value = ''; // Xóa nội dung ô nhập
})

// Load categories on page load
window.onload = async () => {
    await loadCategories(); // Load categories when page loads
    await checkUser();
};

// Check user authentication state
function checkUser() {
    auth.onAuthStateChanged(user => {
        const userEmailElement = document.getElementById('userEmail');
        const userInfoElement = document.getElementById('userInfo');
        const authLinksElement = document.getElementById('authLinks');

        if (user) {
            if (userEmailElement) userEmailElement.textContent = user.email;
            if (userInfoElement) userInfoElement.style.display = 'flex';
            if (authLinksElement) authLinksElement.style.display = 'none';
        } else {
            if (authLinksElement) authLinksElement.style.display = 'flex';
            if (userInfoElement) userInfoElement.style.display = 'none';
        }
    });
}

// Handle logout
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                console.log("User logged out successfully.");
                window.location.href = "Home.html"; // Redirect to home page
            })
            .catch((error) => {
                console.error("Error signing out:", error);
                alert("An error occurred while signing out: " + error.message);
            });
    });
}
