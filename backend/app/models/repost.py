# Veritabanı sütunları için gerekli yapılar
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint

# Ortak Base sınıfımız
from app.database import Base


# ==========================================
# Repost Tablosu
# ==========================================

class Repost(Base):

    __tablename__ = "reposts"

    # Repost işleminin benzersiz ID'si
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Repost yapan kullanıcının ID'si
    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Repost edilen yazının ID'si
    post_id = Column(
        Integer,
        ForeignKey("posts.id"),
        nullable=False
    )

    # Aynı kullanıcı aynı yazıyı
    # birden fazla kez repost edemez
    __table_args__ = (
        UniqueConstraint(
            "owner_id",
            "post_id",
            name="unique_user_post_repost"
        ),
    )