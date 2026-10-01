 # ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db

from app.models.post import Post
from app.models.comment import Comment
from app.models.like import Like
from app.models.follow import Follow
from app.models.user import User
from datetime import datetime, timedelta
from app.models.post_view import PostView

from app.auth import get_current_user


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# ==================================================
# GENEL DASHBOARD İSTATİSTİKLERİ
# ==================================================

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # TOPLAM POST SAYISI
    # --------------------------------------------------

    total_posts = db.query(Post).filter(
        Post.owner_id == current_user.id
    ).count()


    # --------------------------------------------------
    # YAYINLANMIŞ POST SAYISI
    # --------------------------------------------------

    published_posts = db.query(Post).filter(
        Post.owner_id == current_user.id,
        Post.status == "published"
    ).count()


    # --------------------------------------------------
    # TASLAK POST SAYISI
    # --------------------------------------------------

    draft_posts = db.query(Post).filter(
        Post.owner_id == current_user.id,
        Post.status == "draft"
    ).count()


    # --------------------------------------------------
    # KULLANICININ POSTLARINA GELEN TOPLAM BEĞENİ
    # --------------------------------------------------

    total_likes = (
        db.query(func.count(Like.id))
        .join(
            Post,
            Like.post_id == Post.id
        )
        .filter(
            Post.owner_id == current_user.id
        )
        .scalar()
    )


    # --------------------------------------------------
    # KULLANICININ POSTLARINA GELEN TOPLAM YORUM
    # --------------------------------------------------

    total_comments = (
        db.query(func.count(Comment.id))
        .join(
            Post,
            Comment.post_id == Post.id
        )
        .filter(
            Post.owner_id == current_user.id
        )
        .scalar()
    )


    # --------------------------------------------------
    # TAKİPÇİ SAYISI
    # --------------------------------------------------

    followers = db.query(Follow).filter(
        Follow.following_id == current_user.id
    ).count()


    # --------------------------------------------------
    # TAKİP EDİLEN KİŞİ SAYISI
    # --------------------------------------------------

    following = db.query(Follow).filter(
        Follow.follower_id == current_user.id
    ).count()


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return {
        "user_id": current_user.id,
        "total_posts": total_posts,
        "published_posts": published_posts,
        "draft_posts": draft_posts,
        "total_likes": total_likes or 0,
        "total_comments": total_comments or 0,
        "followers": followers,
        "following": following
    }
# ==================================================
# EN ÇOK BEĞENİLEN YAZILAR
# ==================================================

