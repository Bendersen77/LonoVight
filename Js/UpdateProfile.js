function updateProfile() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const dob = document.getElementById('dob').value;
    const avatar = document.getElementById('avatar').files[0];

    if (email && password && dob) {
        document.getElementById('message').textContent = "Profile updated successfully!";
    } else {
        document.getElementById('message').textContent = "Please fill in all required fields.";
    }
}

// Preview avatar image when selected
function previewAvatar(event) {
    const avatarPreview = document.getElementById('avatarPreview');
    avatarPreview.src = URL.createObjectURL(event.target.files[0]);
    avatarPreview.style.display = "block";  // Display the image
}
