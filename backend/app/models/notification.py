# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


# ==================================================
# NOTIFICATION MODEL
# ==================================================

class Notification(Base):

    __tablename__ = "notifications"


    # ==================================================
    # ID
    # ==================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    # ==================================================
    # BİLDİRİMİ ALAN KULLANICI
    # ==================================================
    #
    # Bildirimin kime gönderildiğini tutar.
    #
    # Örnek:
    #
    # Ahmet, Tuğçe'nin yazısını beğendi.
    #
    # user_id = Tuğçe'nin ID'si
    # ==================================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    # ==================================================
    # BİLDİRİMİ TETİKLEYEN KULLANICI
    # ==================================================
    #
    # Bildirime sebep olan kullanıcı.
    #
    # Örnek:
    #
    # Ahmet seni takip etti.
    #
    # actor_id = Ahmet'in ID'si
    #
    # Sistem bildirimlerinde actor_id olmayabilir.
    # Bu yüzden nullable=True.
    # ==================================================

    actor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )


    # ==================================================
    # BİLDİRİM TÜRÜ
    # ==================================================
    #
    # Örnek değerler:
    #
    # follow
    # comment
    # like
    # reply
    # system
    # ==================================================

    notification_type = Column(
        String,
        nullable=False
    )


    # ==================================================
    # BİLDİRİM MESAJI
    # ==================================================
    #
    # Örnek:
    #
    # "Ahmet seni takip etmeye başladı."
    #
    # "Ayşe yazını beğendi."
    #
    # "Mehmet yorumuna cevap verdi."
    # ==================================================

    message = Column(
        String,
        nullable=False
    )


    # ==================================================
    # İLGİLİ POST
    # ==================================================
    #
    # Bildirim bir postla ilgiliyse post ID tutulur.
    #
    # Takip bildirimi gibi durumlarda post_id
    # olmayacağı için nullable=True.
    # ==================================================

    post_id = Column(
        Integer,
        ForeignKey("posts.id"),
        nullable=True
    )


    # ==================================================
    # OKUNDU MU?
    # ==================================================
    #
    # False → Kullanıcı henüz bildirimi okumadı.
    # True  → Bildirim okundu.
    # ==================================================

    is_read = Column(
        Boolean,
        default=False,
        nullable=False
    )


    # ==================================================
    # OLUŞTURULMA TARİHİ
    # ==================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


    # ==================================================
    # RELATIONSHIPS
    # ==================================================

    # Bildirimi alan kullanıcı.
    #
    # User tablosuna iki farklı foreign key olduğu için
    # foreign_keys'i açıkça belirtiyoruz.
    user = relationship(
        "User",
        foreign_keys=[user_id]
    )


    # Bildirimi oluşturan/tetikleyen kullanıcı.
    actor = relationship(
        "User",
        foreign_keys=[actor_id]
    )


    # Bildirimle ilgili post.
    post = relationship(
        "Post",
        foreign_keys=[post_id]
    )