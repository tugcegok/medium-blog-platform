from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


# ==================================================
# CATEGORY MODEL
# ==================================================

class Category(Base):

    __tablename__ = "categories"

    # --------------------------------------------------
    # PRIMARY KEY
    # --------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # --------------------------------------------------
    # KATEGORİ ADI
    # --------------------------------------------------

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    # --------------------------------------------------
    # AÇIKLAMA
    # --------------------------------------------------

    description = Column(
        String,
        nullable=True
    )

    # --------------------------------------------------
    # ALT KATEGORİ
    # --------------------------------------------------

    parent_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=True
    )

    # --------------------------------------------------
    # RELATIONSHIPS
    # --------------------------------------------------

    parent = relationship(
        "Category",
        remote_side=[id],
        back_populates="children"
    )

    children = relationship(
        "Category",
        back_populates="parent"
    )