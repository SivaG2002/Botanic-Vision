from flask import Flask, render_template, request, flash, redirect, url_for
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_strong_secret_key'
app.config['UPLOAD_FOLDER'] = 'static/uploads/'

model = load_model('model.h5')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif'}

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(url_for('index'))

    file = request.files['file']
    if file.filename == '':
        flash('No selected file')
        return redirect(url_for('index'))

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            img = Image.open(filepath)
            if img.mode != 'RGB':
                flash(f"Image must be in RGB format. Detected: {img.mode}")
                return redirect(url_for('index'))

            img = img.resize((model.input_shape[1], model.input_shape[2]))
            img = np.array(img)
            img = img.astype('float32')
            img /= 255.0

            if model.input_shape[0] is None:
                img = np.expand_dims(img, axis=0)

            prediction = model.predict(img)

            class_labels = ['Brown spot', 'Leaf smut', 'Tungro', 'Leaf Blast', 'Bacterial leaf blight', 'Error']

            def get_class_label(predictions):
                max_index = np.argmax(predictions)
                max_value = predictions[0][max_index]
                percentage = max_value * 100
                if max_value < 0.9:
                    return 'Error', percentage
                else:
                    return class_labels[max_index], percentage

            if prediction is not None:
                predicted_class, percentage = get_class_label(prediction)
                message = f"Predicted Class: {predicted_class} (Confidence: {percentage:.2f}%)"
                
                # Determine the correct redirect URL based on the predicted class
                if predicted_class.lower() == 'brown spot':
                    redirect_url = url_for('brownspot')
                elif predicted_class.lower() == 'leaf smut':
                    redirect_url = url_for('leafsmut')
                elif predicted_class.lower() == 'tungro':
                    redirect_url = url_for('tungro')
                elif predicted_class.lower() == 'leaf blast':
                    redirect_url = url_for('leafblast')
                elif predicted_class.lower() == 'bacterial leaf blight':
                    redirect_url = url_for('bacterialblight')
                else:
                    redirect_url = url_for('index')  # Default redirect URL if no match
                
                return render_template('predict.html', prediction=predicted_class, percentage=percentage, message=message, redirect_url=redirect_url)

        except Exception as e:
            flash(f"Error during prediction: {e}\nCheck model input shape and image loading.")
            return redirect(url_for('index'))

    else:
        flash('Allowed file types: jpg, jpeg, png, gif')
        return redirect(url_for('index'))

    # Default redirection if no specific class match
    return redirect(url_for('index'))

@app.route('/brownspot')
def brownspot():
    return render_template('brownspot.html')

@app.route('/leafsmut')
def leafsmut():
    return render_template('leafsmut.html')

@app.route('/tungro')
def tungro():
    return render_template('tungro.html')

@app.route('/leafblast')
def leafblast():
    return render_template('leafblast.html')

@app.route('/bacterialblight')
def bacterialblight():
    return render_template('bacterialblight.html')

if __name__ == '__main__':
    app.run(debug=True)
