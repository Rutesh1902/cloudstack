import bcrypt
import hashlib


def hash_password(password: str):
    # Hash password with SHA256 first to bypass bcrypt's 72-byte limit
    sha256_hash = hashlib.sha256(password.encode()).hexdigest().encode("utf-8")
    hashed = bcrypt.hashpw(sha256_hash, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password, hashed_password):
    sha256_hash = hashlib.sha256(plain_password.encode()).hexdigest().encode("utf-8")
    return bcrypt.checkpw(sha256_hash, hashed_password.encode("utf-8"))
