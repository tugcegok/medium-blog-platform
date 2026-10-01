# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tag import Tag
from sqlalchemy import func
from app.models.post import Post
from app.models.tag import post_tags

from app.schemas.tag import (
    TagCreate,
    TagUpdate,
    TagResponse
    
)


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/tags",
    tags=["Tags"]
)


# ==================================================
# YARDIMCI FONKSİYON - SLUG OLUŞTURMA
# ==================================================

def create_slug(name: str) -> str:
    """
    Etiket adını URL'de kullanılabilecek
    basit bir slug formatına çevirir.

    Örnek:
    FastAPI Authentication
    ->
    fastapi-authentication
    """

    return (
        name.strip()
        .lower()
        .replace(" ", "-")
    )


# ==================================================
# ETİKET OLUŞTUR
# ==================================================

@router.post(
    "",
    response_model=TagResponse
)
def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # AYNI İSİMDE ETİKET VAR MI?
    # --------------------------------------------------

    existing_tag = db.query(Tag).filter(
        Tag.name == tag.name
    ).first()

    if existing_tag:
        raise HTTPException(
            status_code=400,
            detail="Bu etiket zaten mevcut."
        )


    # --------------------------------------------------
    # SLUG OLUŞTUR
    # --------------------------------------------------

    slug = create_slug(tag.name)


    # --------------------------------------------------
    # AYNI SLUG VAR MI?
    # --------------------------------------------------

    existing_slug = db.query(Tag).filter(
        Tag.slug == slug
    ).first()

    if existing_slug:
        raise HTTPException(
            status_code=400,
            detail="Bu etikete ait slug zaten mevcut."
        )


    # --------------------------------------------------
    # YENİ ETİKET OLUŞTUR
    # --------------------------------------------------

    new_tag = Tag(
        name=tag.name,
        slug=slug
    )


    # Veritabanına ekle
    db.add(new_tag)

    # Kaydet
    db.commit()

    # Yeni ID gibi bilgileri tekrar yükle
    db.refresh(new_tag)

    return new_tag


# ==================================================
# TÜM ETİKETLERİ GETİR
# ==================================================

@router.get(
    "",
    response_model=list[TagResponse]
)
def get_tags(
    db: Session = Depends(get_db)
):

    tags = db.query(Tag).all()

    return tags
# ==================================================
# ETİKET GÜNCELLE
# ==================================================

@router.put(
    "/{tag_id}",
    response_model=TagResponse
)
def update_tag(
    tag_id: int,
    tag_data: TagUpdate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # ETİKETİ BUL
    # --------------------------------------------------

    tag = db.query(Tag).filter(
        Tag.id == tag_id
    ).first()

    if tag is None:
        raise HTTPException(
            status_code=404,
            detail="Etiket bulunamadı."
        )

    # --------------------------------------------------
    # İSİM GÜNCELLE
    # --------------------------------------------------

    if tag_data.name is not None:

        # Aynı isim başka etikette var mı?
        existing_tag = db.query(Tag).filter(
            Tag.name == tag_data.name,
            Tag.id != tag_id
        ).first()

        if existing_tag:
            raise HTTPException(
                status_code=400,
                detail="Bu etiket adı zaten kullanılıyor."
            )

        # Yeni slug oluştur
        new_slug = create_slug(tag_data.name)

        # Aynı slug başka etikette var mı?
        existing_slug = db.query(Tag).filter(
            Tag.slug == new_slug,
            Tag.id != tag_id
        ).first()

        if existing_slug:
            raise HTTPException(
                status_code=400,
                detail="Bu slug zaten kullanılıyor."
            )

        tag.name = tag_data.name
        tag.slug = new_slug

    # --------------------------------------------------
    # KAYDET
    # --------------------------------------------------

    db.commit()
    db.refresh(tag)

    return tag
# ==================================================
# ETİKET SİL
# ==================================================

@router.delete(
    "/{tag_id}"
)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db)
):

    # Etiketi bul
    tag = db.query(Tag).filter(
        Tag.id == tag_id
    ).first()

    if tag is None:
        raise HTTPException(
            status_code=404,
            detail="Etiket bulunamadı."
        )

    # Etiketi sil
    db.delete(tag)

    # Veritabanına kaydet
    db.commit()

    return {
        "message": "Etiket başarıyla silindi."
    }
# ==================================================
# TREND ETİKETLER
# ==================================================

@router.get("/trending")
def get_trending_tags(
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # HER ETİKETİN KAÇ POSTTA KULLANILDIĞINI SAY
    # --------------------------------------------------

    trending_tags = (
        db.query(
            Tag.id,
            Tag.name,
            Tag.slug,
            func.count(post_tags.c.post_id).label("post_count")
        )
        .outerjoin(
            post_tags,
            Tag.id == post_tags.c.tag_id
        )
        .group_by(
            Tag.id,
            Tag.name,
            Tag.slug
        )
        .order_by(
            func.count(post_tags.c.post_id).desc()
        )
        .all()
    )

    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return [
        {
            "id": tag.id,
            "name": tag.name,
            "slug": tag.slug,
            "post_count": tag.post_count
        }
        for tag in trending_tags
    ]