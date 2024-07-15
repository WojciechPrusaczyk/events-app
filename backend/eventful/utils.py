import random
import string
import bcrypt
import re

def generate_token(length=64):
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
    if len(password) < 8 or len(password) > 32:
        return False

    # Check for at least one special character ($,@,#,!,%,&,?)
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False

    # Check for at least three numbers
    if len(re.findall(r'\d', password)) < 3:
        return False

    return True