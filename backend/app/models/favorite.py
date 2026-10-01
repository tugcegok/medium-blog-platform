# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    UniqueConstraint
)

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database import Base


# ==================================================
# FAVORITE MODEL
# ==================================================

class Favorite(Base):

    __tablename__ = "favorites"


    # ==================================================
    # UNIQUE CONSTRAINT
    # ==================================================
    #
    # Bir kullanıcı aynı yazıyı favorilerine
    # yalnızca bir kez ekleyebilir.
    #
    # Örnek:
    #
    # user_id = 12
    # post_id = 3
    #
    # Bu ikili ikinci kez oluşturulamaz.
    # ==================================================

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "post_id",
            name="unique_user_post_favorite"
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

    # Yazıyı favorilere ekleyen kullanıcının ID'si.

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    # ==================================================
    # POST
    # ==================================================

    # Favorilere eklenen yazının ID'si.

    post_id = Column(
        Integer,
        ForeignKey("posts.id"),
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

    # Favoriyi oluşturan kullanıcı.
    user = relationship(
        "User"
    )

    # Favorilere eklenen yazı.
    post = relationship(
        "Post"
    )