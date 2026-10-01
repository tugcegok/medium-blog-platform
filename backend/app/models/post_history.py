from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import relationship

from datetime import datetime

from app.database import Base


# ==================================================
# POST HISTORY TABLOSU
# ==================================================

class PostHistory(Base):

    # Veritabanındaki tablo adı
    __tablename__ = "post_history"

    # ==================================================
    # TEMEL BİLGİLER
    # ==================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Hangi yazının eski sürümü olduğu
    post_id = Column(
        Integer,
        ForeignKey("posts.id"),
        nullable=False
    )

    # Eski başlık
    title = Column(
        String,
        nullable=False
    )

    # Eski içerik
    content = Column(
        Text,
        nullable=False
    )

    # Eski durum
    status = Column(
        String,
        nullable=False
    )

    # Bu sürümün ne zaman oluşturulduğu
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # ==================================================
    # RELATIONSHIP
    # ==================================================

    post = relationship(
        "Post",
        back_populates="history"
    )