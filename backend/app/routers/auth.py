# Şifre hashleme işlemleri

from passlib.context import CryptContext

# JWT işlemleri

from datetime import datetime, timedelta
from jose import jwt, JWTError

# FastAPI yapıları

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

# Veritabanı

from sqlalchemy.orm import Session

from app.config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

from app.database import get_db
from app.models.user import User


# --------------------------------------------------
# Şifreleme Ayarı
# --------------------------------------------------

# Şifreleri veritabanına düz metin olarak kaydetmiyoruz.
# bcrypt ile hashliyoruz.

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# --------------------------------------------------
# Şifreyi Hashle
# --------------------------------------------------

def hash_password(password: str):

    # Kullanıcının şifresini hashleyip döndürür.
    return pwd_context.hash(password)


# --------------------------------------------------
# Şifreyi Kontrol Et
# --------------------------------------------------

def verify_password(
    plain_password: str,
    hashed_password: str
):

    # Girilen şifre ile veritabanındaki hash'i karşılaştırır.
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# --------------------------------------------------
# OAuth2
# --------------------------------------------------

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/users/login"
)


# --------------------------------------------------
# Access Token Oluştur
# --------------------------------------------------

def create_access_token(data: dict):

    # Gelen bilgilerin kopyasını oluştur.
    to_encode = data.copy()

    # Token'ın son kullanma zamanını belirle.
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    # Expiration bilgisini token'a ekle.
    to_encode.update({
        "exp": expire
    })

    # JWT oluştur.
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# --------------------------------------------------
# Token Doğrula
# --------------------------------------------------

def verify_access_token(token: str):

    try:

        # JWT'yi çöz ve doğrula.
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Geçersiz token."
        )


# --------------------------------------------------
# Giriş Yapan Kullanıcıyı Getir
# --------------------------------------------------

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    # Token'ı doğrula.
    payload = verify_access_token(token)

    # Token içerisinden kullanıcı ID'sini al.
    user_id = payload.get("user_id")

    if user_id is None:

        raise HTTPException(
            status_code=401,
            detail="Geçersiz token."
        )

    # Kullanıcıyı veritabanından bul.
    db_user = db.query(User).filter(
        User.id == user_id
    ).first()

    if db_user is None:

        raise HTTPException(
            status_code=401,
            detail="Kullanıcı bulunamadı."
        )

    return db_user