@router.get("/top-posts")
def get_top_posts(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # KULLANICININ EN ÇOK BEĞENİLEN POSTLARINI BUL
    # --------------------------------------------------
    #
    # Burada:
    #
    # 1. Kullanıcının kendi postlarını alıyoruz.
    # 2. Her postun Like kayıtlarını sayıyoruz.
    # 3. Beğeni sayısına göre büyükten küçüğe sıralıyoruz.
    # 4. İlk "limit" kadar sonucu getiriyoruz.
    #
    # Örneğin:
    #
    # Post A → 15 like
    # Post B → 8 like
    # Post C → 3 like
    #
    # şeklinde sıralanacak.
    # --------------------------------------------------

    top_posts = (
        db.query(
            Post.id,
            Post.title,
            func.count(Like.id).label("like_count")
        )

        # LEFT OUTER JOIN kullanıyoruz.
        #
        # Böylece hiç beğenisi olmayan postlar da
        # sonuçlara dahil olabilir.
        .outerjoin(
            Like,
            Like.post_id == Post.id
        )

        # Sadece giriş yapan kullanıcının postları.
        .filter(
            Post.owner_id == current_user.id
        )

        # Her post için ayrı like sayısı hesaplanacak.
        .group_by(
            Post.id,
            Post.title
        )

        # Like sayısı yüksek olan önce gelsin.
        .order_by(
            func.count(Like.id).desc()
        )

        # Kaç tane post gösterilecek?
        .limit(limit)

        .all()
    )


    # --------------------------------------------------
    # RESPONSE HAZIRLA
    # --------------------------------------------------

    result = []

    for post in top_posts:

        result.append({
            "post_id": post.id,
            "title": post.title,
            "like_count": post.like_count
        })

    return result
# ==================================================
# SON GELEN YORUMLAR
# ==================================================

@router.get("/recent-comments")
def get_recent_comments(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # KULLANICININ POSTLARINA GELEN
    # EN SON YORUMLARI GETİR
    # --------------------------------------------------

    recent_comments = (
        db.query(
            Comment.id,
            Comment.content,
            Comment.owner_id,
            Comment.post_id,
            Post.title
        )
        .join(
            Post,
            Comment.post_id == Post.id
        )
        .filter(
            Post.owner_id == current_user.id
        )
        .order_by(
            Comment.id.desc()
        )
        .limit(limit)
        .all()
    )

    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return [
        {
            "comment_id": comment.id,
            "content": comment.content,
            "comment_owner_id": comment.owner_id,
            "post_id": comment.post_id,
            "post_title": comment.title
        }
        for comment in recent_comments
    ]
# ==================================================
# OKUNMA / GÖRÜNTÜLENME İSTATİSTİKLERİ
# ==================================================

@router.get("/views")
def get_view_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # ŞU ANKİ ZAMAN
    # --------------------------------------------------

    now = datetime.utcnow()


    # --------------------------------------------------
    # BUGÜNÜN BAŞLANGICI
    # --------------------------------------------------
    #
    # Örneğin:
    #
    # now = 2026-08-13 14:30
    #
    # today_start =
    # 2026-08-13 00:00
    # --------------------------------------------------

    today_start = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )


    # --------------------------------------------------
    # SON 7 GÜN
    # --------------------------------------------------

    week_start = now - timedelta(days=7)


    # --------------------------------------------------
    # SON 30 GÜN
    # --------------------------------------------------

    month_start = now - timedelta(days=30)


    # ==================================================
    # BUGÜNKÜ OKUNMA SAYISI
    # ==================================================

    daily_views = (
        db.query(func.count(PostView.id))
        .join(
            Post,
            PostView.post_id == Post.id
        )
        .filter(
            # Sadece giriş yapan kullanıcının postları
            Post.owner_id == current_user.id,

            # Bugün oluşan view kayıtları
            PostView.viewed_at >= today_start
        )
        .scalar()
    )


    # ==================================================
    # SON 7 GÜNLÜK OKUNMA SAYISI
    # ==================================================

    weekly_views = (
        db.query(func.count(PostView.id))
        .join(
            Post,
            PostView.post_id == Post.id
        )
        .filter(
            Post.owner_id == current_user.id,
            PostView.viewed_at >= week_start
        )
        .scalar()
    )


    # ==================================================
    # SON 30 GÜNLÜK OKUNMA SAYISI
    # ==================================================

    monthly_views = (
        db.query(func.count(PostView.id))
        .join(
            Post,
            PostView.post_id == Post.id
        )
        .filter(
            Post.owner_id == current_user.id,
            PostView.viewed_at >= month_start
        )
        .scalar()
    )


    # ==================================================
    # TOPLAM OKUNMA SAYISI
    # ==================================================

    total_views = (
        db.query(func.count(PostView.id))
        .join(
            Post,
            PostView.post_id == Post.id
        )
        .filter(
            Post.owner_id == current_user.id
        )
        .scalar()
    )


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return {
        "daily_views": daily_views or 0,
        "weekly_views": weekly_views or 0,
        "monthly_views": monthly_views or 0,
        "total_views": total_views or 0
    }
# ==================================================
# EN ÇOK OKUNAN / GÖRÜNTÜLENEN YAZILAR
# ==================================================

@router.get("/top-viewed-posts")
def get_top_viewed_posts(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # KULLANICININ POSTLARINI VIEW SAYISINA GÖRE
    # SIRALIYORUZ
    # --------------------------------------------------

    top_posts = (
        db.query(
            Post.id,
            Post.title,
            func.count(PostView.id).label("view_count")
        )

        # LEFT JOIN kullanıyoruz.
        #
        # Böylece henüz hiç görüntülenmemiş postlar da
        # sonuçlarda yer alabilir.
        .outerjoin(
            PostView,
            PostView.post_id == Post.id
        )

        # Sadece giriş yapan kullanıcının postları
        .filter(
            Post.owner_id == current_user.id
        )

        # Her post için ayrı view sayısı hesapla
        .group_by(
            Post.id,
            Post.title
        )

        # En çok görüntülenen önce gelsin
        .order_by(
            func.count(PostView.id).desc()
        )

        # En fazla kaç post getirilecek?
        .limit(limit)

        .all()
    )


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return [
        {
            "post_id": post.id,
            "title": post.title,
            "view_count": post.view_count
        }
        for post in top_posts
    ]
# ==================================================
# POST PERFORMANS İSTATİSTİKLERİ
# ==================================================

@router.get("/post-performance")
def get_post_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # GİRİŞ YAPAN KULLANICININ POSTLARINI GETİR
    # --------------------------------------------------

    posts = db.query(Post).filter(
        Post.owner_id == current_user.id
    ).all()


    # --------------------------------------------------
    # HER POST İÇİN İSTATİSTİK HESAPLA
    # --------------------------------------------------

    result = []

    for post in posts:

        # Bu post kaç kere görüntülenmiş?
        view_count = db.query(PostView).filter(
            PostView.post_id == post.id
        ).count()


        # Bu post kaç beğeni almış?
        like_count = db.query(Like).filter(
            Like.post_id == post.id
        ).count()


        # Bu posta kaç yorum yapılmış?
        comment_count = db.query(Comment).filter(
            Comment.post_id == post.id
        ).count()


        # --------------------------------------------------
        # SONUCU LİSTEYE EKLE
        # --------------------------------------------------

        result.append({
            "post_id": post.id,
            "title": post.title,
            "status": post.status,

            "view_count": view_count,
            "like_count": like_count,
            "comment_count": comment_count
        })


    return result