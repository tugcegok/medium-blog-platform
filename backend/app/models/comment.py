# SQLAlchemy'den veritabanı sütunlarını oluşturmak için gerekli yapıları içe aktarıyoruz.
from sqlalchemy import Column, Integer, Text, ForeignKey

# Tablolar arasında ilişki (relationship) kurmamızı sağlayan yapı.
from sqlalchemy.orm import relationship

# Bütün modellerimizin ortak miras aldığı Base sınıfı.
from app.database import Base


# ==========================================
# Comment (Yorum) Tablosu
# ==========================================
class Comment(Base):

    # Veritabanında oluşacak tablonun adı.
    __tablename__ = "comments"

    # ==========================================
    # Temel Bilgiler
    # ==========================================

    # Yorumun benzersiz ID'si.
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Kullanıcının yazdığı yorum metni.
    content = Column(
        Text,
        nullable=False
    )

    # ==========================================
    # Foreign Key (Yabancı Anahtarlar)
    # ==========================================

    # Bu yorumu yazan kullanıcının ID'si.
    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # Bu yorumun ait olduğu yazının ID'si.
    post_id = Column(
        Integer,
        ForeignKey("posts.id"),
        nullable=False
    )

    # ==========================================
    # PARENT COMMENT
    # ==========================================
    #
    # Eğer bu yorum başka bir yoruma cevap ise,
    # cevap verilen yorumun ID'si burada tutulur.
    #
    # Ana yorum:
    # parent_id = None
    #
    # Cevap:
    # parent_id = 5
    # ==========================================

    parent_id = Column(
        Integer,
        ForeignKey("comments.id"),
        nullable=True
    )

    # ==========================================
    # Relationship (İlişkiler)
    # ==========================================

    # Bu yorumun sahibi olan kullanıcı.
    author = relationship(
        "User",
        back_populates="comments"
    )

    # Bu yorumun ait olduğu post.
    post = relationship(
        "Post",
        back_populates="comments"
    )

    # ==========================================
    # YORUMUN CEVAP VERDİĞİ ÜST YORUM
    # ==========================================

    parent = relationship(
        "Comment",
        remote_side=[id],
        back_populates="replies"
    )

    # ==========================================
    # BU YORUMA GELEN CEVAPLAR
    # ==========================================

    replies = relationship(
        "Comment",
        back_populates="parent",
        cascade="all, delete"
    )