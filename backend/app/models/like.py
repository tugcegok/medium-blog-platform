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
# LIKE MODEL
# ==================================================

class Like(Base):

    __tablename__ = "likes"


    # ==================================================
    # UNIQUE CONSTRAINT
    # ==================================================
    #
    # Aynı kullanıcı aynı postu
    # sadece bir kez beğenebilir.
    #
    # Örnek:
    #
    # user_id = 12
    # post_id = 4
    #
    # Bu ikili ikinci kez oluşturulamaz.
    # ==================================================

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "post_id",
            name="unique_user_post_like"
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

    # Beğeniyi yapan kullanıcının ID'si.

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    # ==================================================
    # POST
    # ==================================================

    # Beğenilen yazının ID'si.

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

    # Beğeniyi yapan kullanıcı
    user = relationship(
        "User"
    )

    # Beğenilen post
    post = relationship(
        "Post"
    )