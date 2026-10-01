# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from fastapi import APIRouter, Depends, HTTPException

# Login formu
from fastapi.security import OAuth2PasswordRequestForm

# SQLAlchemy veritabanı oturumu
from sqlalchemy.orm import Session


# ==================================================
# AUTH / JWT / ŞİFRE İŞLEMLERİ
# ==================================================

from app.auth import (
    hash_password,
    verify_password,

    # Access / Refresh Token
    create_access_token,
    create_refresh_token,
    verify_refresh_token,

    # Password Reset Token
    create_password_reset_token,
    verify_password_reset_token,

    # Email Verification Token
    create_email_verification_token,
    verify_email_verification_token,

    # Giriş yapan kullanıcı
    get_current_user
)


# ==================================================
# EMAIL SERVİSİ
# ==================================================

# Resend üzerinden gerçek email göndermek için
from app.email_service import (
    send_verification_email,
    send_password_reset_email
)


# ==================================================
# VERİTABANI
# ==================================================

from app.database import get_db


# ==================================================
# MODELLER
# ==================================================

from app.models.user import User


# ==================================================
# USER SCHEMALARI
# ==================================================

from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserPasswordChange,
    ForgotPasswordRequest,
    ResetPasswordRequest
)


# ==================================================
# TOKEN SCHEMALARI
# ==================================================

from app.schemas.token import (
    Token,
    RefreshTokenRequest
)


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ==================================================
# KULLANICI KAYIT
# ==================================================

@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db) #database bağlantısı yani database session açılır
):

    # --------------------------------------------------
    # USERNAME KONTROLÜ
    # --------------------------------------------------

    existing_username = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Bu kullanıcı adı zaten kullanılıyor."
        )


    # --------------------------------------------------
    # EMAIL KONTROLÜ
    # --------------------------------------------------

    existing_email = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Bu email zaten kullanılıyor."
        )


    # --------------------------------------------------
    # ŞİFRE HASHLEME
    # --------------------------------------------------

    # Gerçek şifreyi veritabanında tutmuyoruz.
    hashed_password = hash_password(
        user.password
    )


    # --------------------------------------------------
    # YENİ KULLANICI OLUŞTUR
    # --------------------------------------------------

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,

        # Kullanıcı kayıt olduğunda email
        # henüz doğrulanmamış kabul edilir.
        is_email_verified=False
    )


    # Kullanıcıyı veritabanına ekle
    db.add(new_user)

    # Veritabanına kaydet
    db.commit()

    # Oluşan ID gibi bilgileri tekrar yükle
    db.refresh(new_user)


    # --------------------------------------------------
    # EMAIL VERIFICATION TOKEN OLUŞTUR
    # --------------------------------------------------

    verification_token = create_email_verification_token({
        "user_id": new_user.id
    })


    # --------------------------------------------------
    # DOĞRULAMA MAILİ GÖNDER
    # --------------------------------------------------

    try:

        send_verification_email(
            email=new_user.email,
            verification_token=verification_token
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=(
                "Kullanıcı oluşturuldu fakat "
                f"doğrulama maili gönderilemedi: {str(error)}"
            )
        )


    # Oluşturulan kullanıcıyı döndür
    return new_user


# ==================================================
# EMAIL DOĞRULAMA
# ==================================================

@router.get(
    "/verify-email"
)
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # TOKEN'I DOĞRULA
    # --------------------------------------------------

    payload = verify_email_verification_token(
        token
    )


    # --------------------------------------------------
    # USER ID AL
    # --------------------------------------------------

    user_id = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Geçersiz email doğrulama token'ı."
        )


    # --------------------------------------------------
    # KULLANICIYI BUL
    # --------------------------------------------------

    db_user = db.query(User).filter(
        User.id == user_id
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı."
        )


    # --------------------------------------------------
    # DAHA ÖNCE DOĞRULANMIŞ MI?
    # --------------------------------------------------

    if db_user.is_email_verified:
        return {
            "message": "Email adresiniz zaten doğrulanmış."
        }


    # --------------------------------------------------
    # EMAIL'İ DOĞRULANMIŞ YAP
    # --------------------------------------------------

    db_user.is_email_verified = True

    db.commit()

    db.refresh(db_user)


    return {
        "message": "Email adresiniz başarıyla doğrulandı."
    }


# ==================================================
# EMAIL DOĞRULAMA MAILİNİ TEKRAR GÖNDER
# ==================================================

