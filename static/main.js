document.addEventListener("DOMContentLoaded", function() {
    // Landing page animation
    const landingPage = document.getElementById("landing-page");
    const mainContent = document.getElementById("main-content");

    setTimeout(function() {
        landingPage.style.display = "none";
        mainContent.style.display = "block";
    }, 3000); // Adjust the timeout as needed for the animation duration

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

    uploadInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function() {
                const imageUrl = reader.result;
                imagePreview.innerHTML = `<img src="${imageUrl}" alt="Uploaded Image" style="max-width: 100%;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Image capture
    document.getElementById("capture-btn").addEventListener("click", function() {
        const videoConstraints = {
            video: true
        };

        navigator.mediaDevices.getUserMedia(videoConstraints)
            .then(function(stream) {
                const video = document.createElement('video');
                document.body.appendChild(video);
                video.srcObject = stream;
                video.play();

                const shutterSound = new Audio('shutter-sound.mp3');

                const shutterButton = document.createElement('button');
                shutterButton.textContent = 'Capture';
                shutterButton.id = 'shutter-btn';
                mainContent.appendChild(shutterButton);

                const shutterBtn = document.getElementById('shutter-btn');
                shutterBtn.addEventListener('click', function() {
                    shutterSound.play();
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageUrl = canvas.toDataURL('image/png');
                    imagePreview.innerHTML = `<img src="${imageUrl}" alt="Captured Image" style="max-width: 100%;">`;
                    stream.getTracks().forEach(track => track.stop());
                    document.body.removeChild(video);
                    mainContent.removeChild(shutterBtn);
                });
            })
            .catch(function(error) {
                console.error('Error accessing the camera: ', error);
            });
    });

    // Upload button click
    document.getElementById("upload-btn").addEventListener("click", function() {
        uploadInput.click();
    });

    // Predict button click event
    document.getElementById("predict-btn").addEventListener("click", function() {
        // Check if an image is selected
        const fileInput = document.getElementById("upload-input");
        const file = fileInput.files[0];
        if (!file) {
            alert("Please select an image.");
            return;
        }

        // Create form data and append the image file
        const formData = new FormData();
        formData.append("file", file);

        // Send the form data to Flask for prediction using fetch API
        fetch("/", {
            method: "POST",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            // Handle the prediction response data
            console.log(data); // Log the response data to the console for testing

            // Update the UI with the prediction result
            const predictionElement = document.createElement("p");
            predictionElement.textContent = `Predicted Class: ${data.prediction}`;
            const messageElement = document.createElement("p");
            messageElement.textContent = `Message: ${data.message}`;
            mainContent.appendChild(predictionElement);
            mainContent.appendChild(messageElement);
        })
        .catch(error => console.error("Error:", error));
    });

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
        const typingInterval = setInterval(function() {
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




// Predict button click event
document.getElementById("predict-btn").addEventListener("click", function() {
    // Check if an image is selected
    const fileInput = document.getElementById("upload-input");
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select an image.");
        return;
    }

    // Create form data and append the image file
    const formData = new FormData();
    formData.append("file", file);

    // Send the form data to Flask for prediction using fetch API
    fetch("/", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        // Handle the prediction response data
        console.log(data); // Log the response data to the console for testing

        // Update the UI with the prediction result using Flask's template system
        const outputContainer = document.getElementById("output-container");
        outputContainer.innerHTML = ""; // Clear previous output

        // Check if filename, prediction, and message are present in the response
        if (data.filename !== undefined) {
            outputContainer.innerHTML += `<p>Uploaded file: ${data.filename}</p>`;
        }
        if (data.prediction !== undefined) {
            outputContainer.innerHTML += `<p>Predicted Class: ${data.prediction}</p>`;
        }
        if (data.message !== undefined) {
            outputContainer.innerHTML += `<p>${data.message}</p>`;
        }
    })
    .catch(error => console.error("Error:", error));
});
