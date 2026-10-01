# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.favorite import Favorite
from app.models.post import Post
from app.models.user import User

from app.schemas.favorite import FavoriteResponse

from app.auth import get_current_user


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)


# ==================================================
# POSTU FAVORİLERE EKLE
# ==================================================

@router.post(
    "/posts/{post_id}",
    response_model=FavoriteResponse
)
def add_to_favorites(
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
    # DAHA ÖNCE FAVORİYE EKLENMİŞ Mİ?
    # --------------------------------------------------

    existing_favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.post_id == post_id
    ).first()

    if existing_favorite:
        raise HTTPException(
            status_code=400,
            detail="Bu yazı zaten favorilerinizde."
        )

    # --------------------------------------------------
    # FAVORİ OLUŞTUR
    # --------------------------------------------------

    new_favorite = Favorite(
        user_id=current_user.id,
        post_id=post_id
    )

    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)

    return new_favorite


# ==================================================
# POSTU FAVORİLERDEN ÇIKAR
# ==================================================

@router.delete(
    "/posts/{post_id}"
)
def remove_from_favorites(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # FAVORİ KAYDINI BUL
    # --------------------------------------------------

    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.post_id == post_id
    ).first()

    if favorite is None:
        raise HTTPException(
            status_code=404,
            detail="Bu yazı favorilerinizde değil."
        )

    # --------------------------------------------------
    # FAVORİDEN ÇIKAR
    # --------------------------------------------------

    db.delete(favorite)
    db.commit()

    return {
        "message": "Yazı favorilerden başarıyla çıkarıldı."
    }


# ==================================================
# FAVORİLERİMİ GETİR
# ==================================================

@router.get(
    "",
    response_model=list[FavoriteResponse]
)
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).all()

    return favorites