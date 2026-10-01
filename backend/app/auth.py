# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

# Şifre hashleme işlemleri
from passlib.context import CryptContext

# JWT işlemleri
from datetime import datetime, timedelta
from jose import jwt, JWTError

# FastAPI yapıları
from fastapi import Depends, HTTPException
from app.models.user import User
from fastapi.security import OAuth2PasswordBearer

# SQLAlchemy
from sqlalchemy.orm import Session

# Proje dosyaları
from app.config import (
    SECRET_KEY, #SECRET_KEY, JWT'nin imzasını oluşturmak ve doğrulamak için kullanılıyor.
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,#Token ele geçirilirse sonsuza kadar kullanılamasın.
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
)

from app.database import get_db
from app.models.user import User


# ==================================================
# ŞİFRELEME AYARI
# ==================================================

# Şifreleri veritabanında düz metin olarak tutmuyoruz.
# bcrypt ile hashliyoruz.

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ==================================================
# ŞİFRE HASHLEME
# ==================================================

def hash_password(password: str):
    """
    Kullanıcının şifresini bcrypt ile hashler.
    """

    return pwd_context.hash(password)


# ==================================================
# ŞİFRE KONTROLÜ
# ==================================================

def verify_password(
    plain_password: str,
    hashed_password: str
):
    """
    Girilen şifre ile veritabanındaki
    hashlenmiş şifreyi karşılaştırır.
    """

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ==================================================
# OAUTH2
# ==================================================

# Swagger'ın kullanıcıdan Bearer Token almasını sağlar.

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/users/login"
)


# ==================================================
# ACCESS TOKEN OLUŞTURMA
# ==================================================

def create_access_token(data: dict):
    """
    Kullanıcı giriş yaptığında kısa süreli
    Access Token oluşturur.
    """

    # Gelen verilerin kopyasını oluştur.
    to_encode = data.copy()

    # Token'ın son kullanma zamanını belirle.
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    # Token'a expiration bilgisini ekle.
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


# ==================================================
# REFRESH TOKEN OLUŞTURMA
# ==================================================

def create_refresh_token(data: dict):
    """
    Access Token süresi dolduğunda yeni Access Token
    oluşturabilmek için uzun süreli Refresh Token üretir.
    """

    # Gelen bilgilerin kopyasını oluştur.
    to_encode = data.copy()

    # Refresh Token 7 gün geçerli olacak.
    expire = datetime.utcnow() + timedelta(
        days=7
    )

    # Token'a expiration bilgisini ekle.
    to_encode.update({
        "exp": expire
    })

    # Refresh Token oluştur.
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# ==================================================
# PASSWORD RESET TOKEN OLUŞTURMA
# ==================================================

def create_password_reset_token(data: dict):
    """
    Kullanıcının şifresini sıfırlayabilmesi için
    kısa süreli özel bir token oluşturur.
    """

    # Gelen bilgilerin kopyasını oluştur.
    to_encode = data.copy()

    # Password Reset Token'ın
    # son kullanma zamanını belirle.
    expire = datetime.utcnow() + timedelta(
        minutes=PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
    )

    # Token'a expiration ve token türünü ekle.
    #
    # token_type sayesinde bu token'ın
    # sadece şifre sıfırlama amacıyla
    # oluşturulduğunu anlayacağız.
    to_encode.update({
        "exp": expire,
        "token_type": "password_reset"
    })

    # JWT oluştur.
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# ==================================================
# EMAIL VERIFICATION TOKEN OLUŞTURMA
# ==================================================

def create_email_verification_token(data: dict):
    """
    Kullanıcının email adresini doğrulayabilmesi için
    özel bir doğrulama token'ı oluşturur.
    """

    # Gelen bilgilerin kopyasını oluştur.
    to_encode = data.copy()

    # Email doğrulama token'ı 24 saat geçerli olacak.
    expire = datetime.utcnow() + timedelta(
        hours=24
    )

    # Token'ın ne amaçla üretildiğini belirt.
    to_encode.update({
        "exp": expire,
        "token_type": "email_verification"
    })

    # JWT oluştur.
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# ==================================================
# ACCESS TOKEN DOĞRULAMA
# ==================================================

