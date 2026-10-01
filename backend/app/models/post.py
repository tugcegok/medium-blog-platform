# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

# Post - Tag many-to-many ara tablosu
from app.models.tag import post_tags

# SQLAlchemy veri tipleri
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime
)

# Tablolar arasında ilişki kurmamızı sağlar.
from sqlalchemy.orm import relationship

# Tarih ve saat işlemleri için
from datetime import datetime

# Ortak Base sınıfımız.
from app.database import Base


# ==================================================
# POST MODEL
# ==================================================

class Post(Base):

    # Veritabanında oluşacak tablonun adı.
    __tablename__ = "posts"


    # ==================================================
    # TEMEL BİLGİLER
    # ==================================================

    # Yazının benzersiz ID'si.
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    # Yazının başlığı.
    title = Column(
        String,
        nullable=False
    )


    # Yazının içeriği.
    #
    # Text kullanıyoruz çünkü blog yazıları
    # uzun olabilir.
    content = Column(
        Text,
        nullable=False
    )


    # ==================================================
    # YAZININ DURUMU
    # ==================================================

    # draft     → Taslak
    # published → Yayınlanmış
    # scheduled → Planlanmış
    # archived  → Arşivlenmiş

    status = Column(
        String,
        default="draft",
        nullable=False
    )


    # ==================================================
    # YAYINLANMA TARİHİ
    # ==================================================

    # Yazı yayınlandığında tarih burada tutulur.
    # Henüz yayınlanmadıysa None olabilir.

    published_at = Column(
        DateTime,
        nullable=True
    )


    # ==================================================
    # PLANLANMIŞ YAYIN TARİHİ
    # ==================================================

    # Kullanıcı yazıyı ileri bir tarihte
    # yayınlamak isterse bu alan kullanılır.

    scheduled_at = Column(
        DateTime,
        nullable=True
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
    # SON GÜNCELLENME TARİHİ
    # ==================================================

    # Yazı güncellendiğinde otomatik değişir.

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )


    # ==================================================
    # FOREIGN KEYS
    # ==================================================


    # --------------------------------------------------
    # YAZININ SAHİBİ
    # --------------------------------------------------

    # users tablosundaki id alanına bağlıdır.

    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    # --------------------------------------------------
    # YAZININ KATEGORİSİ
    # --------------------------------------------------

    # Bir yazının kategorisi olmak zorunda değildir.
    # Bu yüzden nullable=True.

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=True
    )


    # ==================================================
    # RELATIONSHIPS
    # ==================================================


    # --------------------------------------------------
    # YAZININ SAHİBİ
    # --------------------------------------------------

    # Örnek:
    #
    # post.author.username

    author = relationship(
        "User",
        back_populates="posts"
    )


    # --------------------------------------------------
    # YAZININ KATEGORİSİ
    # --------------------------------------------------

    # Örnek:
    #
    # post.category.name

    category = relationship(
        "Category"
    )


    # --------------------------------------------------
    # YAZININ ETİKETLERİ
    # --------------------------------------------------
    #
    # Bir yazının birden fazla etiketi olabilir.
    #
    # Örnek:
    #
    # FastAPI JWT Yazısı
    #
    # ├── FastAPI
    # ├── Python
    # ├── JWT
    # └── Backend
    #
    # post.tags dediğimiz zaman
    # yazının bütün etiketlerini getirir.
    # --------------------------------------------------

    tags = relationship(
        "Tag",

        # Post ile Tag arasındaki bağlantı
        # post_tags ara tablosundan kurulur.
        secondary=post_tags,

        # Tag modelindeki "posts"
        # relationship'i ile karşılıklı çalışır.
        back_populates="posts"
    )


    # --------------------------------------------------
    # BU YAZIYA YAPILAN YORUMLAR
    # --------------------------------------------------

    # Bir yazının birden fazla yorumu olabilir.

    comments = relationship(
        "Comment",
        back_populates="post",
        cascade="all, delete"
    )


    # ==================================================
    # VERSION HISTORY
    # ==================================================

    # Yazının eski sürümlerini tutar.
    #
    # Örnek:
    #
    # post.history

    history = relationship(
        "PostHistory",
        back_populates="post",
        cascade="all, delete"
    )


    # ==================================================
    # OKUMA SÜRESİ
    # ==================================================

    @property
    def reading_time(self):
        """
        Yazının tahmini okuma süresini dakika olarak hesaplar.

        Ortalama okuma hızı:
        200 kelime / dakika
        """

        # İçerik boşsa en az 1 dakika döndür.
        if not self.content:
            return 1

        # İçeriği kelimelere ayır.
        words = self.content.split()

        # Toplam kelime sayısını bul.
        word_count = len(words)

        # Ortalama okuma süresini hesapla.
        # En az 1 dakika döndür.
        return max(
            1,
            round(word_count / 200)
        )
    