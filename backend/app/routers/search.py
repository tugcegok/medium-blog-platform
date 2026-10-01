# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.post import Post
from app.models.user import User
from app.models.tag import Tag,post_tags
from app.models.category import Category 

from app.schemas.post import PostResponse


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


# ==================================================
# POST ARA
# ==================================================

@router.get(
    "/posts",
    response_model=list[PostResponse]
)
def search_posts(
    q: str = Query(
        ...,
        min_length=1,
        description="Başlık veya içerikte aranacak kelime"
    ),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # BAŞLIK VE İÇERİKTE ARAMA
    # --------------------------------------------------
    #
    # ilike:
    # Büyük/küçük harf duyarsız arama yapar.
    #
    # Örneğin:
    #
    # q = "fastapi"
    #
    # FastAPI
    # FASTAPI
    # fastapi
    #
    # hepsini bulabilir.
    # --------------------------------------------------

    posts = db.query(Post).filter(

        # Sadece yayınlanmış postlar
        Post.status == "published",

        # Başlık VEYA içerikte q kelimesi geçsin
        or_(
            Post.title.ilike(f"%{q}%"),
            Post.content.ilike(f"%{q}%")
        )

    ).all()

    return posts
# ==================================================
# YAZARA GÖRE POST ARA
# ==================================================

@router.get(
    "/authors",
    response_model=list[PostResponse]
)
def search_posts_by_author(
    username: str = Query(
        ...,
        min_length=1,
        description="Aranacak yazarın kullanıcı adı"
    ),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # USER VE POST TABLOLARINI BİRLEŞTİR
    # --------------------------------------------------
    #
    # Post.owner_id → User.id
    #
    # Böylece username üzerinden post arayabiliyoruz.
    # --------------------------------------------------

    posts = (
        db.query(Post)
        .join(
            User,
            Post.owner_id == User.id
        )
        .filter(
            # Sadece yayınlanmış yazılar
            Post.status == "published",

            # Kullanıcı adında arama
            User.username.ilike(f"%{username}%")
        )
        .all()
    )

    return posts
# ==================================================
# ETİKETE GÖRE POST ARA
# ==================================================

@router.get(
    "/tags",
    response_model=list[PostResponse]
)
def search_posts_by_tag(
    tag: str = Query(
        ...,
        min_length=1,
        description="Aranacak etiket adı"
    ),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # POST - TAG MANY TO MANY İLİŞKİSİ
    # --------------------------------------------------
    #
    # posts
    #   ↓
    # post_tags
    #   ↓
    # tags
    #
    # Etiket adına göre ilgili postları buluyoruz.
    # --------------------------------------------------

    posts = (
        db.query(Post)
        .join(
            post_tags,
            Post.id == post_tags.c.post_id
        )
        .join(
            Tag,
            Tag.id == post_tags.c.tag_id
        )
        .filter(
            # Sadece yayınlanmış yazılar
            Post.status == "published",

            # Etiket adında arama
            Tag.name.ilike(f"%{tag}%")
        )
        .distinct()
        .all()
    )

    return posts
# ==================================================
# KATEGORİYE GÖRE POST ARA
# ==================================================

@router.get(
    "/categories",
    response_model=list[PostResponse]
)
def search_posts_by_category(
    category: str = Query(
        ...,
        min_length=1,
        description="Aranacak kategori adı"
    ),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # POST VE CATEGORY TABLOLARINI BİRLEŞTİR
    # --------------------------------------------------
    #
    # Post.category_id → Category.id
    #
    # Böylece kategori adına göre
    # postları bulabiliyoruz.
    # --------------------------------------------------

    posts = (
        db.query(Post)

        # Post ile Category tablosunu birleştir.
        .join(
            Category,
            Post.category_id == Category.id
        )

        .filter(

            # Sadece yayınlanmış postları getir.
            Post.status == "published",

            # Kategori adında arama yap.
            #
            # Örneğin:
            # category = "backend"
            #
            # Backend
            # Backend Development
            #
            # gibi sonuçları bulabilir.
            Category.name.ilike(
                f"%{category}%"
            )
        )

        .all()
    )

    return posts
# ==================================================
# GELİŞMİŞ POST ARAMA
# ==================================================

@router.get(
    "/advanced",
    response_model=list[PostResponse]
)
def advanced_search(
    q: str | None = Query(
        None,
        description="Başlık veya içerikte aranacak kelime"
    ),

    category_id: int | None = Query(
        None,
        description="Kategori ID"
    ),

    tag_id: int | None = Query(
        None,
        description="Etiket ID"
    ),

    author_id: int | None = Query(
        None,
        description="Yazar ID"
    ),

    sort: str = Query(
        "newest",
        description="newest veya oldest"
    ),

    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # TEMEL QUERY
    # --------------------------------------------------

    query = db.query(Post).filter(
        Post.status == "published"
    )

    # --------------------------------------------------
    # BAŞLIK / İÇERİK ARAMA
    # --------------------------------------------------

    if q:
        query = query.filter(
            or_(
                Post.title.ilike(f"%{q}%"),
                Post.content.ilike(f"%{q}%")
            )
        )

    # --------------------------------------------------
    # KATEGORİ FİLTRESİ
    # --------------------------------------------------

    if category_id is not None:
        query = query.filter(
            Post.category_id == category_id
        )

    # --------------------------------------------------
    # YAZAR FİLTRESİ
    # --------------------------------------------------

    if author_id is not None:
        query = query.filter(
            Post.owner_id == author_id
        )

    # --------------------------------------------------
    # ETİKET FİLTRESİ
    # --------------------------------------------------

    if tag_id is not None:

        query = (
            query
            .join(
                post_tags,
                Post.id == post_tags.c.post_id
            )
            .filter(
                post_tags.c.tag_id == tag_id
            )
        )

    # --------------------------------------------------
    # SIRALAMA
    # --------------------------------------------------

    if sort == "oldest":

        query = query.order_by(
            Post.created_at.asc()
        )

    else:

        # Varsayılan:
        # En yeni yazılar önce gelir.
        query = query.order_by(
            Post.created_at.desc()
        )

    # --------------------------------------------------
    # SONUÇLARI GETİR
    # --------------------------------------------------

    posts = query.distinct().all()

    return posts