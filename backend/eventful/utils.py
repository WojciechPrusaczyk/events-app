import random
import string
import bcrypt
import re
import os

def generate_token(length=64):
    characters = string.ascii_letters + string.digits
    token = ''.join(random.choice(characters) for _ in range(length))
    return token


def hash(string):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(string.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def set_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def is_valid_password(password):
    # Check the length
    if len(password) < 8 or len(password) > 32:
        return False

    # Check for at least one special character ($,@,#,!,%,&,?)
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False

    # Check for at least three numbers
    if len(re.findall(r'\d', password)) < 3:
        return False

    return True


def open_email_template():
    # Get the directory of the current file (views.py)
    current_dir = os.path.dirname(__file__)

    # Construct the relative path to EmailTemplate.html
    template_path = os.path.join(current_dir, '..', '..', 'frontend', 'src', 'containers', 'forgotPassword',
                                 'EmailTemplate.html')

    # Normalize the path (optional)
    template_path = os.path.normpath(template_path)

    try:
        # Open the file
        with open(template_path, 'r', encoding='utf-8') as file:
            content = file.read()
            # You can now use 'content' or return it
            return content
    except FileNotFoundError:
        return None


def open_verification_template():
    # Get the directory of the current file (views.py)
    current_dir = os.path.dirname(__file__)

    # Construct the relative path to EmailTemplate.html
    template_path = os.path.join(current_dir, '..', '..', 'frontend', 'src', 'containers', 'accountVerification',
                                 'AccountVerificationTemplate.html')

    # Normalize the path (optional)
    template_path = os.path.normpath(template_path)

    try:
        # Open the file
        with open(template_path, 'r', encoding='utf-8') as file:
            content = file.read()
            # You can now use 'content' or return it
            return content
    except FileNotFoundError:
        return "File doesn't exist."