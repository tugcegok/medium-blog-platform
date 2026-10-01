# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.collection import Collection
from app.models.user import User
from app.models.post import Post

from app.schemas.collection import (
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse
)

from app.auth import get_current_user


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/collections",
    tags=["Collections"]
)


# ==================================================
# KOLEKSİYON OLUŞTUR
# ==================================================

@router.post(
    "",
    response_model=CollectionResponse
)
def create_collection(
    collection: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Aynı kullanıcı aynı isimde
    # ikinci bir koleksiyon oluşturmasın.
    existing_collection = db.query(Collection).filter(
        Collection.user_id == current_user.id,
        Collection.name == collection.name
    ).first()

    if existing_collection:
        raise HTTPException(
            status_code=400,
            detail="Bu isimde bir koleksiyonunuz zaten var."
        )

    new_collection = Collection(
        user_id=current_user.id,
        name=collection.name,
        description=collection.description
    )

    db.add(new_collection)
    db.commit()
    db.refresh(new_collection)

    return new_collection


# ==================================================
# KOLEKSİYONLARIMI GETİR
# ==================================================

@router.get(
    "",
    response_model=list[CollectionResponse]
)
def get_my_collections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    collections = db.query(Collection).filter(
        Collection.user_id == current_user.id
    ).all()

    return collections


# ==================================================
# KOLEKSİYON GÜNCELLE
# ==================================================

@router.put(
    "/{collection_id}",
    response_model=CollectionResponse
)
def update_collection(
    collection_id: int,
    collection_data: CollectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Koleksiyonu bul.
    collection = db.query(Collection).filter(
        Collection.id == collection_id
    ).first()

    if collection is None:
        raise HTTPException(
            status_code=404,
            detail="Koleksiyon bulunamadı."
        )

    # Sadece sahibi düzenleyebilir.
    if collection.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu koleksiyonu düzenleme yetkiniz yok."
        )

    # İsim değiştiriliyorsa aynı isim
    # başka koleksiyonda kullanılıyor mu?
    if collection_data.name is not None:

        existing_collection = db.query(Collection).filter(
            Collection.user_id == current_user.id,
            Collection.name == collection_data.name,
            Collection.id != collection_id
        ).first()

        if existing_collection:
            raise HTTPException(
                status_code=400,
                detail="Bu isimde başka bir koleksiyonunuz zaten var."
            )

        collection.name = collection_data.name

    # Açıklamayı güncelle.
    if collection_data.description is not None:
        collection.description = collection_data.description

    db.commit()
    db.refresh(collection)

    return collection


# ==================================================
# KOLEKSİYON SİL
# ==================================================

@router.delete(
    "/{collection_id}"
)
def delete_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    collection = db.query(Collection).filter(
        Collection.id == collection_id
    ).first()

    if collection is None:
        raise HTTPException(
            status_code=404,
            detail="Koleksiyon bulunamadı."
        )

    # Sadece sahibi silebilir.
    if collection.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu koleksiyonu silme yetkiniz yok."
        )

    db.delete(collection)
    db.commit()

    return {
        "message": "Koleksiyon başarıyla silindi."
    }
# ==================================================
# KOLEKSİYONA POST EKLE
# ==================================================

@router.post(
    "/{collection_id}/posts/{post_id}"
)
def add_post_to_collection(
    collection_id: int,
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # KOLEKSİYONU BUL
    # --------------------------------------------------

    collection = db.query(Collection).filter(
        Collection.id == collection_id
    ).first()

    if collection is None:
        raise HTTPException(
            status_code=404,
            detail="Koleksiyon bulunamadı."
        )


    # --------------------------------------------------
    # KOLEKSİYON KULLANICIYA MI AİT?
    # --------------------------------------------------

    if collection.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu koleksiyona yazı ekleme yetkiniz yok."
        )


    # --------------------------------------------------
    # POSTU BUL
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
    # POST ZATEN KOLEKSİYONDA MI?
    # --------------------------------------------------

    if post in collection.posts:
        raise HTTPException(
            status_code=400,
            detail="Bu yazı zaten koleksiyonda."
        )


    # --------------------------------------------------
    # POSTU KOLEKSİYONA EKLE
    # --------------------------------------------------

    collection.posts.append(post)

    db.commit()

    return {
        "message": "Yazı koleksiyona başarıyla eklendi.",
        "collection_id": collection.id,
        "post_id": post.id
    }


# ==================================================
# KOLEKSİYONDAN POST ÇIKAR
# ==================================================

@router.delete(
    "/{collection_id}/posts/{post_id}"
)
def remove_post_from_collection(
    collection_id: int,
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # KOLEKSİYONU BUL
    # --------------------------------------------------

    collection = db.query(Collection).filter(
        Collection.id == collection_id
    ).first()

    if collection is None:
        raise HTTPException(
            status_code=404,
            detail="Koleksiyon bulunamadı."
        )


    # --------------------------------------------------
    # KOLEKSİYON KULLANICIYA MI AİT?
    # --------------------------------------------------

    if collection.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu koleksiyondan yazı çıkarma yetkiniz yok."
        )


    # --------------------------------------------------
    # POSTU BUL
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
    # POST KOLEKSİYONDA MI?
    # --------------------------------------------------

    if post not in collection.posts:
        raise HTTPException(
            status_code=404,
            detail="Bu yazı koleksiyonda bulunmuyor."
        )


    # --------------------------------------------------
    # KOLEKSİYONDAN ÇIKAR
    # --------------------------------------------------

    collection.posts.remove(post)

    db.commit()

    return {
        "message": "Yazı koleksiyondan başarıyla çıkarıldı.",
        "collection_id": collection.id,
        "post_id": post.id
    }