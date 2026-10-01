from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.database import Base
from sqlalchemy import String

# ==================================================
# USER MODEL
# ==================================================

class User(Base):

    # Veritabanındaki tablo adı
    __tablename__ = "users"


    # ==================================================
    # TEMEL BİLGİLER
    # ==================================================

    # Kullanıcının benzersiz ID'si
    id = Column(
        Integer,
        primary_key=True, # her lullanıcının benzersiz kimliği
        index=True
    )
    # tabloda username isimli alan oluştur demek 
    # Kullanıcı adı
    # unique=True → Aynı kullanıcı adı iki kez kullanılamaz.
    username = Column(
        String,
        unique=True,
        nullable=False
    )

    # Email adresi
    # unique=True → Aynı email iki kullanıcıda olamaz.
    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    # Kullanıcının hashlenmiş şifresi
    # Gerçek şifreyi burada tutmuyoruz.
    hashed_password = Column(
        String,
        nullable=False
    )
# ==================================================
# KULLANICI ROLÜ
# ==================================================

    role = Column(
        String,
        nullable=False,
        default="user"
)

    # ==================================================
    # PROFİL BİLGİLERİ
    # ==================================================

    # Kullanıcının profil açıklaması
    bio = Column(
        String,
        nullable=True
    )

    # Profil fotoğrafının URL'si
    profile_image = Column(
        String,
        nullable=True
    )

    # Kapak fotoğrafının URL'si
    cover_image = Column(
        String,
        nullable=True
    )

    # Kişisel web sitesi
    website = Column(
        String,
        nullable=True
    )

    # Twitter / X hesabı
    twitter = Column(
        String,
        nullable=True
    )

    # Instagram hesabı
    instagram = Column(
        String,
        nullable=True
    )

    # LinkedIn hesabı
    linkedin = Column(
        String,
        nullable=True
    )


    # ==================================================
    # HESAP DURUMU
    # ==================================================

    # True  → Hesap aktif
    # False → Hesap pasif
    #
    # Kullanıcı hesabını tamamen silmek yerine
    # hesabı pasifleştirebiliriz.

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )


    # ==================================================
    # EMAIL DOĞRULAMA DURUMU
    # ==================================================

    # False → Kullanıcı email adresini henüz doğrulamadı.
    # True  → Kullanıcı email adresini doğruladı.
    #
    # Kullanıcı kayıt olduğunda varsayılan olarak
    # False olacaktır.
    #
    # Kullanıcı doğrulama mailindeki linke tıklayınca
    # bu değer True yapılacaktır.

    is_email_verified = Column(
        Boolean,
        default=False,
        nullable=False
    )


    # ==================================================
    # İLİŞKİLER (RELATIONSHIPS)
    # ==================================================
       

    # --------------------------------------------------
    # KULLANICININ YAZILARI
    # --------------------------------------------------

    # Bir kullanıcı birçok yazı yazabilir.
    #
    # Örnek:
    #
    # User
    #   ├── Post 1
    #   ├── Post 2
    #   └── Post 3
    #
    # user.posts dediğimizde
    # kullanıcının bütün yazılarına ulaşabiliriz.

    posts = relationship(
        "Post",
        back_populates="author",
        cascade="all, delete"
    )


    # --------------------------------------------------
    # KULLANICININ YORUMLARI
    # --------------------------------------------------

    # Bir kullanıcı birçok yorum yapabilir.
    #
    # Örnek:
    #
    # User
    #   ├── Comment 1
    #   ├── Comment 2
    #   └── Comment 3
    #
    # user.comments dediğimizde
    # kullanıcının bütün yorumlarına ulaşabiliriz.

    comments = relationship(
        "Comment",
        back_populates="author",
        cascade="all, delete"
    )
    