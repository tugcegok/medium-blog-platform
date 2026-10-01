from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.category import Category
from app.models.post import Post

from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse
)


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


# ==================================================
# KATEGORİ OLUŞTUR
# ==================================================

@router.post(
    "",
    response_model=CategoryResponse
)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # AYNI İSİMDE KATEGORİ VAR MI?
    # --------------------------------------------------

    existing_category = db.query(Category).filter(
        Category.name == category.name
    ).first()

    if existing_category:
        raise HTTPException(
            status_code=400,
            detail="Bu kategori zaten mevcut."
        )


    # --------------------------------------------------
    # PARENT CATEGORY KONTROLÜ
    # --------------------------------------------------
    #
    # parent_id gönderildiyse gerçekten böyle
    # bir üst kategori var mı kontrol ediyoruz.
    # --------------------------------------------------

    if category.parent_id is not None:

        parent_category = db.query(Category).filter(
            Category.id == category.parent_id
        ).first()

        if parent_category is None:
            raise HTTPException(
                status_code=404,
                detail="Üst kategori bulunamadı."
            )


    # --------------------------------------------------
    # YENİ KATEGORİ OLUŞTUR
    # --------------------------------------------------

    new_category = Category(
        name=category.name,
        description=category.description,
        parent_id=category.parent_id
    )

    db.add(new_category)

    db.commit()

    db.refresh(new_category)

    return new_category


# ==================================================
# TÜM KATEGORİLERİ GETİR
# ==================================================

@router.get(
    "",
    response_model=list[CategoryResponse]
)
def get_categories(
    db: Session = Depends(get_db)
):

    categories = db.query(Category).all()

    return categories
# ==================================================
# KATEGORİ GÜNCELLE
# ==================================================

@router.put(
    "/{category_id}",
    response_model=CategoryResponse
)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # KATEGORİYİ BUL
    # --------------------------------------------------

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Kategori bulunamadı."
        )

    # --------------------------------------------------
    # KATEGORİ ADINI GÜNCELLE
    # --------------------------------------------------

    if category_data.name is not None:

        # Aynı isim başka kategoride kullanılıyor mu?
        existing_category = db.query(Category).filter(
            Category.name == category_data.name,
            Category.id != category_id
        ).first()

        if existing_category:
            raise HTTPException(
                status_code=400,
                detail="Bu kategori adı zaten kullanılıyor."
            )

        category.name = category_data.name

    # --------------------------------------------------
    # AÇIKLAMAYI GÜNCELLE
    # --------------------------------------------------

    if category_data.description is not None:
        category.description = category_data.description

    # --------------------------------------------------
    # ÜST KATEGORİYİ GÜNCELLE
    # --------------------------------------------------

    if category_data.parent_id is not None:

        # Kategori kendisinin üst kategorisi olamaz.
        if category_data.parent_id == category_id:
            raise HTTPException(
                status_code=400,
                detail="Bir kategori kendisinin üst kategorisi olamaz."
            )

        parent_category = db.query(Category).filter(
            Category.id == category_data.parent_id
        ).first()

        if parent_category is None:
            raise HTTPException(
                status_code=404,
                detail="Üst kategori bulunamadı."
            )

        category.parent_id = category_data.parent_id

    # --------------------------------------------------
    # KAYDET
    # --------------------------------------------------

    db.commit()
    db.refresh(category)

    return category
# ==================================================
# KATEGORİ SİL
# ==================================================

@router.delete(
    "/{category_id}"
)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # KATEGORİYİ BUL
    # --------------------------------------------------

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Kategori bulunamadı."
        )

    # --------------------------------------------------
    # ALT KATEGORİ VAR MI?
    # --------------------------------------------------
    #
    # Bir kategorinin altında başka kategoriler varsa
    # doğrudan silinmesine izin vermiyoruz.
    # Önce alt kategoriler düzenlenmeli veya silinmeli.
    # --------------------------------------------------

    child_category = db.query(Category).filter(
        Category.parent_id == category_id
    ).first()

    if child_category is not None:
        raise HTTPException(
            status_code=400,
            detail="Bu kategoriye bağlı alt kategoriler bulunduğu için silinemez."
        )

    # --------------------------------------------------
    # KATEGORİYİ SİL
    # --------------------------------------------------

    db.delete(category)

    db.commit()

    return {
        "message": "Kategori başarıyla silindi."
    }
# ==================================================
# POPÜLER KATEGORİLER
# ==================================================

@router.get("/popular")
def get_popular_categories(
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # KATEGORİ BAŞINA YAZI SAYISINI HESAPLA
    # --------------------------------------------------
    #
    # Category ile Post tablolarını birleştiriyoruz.
    #
    # Her kategori için kaç tane post olduğunu sayıyoruz.
    #
    # En çok postu olan kategori en üstte görünecek.
    # --------------------------------------------------

    popular_categories = (
        db.query(
            Category.id,
            Category.name,
            func.count(Post.id).label("post_count")
        )
        .outerjoin(
            Post,
            Post.category_id == Category.id
        )
        .group_by(
            Category.id,
            Category.name
        )
        .order_by(
            func.count(Post.id).desc()
        )
        .all()
    )

    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return [
        {
            "id": category.id,
            "name": category.name,
            "post_count": category.post_count
        }
        for category in popular_categories
    ]