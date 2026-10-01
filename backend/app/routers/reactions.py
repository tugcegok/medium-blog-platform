# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db

from app.models.reaction import Reaction
from app.models.post import Post
from app.models.user import User

from app.schemas.reaction import (
    ReactionCreate,
    ReactionResponse
)

from app.auth import get_current_user


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/reactions",
    tags=["Reactions"]
)


# ==================================================
# POSTA REACTION EKLE / DEĞİŞTİR
# ==================================================

@router.post(
    "/posts/{post_id}",
    response_model=ReactionResponse
)
def add_or_update_reaction(
    post_id: int,
    reaction_data: ReactionCreate,
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
    # KULLANICININ MEVCUT REACTION'I VAR MI?
    # --------------------------------------------------

    existing_reaction = db.query(Reaction).filter(
        Reaction.user_id == current_user.id,
        Reaction.post_id == post_id
    ).first()

    # --------------------------------------------------
    # VARSA GÜNCELLE
    # --------------------------------------------------

    if existing_reaction:

        existing_reaction.reaction_type = (
            reaction_data.reaction_type
        )

        db.commit()
        db.refresh(existing_reaction)

        return existing_reaction

    # --------------------------------------------------
    # YOKSA YENİ REACTION OLUŞTUR
    # --------------------------------------------------

    new_reaction = Reaction(
        user_id=current_user.id,
        post_id=post_id,
        reaction_type=reaction_data.reaction_type
    )

    db.add(new_reaction)
    db.commit()
    db.refresh(new_reaction)

    return new_reaction


# ==================================================
# REACTION SİL
# ==================================================

@router.delete(
    "/posts/{post_id}"
)
def delete_reaction(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    reaction = db.query(Reaction).filter(
        Reaction.user_id == current_user.id,
        Reaction.post_id == post_id
    ).first()

    if reaction is None:
        raise HTTPException(
            status_code=404,
            detail="Bu yazıya bırakılmış bir tepkiniz yok."
        )

    db.delete(reaction)
    db.commit()

    return {
        "message": "Tepki başarıyla kaldırıldı."
    }


# ==================================================
# POSTUN REACTION SAYILARINI GETİR
# ==================================================

@router.get(
    "/posts/{post_id}"
)
def get_post_reactions(
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
    # REACTION TÜRLERİNE GÖRE SAY
    # --------------------------------------------------

    results = (
        db.query(
            Reaction.reaction_type,
            func.count(Reaction.id)
        )
        .filter(
            Reaction.post_id == post_id
        )
        .group_by(
            Reaction.reaction_type
        )
        .all()
    )

    # Varsayılan olarak hepsi 0.
    reaction_counts = {
        "love": 0,
        "fire": 0,
        "laugh": 0,
        "clap": 0
    }

    # Veritabanından gelen sayıları yerleştir.
    for reaction_type, count in results:
        reaction_counts[reaction_type] = count

    return {
        "post_id": post_id,
        "reactions": reaction_counts
    }