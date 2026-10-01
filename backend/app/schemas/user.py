from pydantic import BaseModel, EmailStr

# ==================================================
# KULLANICI OLUŞTURMA
# ==================================================

class UserCreate(BaseModel):

    # Kayıt sırasında kullanılacak kullanıcı adı
    username: str

    # Kayıt sırasında kullanılacak email
    email: EmailStr

    # Kayıt sırasında kullanılacak şifre
    password: str


# ==================================================
# KULLANICI GİRİŞİ
# ==================================================

class UserLogin(BaseModel):

    # Login sırasında kullanıcı adı
    username: str

    # Login sırasında şifre
    password: str


# ==================================================
# KULLANICI PROFİLİNİ GÜNCELLEME
# ==================================================

class UserUpdate(BaseModel):

    # Yeni kullanıcı adı
    username: str | None = None

    # Yeni email
    email: EmailStr | None = None

    # Profil açıklaması
    bio: str | None = None

    # Profil fotoğrafı URL'si
    profile_image: str | None = None

    # Kapak fotoğrafı URL'si
    cover_image: str | None = None

    # Web sitesi
    website: str | None = None

    # Twitter / X hesabı
    twitter: str | None = None

    # Instagram hesabı
    instagram: str | None = None

    # LinkedIn hesabı
    linkedin: str | None = None


# ==================================================
# ŞİFRE DEĞİŞTİRME
# ==================================================

class UserPasswordChange(BaseModel):

    # Kullanıcının mevcut şifresi
    old_password: str

    # Kullanıcının belirlemek istediği yeni şifre
    new_password: str


# ==================================================
# API'NİN KULLANICIYA DÖNDÜRECEĞİ VERİ
# ==================================================

class UserResponse(BaseModel):

    # Kullanıcının ID'si
    id: int

    # Kullanıcı adı
    username: str

    # Email
    email: EmailStr

    # Profil açıklaması
    bio: str | None = None

    # Profil fotoğrafı
    profile_image: str | None = None

    # Kapak fotoğrafı
    cover_image: str | None = None

    # Web sitesi
    website: str | None = None

    # Twitter / X
    twitter: str | None = None

    # Instagram
    instagram: str | None = None

    # LinkedIn
    linkedin: str | None = None

    # Hesap aktif mi?
    is_active: bool

    # Email doğrulandı mı?
    is_email_verified: bool

    # SQLAlchemy modelini Pydantic'e çevirmeye izin verir
    class Config:
        from_attributes = True


# ==================================================
# ŞİFREMİ UNUTTUM
# ==================================================

class ForgotPasswordRequest(BaseModel):

    # Şifre sıfırlama linki/tokenı gönderilecek email
    email: EmailStr


# ==================================================
# ŞİFRE SIFIRLAMA
# ==================================================

class ResetPasswordRequest(BaseModel):

    # Şifre sıfırlama için oluşturulan özel token
    token: str

    # Kullanıcının belirlemek istediği yeni şifre
    new_password: str