@router.post(
    "/resend-verification-email"
)
def resend_verification_email(
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # EMAIL ZATEN DOĞRULANMIŞ MI?
    # --------------------------------------------------

    # Kullanıcının email adresi zaten doğrulanmışsa
    # tekrar doğrulama maili göndermeye gerek yok.
    if current_user.is_email_verified:
        return {
            "message": "Email adresiniz zaten doğrulanmış."
        }


    # --------------------------------------------------
    # YENİ VERIFICATION TOKEN OLUŞTUR
    # --------------------------------------------------

    # Kullanıcının eski token'ı kaybolmuş veya
    # süresi dolmuş olabilir.
    #
    # Bu yüzden yeni bir doğrulama token'ı üretiyoruz.
    verification_token = create_email_verification_token({
        "user_id": current_user.id
    })


    # --------------------------------------------------
    # DOĞRULAMA MAILİNİ TEKRAR GÖNDER
    # --------------------------------------------------

    try:

        send_verification_email(
            email=current_user.email,
            verification_token=verification_token
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Doğrulama maili gönderilemedi: {str(error)}"
        )


    # --------------------------------------------------
    # BAŞARILI RESPONSE
    # --------------------------------------------------

    return {
        "message": "Doğrulama maili tekrar gönderildi."
    }


# ==================================================
# KULLANICI GİRİŞİ
# ==================================================

@router.post(
    "/login",
    response_model=Token
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # KULLANICIYI BUL
    # --------------------------------------------------

    db_user = db.query(User).filter(
        User.username == form_data.username
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Kullanıcı adı veya şifre hatalı."
        )


    # --------------------------------------------------
    # HESAP AKTİF Mİ?
    # --------------------------------------------------

    if not db_user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Hesabınız pasifleştirilmiş."
        )


    # --------------------------------------------------
    # ŞİFRE KONTROLÜ
    # --------------------------------------------------

    password_correct = verify_password(
        form_data.password,
        db_user.hashed_password
    )

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Kullanıcı adı veya şifre hatalı."
        )


    # --------------------------------------------------
    # ACCESS TOKEN
    # --------------------------------------------------

    access_token = create_access_token({
        "user_id": db_user.id
    })


    # --------------------------------------------------
    # REFRESH TOKEN
    # --------------------------------------------------

    refresh_token = create_refresh_token({
        "user_id": db_user.id
    })


    # --------------------------------------------------
    # TOKENLARI DÖNDÜR
    # --------------------------------------------------

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# ==================================================
# GİRİŞ YAPAN KULLANICIYI GETİR
# ==================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):

    return current_user


# ==================================================
# PROFİL GÜNCELLEME
# ==================================================

@router.put(
    "/me",
    response_model=UserResponse
)
def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # USERNAME
    # --------------------------------------------------

    if user_data.username is not None:

        existing_username = db.query(User).filter(
            User.username == user_data.username,
            User.id != current_user.id
        ).first()

        if existing_username:
            raise HTTPException(
                status_code=400,
                detail="Bu kullanıcı adı zaten kullanılıyor."
            )

        current_user.username = user_data.username


    # --------------------------------------------------
    # EMAIL
    # --------------------------------------------------

    if user_data.email is not None:

        existing_email = db.query(User).filter(
            User.email == user_data.email,
            User.id != current_user.id
        ).first()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Bu email zaten kullanılıyor."
            )


        # Email gerçekten değişiyorsa yeni email
        # tekrar doğrulanmak zorundadır.
        if user_data.email != current_user.email:

            current_user.email = user_data.email

            current_user.is_email_verified = False


    # --------------------------------------------------
    # PROFİL BİLGİLERİ
    # --------------------------------------------------

    if user_data.bio is not None:
        current_user.bio = user_data.bio

    if user_data.profile_image is not None:
        current_user.profile_image = user_data.profile_image

    if user_data.cover_image is not None:
        current_user.cover_image = user_data.cover_image

    if user_data.website is not None:
        current_user.website = user_data.website

    if user_data.twitter is not None:
        current_user.twitter = user_data.twitter

    if user_data.instagram is not None:
        current_user.instagram = user_data.instagram

    if user_data.linkedin is not None:
        current_user.linkedin = user_data.linkedin


    # --------------------------------------------------
    # VERİTABANINA KAYDET
    # --------------------------------------------------

    db.commit()

    db.refresh(current_user)

    return current_user


# ==================================================
# ŞİFRE DEĞİŞTİRME
# ==================================================