def verify_access_token(token: str):
    """
    Gelen Access Token'ın geçerli olup olmadığını kontrol eder.
    """

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
            detail="Geçersiz veya süresi dolmuş token."
        )


# ==================================================
# REFRESH TOKEN DOĞRULAMA
# ==================================================

def verify_refresh_token(token: str):
    """
    Gelen Refresh Token'ın geçerli olup olmadığını kontrol eder.
    """

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
            detail="Geçersiz veya süresi dolmuş refresh token."
        )


# ==================================================
# PASSWORD RESET TOKEN DOĞRULAMA
# ==================================================

def verify_password_reset_token(token: str):
    """
    Gelen Password Reset Token'ın
    geçerli olup olmadığını kontrol eder.
    """

    try:

        # JWT'yi çöz ve doğrula.
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # --------------------------------------------------
        # TOKEN TYPE KONTROLÜ
        # --------------------------------------------------

        # Normal Access Token veya başka tür token
        # şifre sıfırlamada kullanılamasın.

        token_type = payload.get("token_type")

        if token_type != "password_reset":
            raise HTTPException(
                status_code=401,
                detail="Geçersiz şifre sıfırlama token'ı."
            )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Geçersiz veya süresi dolmuş şifre sıfırlama token'ı."
        )


# ==================================================
# EMAIL VERIFICATION TOKEN DOĞRULAMA
# ==================================================

def verify_email_verification_token(token: str):
    """
    Gelen email doğrulama token'ının
    geçerli olup olmadığını kontrol eder.
    """

    try:

        # JWT'yi çöz ve doğrula.
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # --------------------------------------------------
        # TOKEN TYPE KONTROLÜ
        # --------------------------------------------------

        # Access Token, Refresh Token veya
        # Password Reset Token burada kullanılamasın.

        token_type = payload.get("token_type")

        if token_type != "email_verification":
            raise HTTPException(
                status_code=401,
                detail="Geçersiz email doğrulama token'ı."
            )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Geçersiz veya süresi dolmuş email doğrulama token'ı."
        )


# ==================================================
# GİRİŞ YAPAN KULLANICIYI BUL
# ==================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    JWT içerisindeki user_id bilgisini kullanarak
    giriş yapan kullanıcıyı veritabanından bulur.
    """

    # --------------------------------------------------
    # TOKEN'I DOĞRULA
    # --------------------------------------------------

    payload = verify_access_token(token)


    # --------------------------------------------------
    # USER ID'Yİ AL
    # --------------------------------------------------

    user_id = payload.get("user_id")


    # Token içerisinde user_id yoksa hata ver.
    if user_id is None:

        raise HTTPException(
            status_code=401,
            detail="Geçersiz token."
        )


    # --------------------------------------------------
    # KULLANICIYI VERİTABANINDAN BUL
    # --------------------------------------------------

    db_user = db.query(User).filter(
        User.id == user_id
    ).first()


    # Kullanıcı bulunamadıysa hata ver.
    if db_user is None:

        raise HTTPException(
            status_code=401,
            detail="Kullanıcı bulunamadı."
        )


    # ==================================================
    # AKTİF KULLANICI KONTROLÜ
    # ==================================================

    # Kullanıcının hesabı pasifleştirilmişse
    # korumalı endpoint'e erişmesine izin verme.

    if not db_user.is_active:

        raise HTTPException(
            status_code=403,
            detail="Hesabınız pasifleştirilmiş."
        )


    # Kullanıcı aktifse endpoint'e gönder.
    return db_user
# ==================================================
# ADMIN KULLANICI KONTROLÜ
# ==================================================

def get_current_admin(
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # KULLANICI ADMIN Mİ?
    # --------------------------------------------------
    #
    # get_current_user() JWT token üzerinden
    # giriş yapan kullanıcıyı zaten buluyor.
    #
    # Burada sadece rolünü kontrol ediyoruz.
    # --------------------------------------------------

    if current_user.role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Bu işlem için admin yetkisi gereklidir."
        )

    # Kullanıcı admin ise devam etmesine izin veriyoruz.
    return current_user