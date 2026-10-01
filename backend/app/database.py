from sqlalchemy import create_engine # DATABASE BAĞLANTISINI OLUŞTURU
from sqlalchemy.orm import declarative_base, sessionmaker
#BASE: MODEL SINIFININ TEMELİNİ OLUŞTURMAK 
from app.config import DATABASE_URL


# --------------------------------------------------
# Veritabanı Motoru (Engine)
# FastAPI ile SQLite arasındaki bağlantıyı kurar.
# DATABASE BAĞLANTISINI OLUŞTURUR
# --------------------------------------------------
engine = create_engine(  
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


# --------------------------------------------------
# SESSİON:DATABASE İLE KONUŞTUĞUN YER.CRUD İŞLEMLERİ SESSİON ÜZERİNDEN YAPILIR
# 
# --------------------------------------------------
SessionLocal = sessionmaker( 
    autocommit=False,
    autoflush=False,
    bind=engine
)


# --------------------------------------------------
# Tüm modellerimizin ortak sınıfı
# User, Post, Comment vb. tüm tablolar buradan türeyecek.
# --------------------------------------------------
Base = declarative_base()


# -----------------------------------------------------
# Dependency
# istek geldi database bağlantısı aç işlemi yap bağlantıyı kapat
#FastAPInın tekrar eden işlemleri otomatik algılaması Depends(get_db)
# -----------------------------------------------------
def get_db():

    db = SessionLocal()

    try:
        yield db #Oluşturduğum database session'ı endpoint'e gönder,
                 # ama işimtamamen bitmedi. İşlem bitince buraya geri döneceğim.

    finally:
        db.close()
                   
