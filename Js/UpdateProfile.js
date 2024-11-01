import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
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

// Hàm để lấy email của người dùng
function fetchUserEmail() {
    const user = auth.currentUser; // Lấy thông tin người dùng đã đăng nhập

    if (user) {
        const uid = user.uid; // Lấy UID của người dùng

        // Truy cập vào Realtime Database để lấy email
        const userRef = ref(database, 'Users/' + uid); // Đường dẫn đến thông tin người dùng

        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val(); // Lấy dữ liệu của người dùng
                const email = userData.email; // Giả sử email được lưu trữ với khóa 'email'
                const avatar = userData.avatar;

                // Gán giá trị cho trường email trong HTML
                document.getElementById('email').value = email; // Gán giá trị cho trường email
                if (avatar) {
                    document.getElementById('avatarPreview').src = avatar; // Gán giá trị cho thuộc tính src
                    document.getElementById('avatarPreview').style.display = 'block'; // Hiển thị hình ảnh
                }
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error("Error getting user data:", error);
        });
    } else {
        console.log("No user is signed in");
    }
}

// Theo dõi trạng thái đăng nhập
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchUserEmail(); // Lấy email khi người dùng đăng nhập
    } else {
        console.log("User is signed out");
    }
});

function isValidPhoneNumber(phone) {
    // Kiểm tra nếu số điện thoại có độ dài là 10 và bắt đầu bằng số 0
    const phoneRegex = /^0\d{9}$/; // Regex để kiểm tra số điện thoại
    return phoneRegex.test(phone);
}


document.getElementById('updateForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const user = auth.currentUser; // Lấy thông tin người dùng đã đăng nhập
    const uid = user.uid;

    const storyCategory = document.getElementById('username').value;
    const storyImage = document.getElementById('avatar').files[0];
    const storyDescription = document.getElementById('phoneno').value;

    // Kiểm tra số điện thoại
    if (!isValidPhoneNumber(storyDescription)) {
        alert("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại bắt đầu bằng 0 và có đủ 10 số.");
        return; // Dừng thực hiện nếu số điện thoại không hợp lệ
    }

    // Upload image to Firebase Storage
    const imageRef = storageRef(storage, `Users Image/${uid}.jpg`); // Gán ID giống với ID của truyện
    await uploadBytes(imageRef, storyImage);
    
    // Get the download URL of the image
    const imageUrl = await getDownloadURL(imageRef);
    
    const userRef = ref(database, 'Users/' + uid); // Đường dẫn đến thông tin người dùng

        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val(); // Lấy dữ liệu của người dùng
                const email = userData.email; // Giả sử email được lưu trữ với khóa 'email'
                const password = userData.password
                const role = userData.role;

                // Save story data to Firebase Realtime Database
                set(ref(database, `Users/${uid}`), {
                    username: storyCategory,
                    avatar: imageUrl,
                    phoneno: storyDescription,
                    email: email,
                    password: password,
                    role: role,
                    uid: uid
                });
                
                // Gán giá trị cho trường email trong HTML
                document.getElementById('email').value = email; // Gán giá trị cho trường email
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error("Error getting user data:", error);
        });

    alert('Cập nhật thành công');
    document.getElementById('updateForm').reset();
});

// UpdateProfile.js
export function previewAvatar(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const preview = document.getElementById('avatarPreview');
        preview.src = e.target.result; // Gán hình ảnh đã tải lên cho thẻ img
        preview.style.display = 'block'; // Hiển thị hình ảnh đã tải lên
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}