from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    Table
)

from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


# ==================================================
# COLLECTION - POST ARA TABLOSU
# ==================================================

collection_posts = Table(
    "collection_posts",
    Base.metadata,

    Column(
        "collection_id",
        Integer,
        ForeignKey("collections.id"),
        primary_key=True
    ),

    Column(
        "post_id",
        Integer,
        ForeignKey("posts.id"),
        primary_key=True
    )
)


# ==================================================
# COLLECTION MODEL
# ==================================================

class Collection(Base):

    __tablename__ = "collections"

    # --------------------------------------------------
    # ID
    # --------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # --------------------------------------------------
    # KULLANICI
    # --------------------------------------------------

    # Koleksiyonun sahibi
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # --------------------------------------------------
    # KOLEKSİYON ADI
    # --------------------------------------------------

    name = Column(
        String,
        nullable=False
    )

    # --------------------------------------------------
    # AÇIKLAMA
    # --------------------------------------------------

    description = Column(
        Text,
        nullable=True
    )

    # --------------------------------------------------
    # OLUŞTURULMA TARİHİ
    # --------------------------------------------------

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # --------------------------------------------------
    # RELATIONSHIPS
    # --------------------------------------------------

    user = relationship(
        "User"
    )

    posts = relationship(
        "Post",
        secondary=collection_posts
    )