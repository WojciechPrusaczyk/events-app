import random
import string
import bcrypt
import re

def generate_token(length=20):
    characters = string.ascii_letters + string.digits
    token = ''.join(random.choice(characters) for _ in range(length))
    return token


def set_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def is_valid_password(password):
    # Check the length
    if len(password) < 8:
        return False

    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False

    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False

    # Check for at least one number
    if not re.search(r'\d', password):
        return False

    # Check for at least one symbol (non-alphanumeric character)
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False

    return True