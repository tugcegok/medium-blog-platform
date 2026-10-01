# Veritabanı sütunları için gerekli yapılar
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint

# Ortak Base sınıfımız
from app.database import Base


# ==========================================
# Clap Tablosu
# ==========================================

class Clap(Base):

    __tablename__ = "claps"

    # Clap'in benzersiz ID'si
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Clap atan kullanıcının ID'si
    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Clap atılan yazının ID'si
    post_id = Column(
        Integer,
        ForeignKey("posts.id"),
        nullable=False
    )

    # Aynı kullanıcı aynı yazıya
    # birden fazla clap atamaz
    __table_args__ = (
        UniqueConstraint(
            "owner_id",
            "post_id",
            name="unique_user_post_clap"
        ),
    )