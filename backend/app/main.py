# ==================================================
# UYGULAMANIN GİRİŞ NOKTASI
#fastAPI uygulamasını başlatıyorum routerları uygulamaya bağlıyorum
#SQLALCHEMY MODELLERİNDEN DATABASE TABLOSUNUN OLUŞTURULMASINI SAĞLIYORUM
# ==================================================

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Veritabanı bağlantısı ve Base sınıfı
from app.database import Base, engine


# ==================================================
# MODELLER
# ==================================================
#
# Modelleri import ediyoruz ki SQLAlchemy
# bütün tabloları tanısın.
#
# Şu anda:
# User
# Post
# Comment
# Clap
# Follow
# Repost
# modellerimiz var.
# ==================================================

from app.models import user
from app.models import post
from app.models import comment
from app.models import clap
from app.models import follow
from app.models import repost
from app.models.post_history import PostHistory


# ==================================================
# ROUTERLAR
# ==================================================
#
# API endpoint'lerimizi içeren routerları
# uygulamaya bağlıyoruz.
# ==================================================

from app.routers import users
from app.routers import posts
from app.routers import comments
from app.routers import claps
from app.routers import follows
from app.routers import reposts
from app.routers import category
from app.routers import tag
from app.routers import likes
from app.routers import favorites
from app.routers import collections
from app.routers import reactions
from app.routers import notifications
from app.routers import search 
from app.routers import dashboard
from app.routers import admin

# ==================================================
# FASTAPI UYGULAMASI
# ==================================================

app = FastAPI(
    title="Medium Backend API",
    description="A modern RESTful API for a Medium-inspired blogging platform.",
    version="1.0.0"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# STATIC FILES
# ==================================================

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# ==================================================
# VERİTABANI TABLOLARINI OLUŞTUR
# ==================================================
#
# Henüz oluşturulmamış tablolar varsa oluşturur.
#
# Örneğin:
# users
# posts
# comments
# claps
# follows
# reposts
#
# tablolarının SQLite veritabanında bulunmasını sağlar.
# ==================================================

Base.metadata.create_all(bind=engine)  
 # modelde class User(Base): yazıyorsun bu class bir tablo olacak bu komut çalışınca user database tablosuna dönüyor

# ==================================================
# ROUTERLARI FASTAPI'YE BAĞLA
# ==================================================

# Kullanıcı işlemleri
app.include_router(users.router) #routers/users.py dosyanı ana uygulamaya bağlıyor 

# Blog yazısı işlemleri
app.include_router(posts.router)

# Yorum işlemleri
app.include_router(comments.router)

# Clap işlemleri
app.include_router(claps.router)

# Takip işlemleri
app.include_router(follows.router)

# Repost işlemleri
app.include_router(reposts.router)

app.include_router(category.router)

app.include_router(tag.router)

app.include_router(likes.router)

app.include_router(favorites.router)

app.include_router(collections.router)

app.include_router(reactions.router)

app.include_router(notifications.router)

app.include_router(search.router)

app.include_router(dashboard.router)

app.include_router(admin.router)
# ==================================================
# ANA SAYFA
# ==================================================

@app.get("/")
def home():
    return {
        "message": "Medium Backend API'ye Hoşgeldiniz!"
    }


# ==================================================
# API BİLGİSİ
# ==================================================

@app.get("/about")
def about():
    return {
        "project": "Medium Backend",
        "version": "1.0.0"
    }


# ==================================================
# HEALTH CHECK
# ==================================================
#
# API'nin çalışıp çalışmadığını kontrol etmek için
# kullanılır.
# ==================================================

@app.get("/health")
def health():
    return {
        "status": "OK"
    }
