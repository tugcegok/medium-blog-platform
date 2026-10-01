# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime
)

from datetime import datetime

from app.database import Base


# ==================================================
# POST VIEW MODEL
# ==================================================

class PostView(Base):

    __tablename__ = "post_views"

    # --------------------------------------------------
    # ID
    # --------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # --------------------------------------------------
    # HANGİ POST OKUNDU?
    # --------------------------------------------------

    post_id = Column(
        Integer,
        ForeignKey("posts.id"),
        nullable=False
    )

    # --------------------------------------------------
    # HANGİ KULLANICI OKUDU?
    # --------------------------------------------------
    #
    # Giriş yapmamış kullanıcılar için
    # ileride nullable=True yapabiliriz.
    # Şimdilik giriş yapan kullanıcıları takip ediyoruz.
    # --------------------------------------------------

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # --------------------------------------------------
    # OKUNMA TARİHİ
    # --------------------------------------------------

    viewed_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )