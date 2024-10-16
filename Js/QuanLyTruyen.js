import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-storage.js";

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

//Liên kết tới Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app); // Ở đâu đó trong mã của bạn, đảm bảo biến auth được định nghĩa.
const storage = getStorage(app);

//Trỏ tới node Thể loại trên Firebase
const categoriesRef = ref(database, 'Thể loại');

//Chức năng hiển thị dữ liệu Thể loại từ Firebase
async function loadCategories() {
    const snapshot = await get(categoriesRef);
    const categories = snapshot.val();
    const categorySelect = document.getElementById('storyCategory');
    categorySelect.innerHTML = ''; // Clear existing options

    for (const key in categories) {
        const option = document.createElement('option');
        option.value = categories[key]; // Lưu giá trị là tên thể loại
        option.textContent = categories[key];
        categorySelect.appendChild(option);
    }
}

// Chức năng tạo ID tự động
function generateRandomId() {
    return 'story_' + Math.random().toString(36).substr(2, 9); // Tạo ID ngẫu nhiên
}

let currentPage = 1;
const storiesPerPage = 5;
let stories = {};
let filteredStories = {}; // Khai báo biến cho truyện đã lọc

// Thêm sự kiện cho thanh tìm kiếm
document.getElementById('searchInput').addEventListener('input', () => {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filterStories(searchTerm);
});

function filterStories(searchTerm) {
    filteredStories = {}; // Reset filtered stories
    
    for (const id in stories) {
        const story = stories[id];
        if (story.name.toLowerCase().includes(searchTerm)) {
            filteredStories[id] = story;
        }
    }

    currentPage = 1; // Đặt lại trang hiện tại về 1 khi tìm kiếm
    loadFilteredStories(); // Gọi hàm để load truyện đã lọc
}
function loadFilteredStories() {
    const totalPages = Math.ceil(Object.keys(filteredStories).length / storiesPerPage);
    const startIndex = (currentPage - 1) * storiesPerPage;
    const endIndex = Math.min(startIndex + storiesPerPage, Object.keys(filteredStories).length);
    
    const storyList = document.getElementById('storyList');
    storyList.innerHTML = ''; // Xóa danh sách hiện tại

    // Cập nhật phần hiển thị truyện trong loadFilteredStories
for (let i = startIndex; i < endIndex; i++) {
    const storyId = Object.keys(filteredStories)[i];
    const story = filteredStories[storyId];

    if (story) {
        const storyDiv = document.createElement('div');
        storyDiv.innerHTML = `
    <hr width="80%" align="center" />
    <h3><a href="chi-tiet-truyen.html?id=${storyId}">${story.name}</a></h3>
    <p>Thể loại: ${story.category}</p>
    <p style="word-wrap: break-word; max-width: 600px">Mô tả: ${story.description}</p>
    <img src="${story.imageUrl}" alt="${story.name}" style="width:400px">
    <div style="display: flex; gap: 10px;">
        <button class="edit-button" data-id="${storyId}">Sửa</button>
        <button class="delete-button" data-id="${storyId}">Xóa</button>
    </div>
`;
        storyList.appendChild(storyDiv);
    }
}


    createPageNumbers(totalPages);
    setupPagination(totalPages);
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const story = stories[id];
            editStory(id, story.name, story.category, story.description);
        });
    });

    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            deleteStory(id);
        });
    }); // Thiết lập lại các nút Sửa và Xóa
}


function setupPagination(totalPages) {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    prevButton.style.display = currentPage === 1 ? 'none' : 'block';
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadFilteredStories(); // Gọi lại hàm để load truyện đã lọc
        }
    };

    nextButton.style.display = currentPage === totalPages ? 'none' : 'block';
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadFilteredStories(); // Gọi lại hàm để load truyện đã lọc
        }
    };
}
async function loadStories() {
    const storiesRef = ref(database, 'Truyen');
    const snapshot = await get(storiesRef);
    stories = snapshot.val() || {};
    
    // Khởi tạo filteredStories với tất cả dữ liệu
    filteredStories = { ...stories };
    
    // Hiển thị truyện ngay khi load
    loadFilteredStories();
}


function createPageNumbers(totalPages) {
    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = ''; // Clear existing buttons

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('page-number');
        if (i === currentPage) {
            button.classList.add('active'); // Đánh dấu trang hiện tại
        }

        button.onclick = () => {
            currentPage = i; // Cập nhật trang hiện tại
            loadStories(); // Tải lại truyện
        };

        pageNumbersContainer.appendChild(button);
    }
}

