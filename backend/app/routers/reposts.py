from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Veritabanı bağlantısını almak için
from app.database import get_db

# Repost, Post ve User modelleri
from app.models.repost import Repost
from app.models.post import Post
from app.models.user import User

# JWT ile giriş yapan mevcut kullanıcıyı almak için
from app.auth import get_current_user


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/reposts",
    tags=["Reposts"]
)


# ==================================================
# REPOST OLUŞTUR
# ==================================================

@router.post("/{post_id}")
def create_repost(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --------------------------------------------------
    # Önce repost yapılmak istenen yazının
    # veritabanında olup olmadığını kontrol ediyoruz.
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    # Yazı bulunamazsa 404 döndür.
    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # Kullanıcının bu yazıyı daha önce repost edip
    # etmediğini kontrol ediyoruz.
    # --------------------------------------------------

    existing_repost = db.query(Repost).filter(
        Repost.owner_id == current_user.id,
        Repost.post_id == post_id
    ).first()

    # Daha önce repost edilmişse tekrar edilmesine
    # izin vermiyoruz.
    if existing_repost:
        raise HTTPException(
            status_code=400,
            detail="Bu yazıyı zaten repost yaptınız."
        )

    # --------------------------------------------------
    # Yeni repost oluşturuyoruz.
    # --------------------------------------------------
    #
    # owner_id:
    # JWT token'dan gelen kullanıcının ID'si.
    #
    # post_id:
    # Repost edilen yazının ID'si.
    # --------------------------------------------------

    new_repost = Repost(
        owner_id=current_user.id,
        post_id=post_id
    )

    # Repost'u veritabanına ekle
    db.add(new_repost)

    # Değişikliği kaydet
    db.commit()

    # Veritabanının oluşturduğu ID gibi bilgileri
    # nesneye tekrar yükle
    db.refresh(new_repost)

    # Başarılı mesajı döndür
    return {
        "message": "Yazı başarıyla repost edildi."
    }


# ==================================================
# REPOST KALDIR
# ==================================================

@router.delete("/{post_id}")
def delete_repost(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --------------------------------------------------
    # Önce kullanıcının bu yazıya yaptığı repost'u
    # buluyoruz.
    # --------------------------------------------------

    repost = db.query(Repost).filter(
        Repost.owner_id == current_user.id,
        Repost.post_id == post_id
    ).first()

    # Repost bulunamazsa kullanıcı bu yazıyı
    # repost etmemiş demektir.
    if repost is None:
        raise HTTPException(
            status_code=404,
            detail="Bu yazıyı repost etmediniz."
        )

    # Repost'u veritabanından sil
    db.delete(repost)

    # Değişikliği kaydet
    db.commit()

    # Başarılı mesajı döndür
    return {
        "message": "Repost kaldırıldı."
    }


# ==================================================
# REPOST SAYISINI GETİR
# ==================================================

@router.get("/{post_id}/count")
def get_repost_count(
    post_id: int,
    db: Session = Depends(get_db)
):
    # --------------------------------------------------
    # Önce yazının var olup olmadığını kontrol ediyoruz.
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    # Yazı bulunamazsa 404 döndür.
    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # Bu yazıya ait toplam repost sayısını buluyoruz.
    # --------------------------------------------------

    repost_count = db.query(Repost).filter(
        Repost.post_id == post_id
    ).count()

    # Sonucu kullanıcıya döndür
    return {
        "post_id": post_id,
        "repost_count": repost_count
    }