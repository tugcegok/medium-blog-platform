from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Veritabanı bağlantısını almak için
from app.database import get_db

# Clap, Post ve User modelleri
from app.models.clap import Clap
from app.models.post import Post
from app.models.user import User

# Clap response schema'sı
from app.schemas.clap import ClapResponse

# JWT ile giriş yapan kullanıcıyı almak için
from app.auth import get_current_user


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/claps",
    tags=["Claps"]
)


# ==================================================
# POSTA CLAP AT
# ==================================================

@router.post(
    "/{post_id}",
    response_model=ClapResponse
)
def create_clap(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --------------------------------------------------
    # Önce clap atılmak istenen postun var olup
    # olmadığını kontrol ediyoruz.
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # Kullanıcı bu posta daha önce clap atmış mı?
    # --------------------------------------------------

    existing_clap = db.query(Clap).filter(
        Clap.owner_id == current_user.id,
        Clap.post_id == post_id
    ).first()

    # Eğer daha önce clap atılmışsa tekrar clap
    # atılmasına izin vermiyoruz.
    if existing_clap:
        raise HTTPException(
            status_code=400,
            detail="Bu yazıya zaten clap attınız."
        )

    # --------------------------------------------------
    # Yeni clap oluşturuyoruz.
    # --------------------------------------------------
    #
    # owner_id:
    # JWT token'dan gelen mevcut kullanıcının ID'si.
    #
    # post_id:
    # Clap atılan yazının ID'si.
    # --------------------------------------------------

    new_clap = Clap(
        owner_id=current_user.id,
        post_id=post_id
    )

    # Clap'i veritabanına ekle
    db.add(new_clap)

    # Değişikliği kaydet
    db.commit()

    # Veritabanının oluşturduğu ID'yi
    # nesneye tekrar yükle
    db.refresh(new_clap)

    # Oluşturulan clap'i döndür
    return new_clap


# ==================================================
# CLAP'İ GERİ ÇEK
# ==================================================

@router.delete(
    "/{post_id}"
)
def delete_clap(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --------------------------------------------------
    # Kullanıcının bu posta attığı clap'i buluyoruz.
    # --------------------------------------------------

    clap = db.query(Clap).filter(
        Clap.owner_id == current_user.id,
        Clap.post_id == post_id
    ).first()

    # Clap bulunamazsa kullanıcının bu posta
    # clap atmadığını varsayıyoruz.
    if clap is None:
        raise HTTPException(
            status_code=404,
            detail="Bu yazıya ait clap bulunamadı."
        )

    # Clap'i veritabanından sil
    db.delete(clap)

    # Değişikliği kaydet
    db.commit()

    # Başarılı mesajı döndür
    return {
        "message": "Clap geri çekildi."
    }