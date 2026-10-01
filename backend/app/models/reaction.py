# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    UniqueConstraint
)

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database import Base


# ==================================================
# REACTION MODEL
# ==================================================

class Reaction(Base):

    __tablename__ = "reactions"


    # ==================================================
    # UNIQUE CONSTRAINT
    # ==================================================
    #
    # Bir kullanıcı aynı posta
    # yalnızca tek bir aktif reaction bırakabilir.
    #
    # Örnek:
    #
    # user_id = 12
    # post_id = 3
    #
    # reaction_type = "fire"
    #
    # Kullanıcı daha sonra "love" seçerse
    # yeni satır oluşturmak yerine
    # mevcut reaction güncellenir.
    # ==================================================

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "post_id",
            name="unique_user_post_reaction"
        ),
    )


    # ==================================================
    # ID
    # ==================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    # ==================================================
    # KULLANICI
    # ==================================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    # ==================================================
    # POST
    # ==================================================

    post_id = Column(
        Integer,
        ForeignKey("posts.id"),
        nullable=False
    )


    # ==================================================
    # REACTION TYPE
    # ==================================================
    #
    # Örnek değerler:
    #
    # love
    # fire
    # laugh
    # clap
    # ==================================================

    reaction_type = Column(
        String,
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

    user = relationship(
        "User"
    )

    post = relationship(
        "Post"
    )