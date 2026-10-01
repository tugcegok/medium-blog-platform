# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from sqlalchemy import (
    Column,
    Integer,
    String,
    Table,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


# ==================================================
# POST - TAG ARA TABLOSU
# ==================================================
#
# Bir yazının birden fazla etiketi olabilir.
# Bir etiket de birden fazla yazıda kullanılabilir.
#
# Örnek:
#
# Post 1 → Python, FastAPI
# Post 2 → Python, JWT
#
# Bu yüzden many-to-many ilişki kuruyoruz.
# ==================================================

post_tags = Table(
    "post_tags",
    Base.metadata,

    # Hangi posta ait?
    Column(
        "post_id",
        Integer,
        ForeignKey("posts.id"),
        primary_key=True
    ),

    # Hangi etikete ait?
    Column(
        "tag_id",
        Integer,
        ForeignKey("tags.id"),
        primary_key=True
    )
)


# ==================================================
# TAG MODEL
# ==================================================

class Tag(Base):

    __tablename__ = "tags"


    # ==================================================
    # PRIMARY KEY
    # ==================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    # ==================================================
    # ETİKET ADI
    # ==================================================

    # Örnek:
    #
    # Python
    # FastAPI
    # JWT

    name = Column(
        String,
        unique=True,
        nullable=False
    )


    # ==================================================
    # SLUG
    # ==================================================

    # URL'lerde kullanılacak kısa isim.
    #
    # Örnek:
    #
    # FastAPI Authentication
    #
    # =>
    #
    # fastapi-authentication

    slug = Column(
        String,
        unique=True,
        nullable=False
    )


    # ==================================================
    # POST RELATIONSHIP
    # ==================================================
    #
    # Bu etiketin kullanıldığı bütün yazıları getirir.
    #
    # Örnek:
    #
    # tag.posts
    #
    # Python etiketi:
    #
    # Python
    # ├── FastAPI Yazısı
    # ├── Django Yazısı
    # └── Python Başlangıç Yazısı
    # ==================================================

    posts = relationship(
        "Post",

        # Many-to-many ilişkiyi post_tags
        # ara tablosu üzerinden kuruyoruz.
        secondary=post_tags,

        # Post modelindeki "tags"
        # relationship'i ile karşılıklı çalışır.
        back_populates="tags"
    )