// Import Firebase Authentication và Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

import { getDatabase, ref, set, get} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";

// Cấu hình Firebase
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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Xử lý đăng ký
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Ngăn việc submit form truyền thống

        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-password-confirm").value;

        // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp hay không
        if (password !== confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }

        // Đăng ký người dùng bằng email và password
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User registered:", user);

                // Gửi email xác thực
                sendEmailVerification(user)
                    .then(() => {
                        alert("Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực.");

                        const userId = user.uid; // Lấy ID người dùng
                        set(ref(database, 'Users/' + userId), {
                            email: email,
                            uid: userId,
                            role : 'Customer',
                            avatar: '',
                            password: password,
                            phoneno: '',
                            username: '',
                        })
                    })
                    .catch((error) => {
                        console.error("Lỗi khi gửi email xác thực:", error);
                        alert("Có lỗi xảy ra khi gửi email xác thực: " + error.message);
                    });
            })
            .catch((error) => {
                console.error("Lỗi trong quá trình đăng ký:", error);
                alert("Đăng ký thất bại: " + error.message);
            });
    });
}

// Xử lý đăng nhập
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Ngăn việc submit form truyền thống

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        // Đăng nhập người dùng
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User logged in:", user);
                
                // Kiểm tra xác thực email
                if (!user.emailVerified) {
                    alert("Vui lòng xác thực email trước khi đăng nhập.");
                } else {
                    checkUser();
                    // Lưu email vào localStorage
                    localStorage.setItem("userEmail", user.email);
                    // Chuyển sang trang chủ

                    const roleRef = ref(database, 'Users/' + user.uid + '/role');
                        get(roleRef).then((snapshot) => {
                            if (snapshot.exists()) { // Sửa thành exists()
                                const role = snapshot.val();
                                console.log("User Role: ", role);

                                if (role === 'Admin') {
                                    window.location.href = "QuanLyTruyen.html";
                                } else {
                                    window.location.href = "Home.html";
                                }
                            } else {
                                console.error("Không tìm thấy vai trò người dùng.");
                            }
                        }).catch((error) => {
                            console.error("Lỗi khi lấy vai trò người dùng:", error);
                        });
                    // window.location.href = "Home.html"; // Thay "index.html" bằng trang chủ của bạn
                }
            })
            .catch((error) => {
                console.error("Lỗi trong quá trình đăng nhập:", error);
                alert("Đăng nhập thất bại: " + error.message);
            });
    });
}

function checkUser() {
    auth.onAuthStateChanged((user) => {
        const userEmailElement = document.getElementById('userEmail');
        const userInfoElement = document.getElementById('userInfo');
        const authLinksElement = document.getElementById('authLinks');

        if (user) {
            // Người dùng đã đăng nhập
            console.log("User logged in:", user.email); // Thêm log để kiểm tra user
            if (userEmailElement) userEmailElement.textContent = user.email;
            if (userInfoElement) userInfoElement.style.display = 'flex'; // Hiện thông tin người dùng
            if (authLinksElement) authLinksElement.style.display = 'none'; // Ẩn liên kết đăng nhập
        } else {
            // Người dùng chưa đăng nhập
            console.log("User is not logged in"); // Log để kiểm tra user không tồn tại
            if (authLinksElement) authLinksElement.style.display = 'flex'; // Hiện liên kết đăng nhập
            if (userInfoElement) userInfoElement.style.display = 'none'; // Ẩn thông tin người dùng
        }
    });
}

// Xử lý quên mật khẩu
const resetPasswordForm = document.getElementById("resetPasswordForm");
if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Ngăn việc submit form truyền thống

        const email = document.getElementById("reset-email").value;

        // Gửi email đặt lại mật khẩu
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.");
            })
            .catch((error) => {
                console.error("Lỗi trong quá trình gửi email đặt lại mật khẩu:", error);
                alert("Có lỗi xảy ra: " + error.message);
            });
    });
}

// Xử lý đăng xuất
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
      let stories = []; // Array to hold all stories

      // Function to load stories from Firebase
      async function loadStories() {
          const storiesRef = ref(database, 'Truyen');
          const snapshot = await get(storiesRef);
          stories = snapshot.val() ? Object.values(snapshot.val()) : []; // Store all stories

          displayStories(stories); // Initially display all stories
      }

      // Function to display stories
      function displayStories(storyList) {
          const wrapper = document.getElementById('storyWrapper');
          wrapper.innerHTML = ''; // Clear existing stories

          storyList.forEach((story, index) => {
              const storyCard = `
                  <div class="single-card">
                    <div class="img-area">
                        <img src="${story.imageUrl}" alt="${story.name}">
                        <div class="overlay">
                            <button class="view-details" onclick="location.href='chi-tiet-truyen.html?id=${index}'">Start reading</button>
                            <button class="read-later" onclick="addToReadLater('${story.id}')">Read Later</button> <!-- Read Later Button -->
                        </div>
                    </div>
                    <h3 class="story-name">${story.name}</h3>
                </div>

              `;
              wrapper.innerHTML += storyCard; // Append story card
          });
      }

      // Function to search stories by name
      function searchStories() {
          const searchTerm = document.getElementById('searchInput').value.toLowerCase();
          const filteredStories = stories.filter(story => story.name.toLowerCase().includes(searchTerm));
          displayStories(filteredStories); // Display filtered stories
      }

      // Event listener for search button
      document.getElementById('searchBtn').addEventListener('click', searchStories);

      // Call the function to load stories when the page loads
      window.onload = loadStories;

      window.onload = function() {
        checkUser();
    };
    