# Veritabanı sütunları için gerekli yapılar
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint

# Ortak Base sınıfımız
from app.database import Base


# ==========================================
# Follow Tablosu
# ==========================================

class Follow(Base):

    __tablename__ = "follows"

    # Takip işleminin benzersiz ID'si
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Takip eden kullanıcının ID'si
    follower_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Takip edilen kullanıcının ID'si
    following_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Aynı kullanıcı aynı kişiyi
    # iki kez takip edemez
    __table_args__ = (
        UniqueConstraint(
            "follower_id",
            "following_id",
            name="unique_follow"
        ),
    )