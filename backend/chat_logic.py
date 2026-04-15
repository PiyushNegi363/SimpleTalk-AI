import nltk
from nltk.stem import WordNetLemmatizer
import pickle
import numpy as np
import json
import random
import logging
from tensorflow.keras.models import load_model
import os

lemmatizer = WordNetLemmatizer()

# Load model data
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model/chatbot_model.h5')
WORDS_PATH = os.path.join(os.path.dirname(__file__), 'model/words.pkl')
CLASSES_PATH = os.path.join(os.path.dirname(__file__), 'model/classes.pkl')
INTENTS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'intents.json')

def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

def bow(sentence, words, show_details=True):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
                if show_details:
                    logging.info(f"found in bag: {w}")
    return np.array(bag)

def predict_class(sentence, model, words, classes):
    p = bow(sentence, words, show_details=False)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    
    # Sort by probability
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    return return_list

def get_response(ints, intents_json):
    if not ints:
        return "Sorry, I didn't quite catch that. Can you rephrase?"
    
    tag = ints[0]['intent']
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        if i['tag'] == tag:
            result = random.choice(i['responses'])
            break
    return result

class ChatbotBrain:
    def __init__(self):
        try:
            self.model = load_model(MODEL_PATH)
            self.words = pickle.load(open(WORDS_PATH, 'rb'))
            self.classes = pickle.load(open(CLASSES_PATH, 'rb'))
            with open(INTENTS_PATH, encoding='utf-8') as file:
                self.intents = json.load(file)
            self.ready = True
            logging.info("Chatbot brain initialized successfully.")
        except Exception as e:
            logging.error(f"ChatbotBrain init failed: {e}")
            self.ready = False

    def chat(self, msg):
        if not self.ready:
            return "Bot is still training. Please wait a moment."
        ints = predict_class(msg, self.model, self.words, self.classes)
        res = get_response(ints, self.intents)
        return res
