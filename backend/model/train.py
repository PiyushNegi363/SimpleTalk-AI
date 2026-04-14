import nltk
from nltk.stem import WordNetLemmatizer
import json
import pickle
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import SGD
import random
import os

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('wordnet')
lemmatizer = WordNetLemmatizer()

# Load intents file
def train_model():
    # Robust pathing relative to this script
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    INTENTS_PATH = os.path.join(BASE_DIR, 'intents.json')
    MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
    
    print(f"Loading intents from: {INTENTS_PATH}")
    with open(INTENTS_PATH) as file:
        intents = json.load(file)

    words = []
    classes = []
    documents = []
    ignore_words = ['?', '!', '.', ',']

    # Process patterns
    for intent in intents['intents']:
        for pattern in intent['patterns']:
            # Tokenize each word
            w = nltk.word_tokenize(pattern)
            words.extend(w)
            # Add to documents
            documents.append((w, intent['tag']))
            # Add to classes
            if intent['tag'] not in classes:
                classes.append(intent['tag'])

    # Lemmatize and lower each word
    words = [lemmatizer.lemmatize(w.lower()) for w in words if w not in ignore_words]
    words = sorted(list(set(words)))

    classes = sorted(list(set(classes)))

    print(f"{len(documents)} documents")
    print(f"{len(classes)} classes: {classes}")
    print(f"{len(words)} unique lemmatized words: {words}")

    # Create training data
    training = []
    output_empty = [0] * len(classes)

    for doc in documents:
        bag = []
        pattern_words = doc[0]
        pattern_words = [lemmatizer.lemmatize(word.lower()) for word in pattern_words]
        
        for w in words:
            bag.append(1) if w in pattern_words else bag.append(0)

        output_row = list(output_empty)
        output_row[classes.index(doc[1])] = 1

        training.append([bag, output_row])

    # Shuffle and convert to numpy array
    random.shuffle(training)
    training = np.array(training, dtype=object)

    train_x = list(training[:,0])
    train_y = list(training[:,1])

    # Create model
    model = Sequential()
    model.add(Dense(128, input_shape=(len(train_x[0]),), activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(64, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(len(train_y[0]), activation='softmax'))

    # Compile model
    # Use legacy SGD for compatibility or standard optimization
    sgd = SGD(learning_rate=0.01, momentum=0.9, nesterov=True)
    model.compile(loss='categorical_crossentropy', optimizer=sgd, metrics=['accuracy'])

    # Fit and save
    print("Training model...")
    hist = model.fit(np.array(train_x), np.array(train_y), epochs=200, batch_size=5, verbose=1)
    
    # Save artifacts
    model.save(os.path.join(MODEL_DIR, 'chatbot_model.h5'), hist)
    pickle.dump(words, open(os.path.join(MODEL_DIR, 'words.pkl'), 'wb'))
    pickle.dump(classes, open(os.path.join(MODEL_DIR, 'classes.pkl'), 'wb'))

    print("Model trained and saved successfully!")

if __name__ == "__main__":
    train_model()
