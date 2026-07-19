import os
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, flash, session

app = Flask(__name__)
# Render par session manage karne ke liye secret key
app.secret_key = 'pawan_auto_super_secret_session_key'

DB_FILE = 'users.db'
SECRET_REGISTRATION_KEY = '9696'

def init_db():
    """Database aur users table banane ke liye function (Id-Pass permanent save rahega)"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mobile TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Server start hote hi database check karega
init_db()



@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        mobile = request.form.get('mobile').strip()
        password = request.form.get('password').strip()

        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE mobile = ? AND password = ?", (mobile, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            session['user_mobile'] = mobile
            return redirect(url_for('home'))
        else:
            flash("Invalid Mobile Number or Password!")
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        mobile = request.form.get('mobile').strip()
        password = request.form.get('password').strip()
        confirm_password = request.form.get('confirm_password').strip()
        secret_key = request.form.get('secret_key').strip()

        # 1. Secret Key Check
        if secret_key != SECRET_REGISTRATION_KEY:
            flash("Galat Secret Key! Aap register nahi kar sakte.")
            return redirect(url_for('register'))

        # 2. Password Match Check
        if password != confirm_password:
            flash("Password aur Confirm Password match nahi ho rahe hain!")
            return redirect(url_for('register'))

        # 3. Database me entry permanently save karna
        try:
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("INSERT INTO users (mobile, password) VALUES (?, ?)", (mobile, password))
            conn.commit()
            conn.close()
            flash("Registration Successful! Ab aap login kar sakte hain.")
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash("Yeh Mobile Number pehle se registered hai!")
            return redirect(url_for('register'))

    return render_template('register.html')

@app.route('/')
def home():
    if 'user_mobile' in session:
        return render_template('dashboard.html')
    else:
        return redirect(url_for('login'))
