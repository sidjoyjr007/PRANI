from cryptography.fernet import Fernet
import os
import base64
from config.settings import settings

# Use settings or fallback
_key = settings.encryption_key
if not _key:
    # Fallback for dev - prints warning
    print("WARNING: ENCRYPTION_KEY not set in settings. Generating temporary key. Secrets will be lost on restart.")
    _key = Fernet.generate_key().decode()

def get_cipher_suite():
    return Fernet(_key.encode())

def encrypt_value(value: str) -> str:
    """Encrypt a string value"""
    if not value:
        return value
    cipher_suite = get_cipher_suite()
    encrypted_bytes = cipher_suite.encrypt(value.encode())
    return encrypted_bytes.decode()

def decrypt_value(encrypted_value: str) -> str:
    """Decrypt a string value"""
    if not encrypted_value:
        return encrypted_value
    cipher_suite = get_cipher_suite()
    decrypted_bytes = cipher_suite.decrypt(encrypted_value.encode())
    return decrypted_bytes.decode()
