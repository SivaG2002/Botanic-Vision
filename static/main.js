document.addEventListener("DOMContentLoaded", function () {
    const landingPage = document.getElementById("landing-page");
    const mainContent = document.getElementById("main-content");

    setTimeout(function () {
        landingPage.style.display = "none";
        mainContent.style.display = "block";
    }, 3000); // Display main content after 3 seconds

    // Function to create the "Upload" button
    function createUploadButton() {
        const uploadButton = document.createElement('button');
        uploadButton.textContent = 'Upload';
        uploadButton.classList.add('button');
        uploadButton.id = 'upload-btn-secondary';
        return uploadButton;
    }

    // Image upload
    const uploadInput = document.getElementById("upload-input");
    const imagePreview = document.getElementById("image-preview");

    uploadInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                const imageUrl = reader.result;
                imagePreview.innerHTML = `<img src="${imageUrl}" alt="Uploaded Image" style="max-width: 100%;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Image capture (you can add your capture functionality here)

    // Upload button click
    document.getElementById("upload-btn").addEventListener("click", function () {
        uploadInput.click();
    });

    // Predict button click event (you can add your prediction functionality here)

    // Create and append the "Upload" button next to the "Upload Image" button
    const buttonContainer = document.getElementById("button-container");
    const uploadButton = createUploadButton();
    buttonContainer.appendChild(uploadButton);

    // Typing animation for the introduction text
    const introText = document.getElementById("intro-text");
    const text = "Welcome to our innovative website dedicated to detecting rice plant diseases with precision and efficiency. Experience cutting-edge technology tailored to safeguarding your rice crops for optimal health and yield.";
    const speed = 50; // Typing speed in milliseconds

    function typeWriter() {
        let i = 0;
        const typingInterval = setInterval(function () {
            if (i < text.length) {
                introText.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, speed);
    }

    typeWriter(); // Start the typing animation when the page loads
});
