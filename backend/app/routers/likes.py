# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.like import Like
from app.models.post import Post
from app.models.user import User
from app.models.notification import Notification

from app.schemas.like import (
    LikeResponse,
    LikeCountResponse
)

from app.auth import get_current_user


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/likes",
    tags=["Likes"]
)


# ==================================================
# POSTU BEĞEN
# ==================================================

@router.post(
    "/posts/{post_id}",
    response_model=LikeResponse
)
def like_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # POST VAR MI?
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
    # KULLANICI DAHA ÖNCE BEĞENDİ Mİ?
    # --------------------------------------------------

    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.post_id == post_id
    ).first()

    if existing_like:
        raise HTTPException(
            status_code=400,
            detail="Bu yazıyı zaten beğendiniz."
        )


    # --------------------------------------------------
    # BEĞENİ OLUŞTUR
    # --------------------------------------------------

    new_like = Like(
        user_id=current_user.id,
        post_id=post_id
    )

    db.add(new_like)


    # ==================================================
    # YENİ BEĞENİ BİLDİRİMİ
    # ==================================================
    #
    # Kullanıcı kendi yazısını beğenirse
    # kendisine bildirim göndermiyoruz.
    # ==================================================

    if post.owner_id != current_user.id:

        notification = Notification(

            # Bildirimi post sahibi alır
            user_id=post.owner_id,

            # Beğeniyi yapan kullanıcı
            actor_id=current_user.id,

            # Bildirim türü
            notification_type="like",

            # Kullanıcıya gösterilecek mesaj
            message=(
                f"{current_user.username} "
                "yazınızı beğendi."
            ),

            # Hangi post beğenildi?
            post_id=post.id
        )

        db.add(notification)


    # --------------------------------------------------
    # VERİTABANINA KAYDET
    # --------------------------------------------------

    db.commit()

    db.refresh(new_like)

    return new_like


# ==================================================
# POSTTAN BEĞENİYİ KALDIR
# ==================================================

@router.delete(
    "/posts/{post_id}"
)
def unlike_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # KULLANICININ BEĞENİSİNİ BUL
    # --------------------------------------------------

    like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.post_id == post_id
    ).first()

    if like is None:
        raise HTTPException(
            status_code=404,
            detail="Bu yazıyı henüz beğenmediniz."
        )


    # --------------------------------------------------
    # BEĞENİYİ SİL
    # --------------------------------------------------

    db.delete(like)

    db.commit()

    return {
        "message": "Beğeni başarıyla kaldırıldı."
    }


# ==================================================
# POSTUN BEĞENİ SAYISINI GETİR
# ==================================================

@router.get(
    "/posts/{post_id}",
    response_model=LikeCountResponse
)
def get_post_like_count(
    post_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # POST VAR MI?
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
    # BEĞENİ SAYISI
    # --------------------------------------------------

    like_count = db.query(Like).filter(
        Like.post_id == post_id
    ).count()

    return {
        "post_id": post_id,
        "like_count": like_count
    }