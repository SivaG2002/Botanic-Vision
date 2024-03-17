import os
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
from flask import Flask, render_template, request, redirect, flash

# Flask app configuration
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_strong_secret_key'  # Replace with a strong secret key
app.config['UPLOAD_FOLDER'] = 'static/uploads/'

# Load your pre-trained model (replace with your model loading logic)
model = load_model('model.h5')

# Function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif'}

# Route for the main page
@app.route('/', methods=['GET', 'POST'])
def index():
    prediction = None  # Initialize prediction variable
    filename = None  # Initialize filename variable
    message = None  # Initialize message variable

    if request.method == 'POST':
        # Check if a file was uploaded
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)

        file = request.files['file']
        # If no file is selected, redirect
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            try:
                # Load image and handle potential errors
                img = Image.open(filepath)

                # Ensure correct shape and type
                if img.mode != 'RGB':
                    flash(f"Image must be in RGB format. Detected: {img.mode}")
                    return redirect(request.url)

                # Preprocessing steps (adjust based on model requirements)
                img = img.resize((model.input_shape[1], model.input_shape[2]))  # Resize to model's input shape
                img = np.array(img)
                img = img.astype('float32')  # Convert to float32 for normalization
                img /= 255.0  # Normalize pixel values to [0, 1]

                # Add batch dimension if needed
                if model.input_shape[0] is None:
                    img = np.expand_dims(img, axis=0)

                # Make prediction using the model
                prediction = model.predict(img)

                # Define class labels (replace with your actual labels)
                class_labels = ['Brown spot', 'Leaf smut', 'Blast', 'Tungro', 'Bacterial leaf blight']

                def get_class_label(predictions):
                    predicted_class_index = np.argmax(predictions)
                    return class_labels[predicted_class_index]

                # Extract and display the predicted class label (if prediction exists)
                if prediction is not None:
                    predicted_class = get_class_label(prediction)
                    message = f"Predicted Class: {predicted_class}"

            except Exception as e:
                # Customize error message with more details
                flash(f"Error during prediction: {e}\nCheck model input shape and image loading.")
                return redirect(request.url)

        else:
            flash('Allowed file types: jpg, jpeg, png, gif')

    return render_template('index.html', prediction=prediction, filename=filename, message=message)
             
# Run the app (if executed directly)
if __name__ == '__main__':
    app.run(debug=True)