@router.put(
    "/me/password"
)
def change_password(
    password_data: UserPasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # ESKİ ŞİFREYİ KONTROL ET
    # --------------------------------------------------

    password_correct = verify_password(
        password_data.old_password,
        current_user.hashed_password
    )

    if not password_correct:
        raise HTTPException(
            status_code=400,
            detail="Mevcut şifre yanlış."
        )


    # --------------------------------------------------
    # YENİ ŞİFREYİ HASHLE
    # --------------------------------------------------

    new_hashed_password = hash_password(
        password_data.new_password
    )


    # --------------------------------------------------
    # ŞİFREYİ GÜNCELLE
    # --------------------------------------------------

    current_user.hashed_password = new_hashed_password

    db.commit()


    return {
        "message": "Şifre başarıyla değiştirildi."
    }


# ==================================================
# REFRESH TOKEN İLE ACCESS TOKEN YENİLEME
# ==================================================

@router.post(
    "/refresh",
    response_model=Token
)
def refresh_access_token(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # REFRESH TOKEN'I DOĞRULA
    # --------------------------------------------------

    payload = verify_refresh_token(
        token_data.refresh_token
    )


    # --------------------------------------------------
    # USER ID AL
    # --------------------------------------------------

    user_id = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Geçersiz refresh token."
        )


    # --------------------------------------------------
    # KULLANICIYI BUL
    # --------------------------------------------------

    db_user = db.query(User).filter(
        User.id == user_id
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Kullanıcı bulunamadı."
        )


    # Pasif hesap yeni token alamaz.
    if not db_user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Hesabınız pasifleştirilmiş."
        )


    # --------------------------------------------------
    # YENİ ACCESS TOKEN
    # --------------------------------------------------

    new_access_token = create_access_token({
        "user_id": db_user.id
    })


    # --------------------------------------------------
    # YENİ REFRESH TOKEN
    # --------------------------------------------------

    new_refresh_token = create_refresh_token({
        "user_id": db_user.id
    })


    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


# ==================================================
# ŞİFREMİ UNUTTUM
# ==================================================

@router.post(
    "/forgot-password"
)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # EMAIL İLE KULLANICIYI BUL
    # --------------------------------------------------

    db_user = db.query(User).filter(
        User.email == request.email
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="Bu email adresine ait kullanıcı bulunamadı."
        )


    # --------------------------------------------------
    # PASSWORD RESET TOKEN OLUŞTUR
    # --------------------------------------------------

    reset_token = create_password_reset_token({
        "user_id": db_user.id
    })


    # --------------------------------------------------
    # PASSWORD RESET MAILİ GÖNDER
    # --------------------------------------------------

    try:

        send_password_reset_email(
            email=db_user.email,
            reset_token=reset_token
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Şifre sıfırlama maili gönderilemedi: {str(error)}"
        )


    return {
        "message": "Şifre sıfırlama bağlantısı email adresinize gönderildi."
    }


# ==================================================
# ŞİFRE SIFIRLAMA
# ==================================================

@router.post(
    "/reset-password"
)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # RESET TOKEN'I DOĞRULA
    # --------------------------------------------------

    payload = verify_password_reset_token(
        request.token
    )


    # --------------------------------------------------
    # USER ID AL
    # --------------------------------------------------

    user_id = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Geçersiz şifre sıfırlama token'ı."
        )


    # --------------------------------------------------
    # KULLANICIYI BUL
    # --------------------------------------------------

    db_user = db.query(User).filter(
        User.id == user_id
    ).first()

    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı."
        )


    # --------------------------------------------------
    # YENİ ŞİFREYİ HASHLE
    # --------------------------------------------------

    new_hashed_password = hash_password(
        request.new_password
    )


    # --------------------------------------------------
    # ŞİFREYİ GÜNCELLE
    # --------------------------------------------------

    db_user.hashed_password = new_hashed_password

    db.commit()


    return {
        "message": "Şifreniz başarıyla sıfırlandı."
    }


# ==================================================
# ÇIKIŞ YAP
# ==================================================

@router.post(
    "/logout"
)
def logout(
    current_user: User = Depends(get_current_user)
):

    # JWT stateless olduğu için bu sürümde
    # token sunucu tarafında fiziksel olarak silinmez.

    return {
        "message": "Başarıyla çıkış yapıldı."
    }


# ==================================================
# HESABI PASİFLEŞTİR
# ==================================================

@router.put(
    "/me/deactivate"
)
def deactivate_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Kullanıcının hesabını pasifleştir.
    current_user.is_active = False

    db.commit()

    return {
        "message": "Hesabınız başarıyla pasifleştirildi."
    }