let currentStoryId = null;
// Function to load categories from Firebase
async function loadCategoriesForModal() {
    const snapshot = await get(categoriesRef);
    const categories = snapshot.val();
    const categorySelect = document.getElementById('editStoryCategory');
    categorySelect.innerHTML = ''; // Clear existing options

    for (const key in categories) {
        const option = document.createElement('option');
        option.value = categories[key]; // Giá trị là tên thể loại
        option.textContent = categories[key];
        categorySelect.appendChild(option);
    }
}

// Function to edit a story
async function editStory(id, name, category, description) {
    currentStoryId = id; // Lưu ID của câu chuyện hiện tại
    document.getElementById('editStoryName').value = name;
    document.getElementById('editStoryCategory').value = category;
    document.getElementById('editStoryDescription').value = description;
    document.getElementById('editModal').style.display = 'block'; // Hiện modal
    await loadCategoriesForModal(); // Tải thể loại vào dropdown
}

// Xử lý nút lưu thay đổi
document.getElementById('saveChangesButton').addEventListener('click', async () => {
    const newName = document.getElementById('editStoryName').value;
    const newCategory = document.getElementById('editStoryCategory').value;
    const newDescription = document.getElementById('editStoryDescription').value;
    const newImage = document.getElementById('editStoryImage').files[0];

    if (newName && newCategory && newDescription) {
        let imageUrl = stories[currentStoryId].imageUrl; // Sử dụng biến stories

        if (newImage) {
            // Upload hình ảnh mới
            const imageRef = storageRef(storage, `images/${currentStoryId}.jpg`);
            await uploadBytes(imageRef, newImage);
            imageUrl = await getDownloadURL(imageRef);
        }

        await set(ref(database, `Truyen/${currentStoryId}`), {
            name: newName,
            category: newCategory,
            imageUrl: imageUrl,
            description: newDescription
        });

        alert('Truyện đã được cập nhật thành công!');
        loadStories(); // Reload the stories after updating
        document.getElementById('editModal').style.display = 'none'; // Đóng modal
    } else {
        alert('Vui lòng điền đủ thông tin!');
    }
});

// Xử lý nút đóng modal
document.getElementById('closeModalButton').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none'; // Đóng modal
});

// Function to delete a story
async function deleteStory(id) {
    // Hiện hộp thoại xác nhận
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa truyện này không?");
    
    if (confirmDelete) {
        await remove(ref(database, `Truyen/${id}`));
        alert('Truyện đã được xóa thành công!');
        loadStories(); // Reload the stories after deletion
    }
}

// Upload story to Firebase
document.getElementById('storyForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const storyName = document.getElementById('storyName').value;
    const storyCategory = document.getElementById('storyCategory').value;
    const storyImage = document.getElementById('storyImage').files[0];
    const storyDescription = document.getElementById('storyDescription').value;

    // Get next ID
    const storyId = generateRandomId();

    // Upload image to Firebase Storage
    const imageRef = storageRef(storage, `images/${storyId}.jpg`); // Gán ID giống với ID của truyện
    await uploadBytes(imageRef, storyImage);
    
    // Get the download URL of the image
    const imageUrl = await getDownloadURL(imageRef);

    // Save story data to Firebase Realtime Database
    await set(ref(database, `Truyen/${storyId}`), {
        name: storyName,
        category: storyCategory,
        imageUrl: imageUrl,
        description: storyDescription
    });

    alert('Truyện đã được thêm thành công!');
    document.getElementById('storyForm').reset();
    loadStories(); // Reload the stories after adding a new one
});

// Khi tải trang, gọi loadStories
window.onload = async () => {
    await loadCategories();
    await loadStories(); // Gọi hàm loadStories để tải dữ liệu
    await checkUser();
};

function checkUser() {
    auth.onAuthStateChanged(user => {
        const userEmailElement = document.getElementById('userEmail');
        const userInfoElement = document.getElementById('userInfo');
        const authLinksElement = document.getElementById('authLinks');

        if (user) {
            if (userEmailElement) userEmailElement.textContent = user.email; // Hiện email người dùng
            if (userInfoElement) userInfoElement.style.display = 'flex'; // Hiện thông tin người dùng
            if (authLinksElement) authLinksElement.style.display = 'none'; // Ẩn liên kết đăng nhập
        } else {
            if (authLinksElement) authLinksElement.style.display = 'flex'; // Hiện liên kết đăng nhập
            if (userInfoElement) userInfoElement.style.display = 'none'; // Ẩn thông tin người dùng
        }
    });
}
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                // Đăng xuất thành công
                console.log("User logged out successfully.");
                // Chuyển hướng về trang đăng nhập
                window.location.href = "Home.html";
            })
            .catch((error) => {
                // Xử lý lỗi nếu có
                console.error("Lỗi khi đăng xuất:", error);
                alert("Có lỗi xảy ra khi đăng xuất: " + error.message);
            });
    });
}