# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment

# Normal kullanıcı kontrolü değil,
# ADMIN kontrolü yapacağız.
from app.auth import get_current_admin
from app.schemas.admin import UserRoleUpdate


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# ==================================================
# TÜM KULLANICILARI GETİR
# ==================================================

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),

    # Bu satır sayesinde endpoint'e sadece
    # role = "admin" olan kullanıcı girebilir.
    current_admin: User = Depends(get_current_admin)
):

    # Veritabanındaki bütün kullanıcıları getir.
    users = db.query(User).all()

    # Şifre gibi hassas bilgileri kesinlikle
    # response içerisinde döndürmüyoruz.
    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
        for user in users
    ]
# ==================================================
# TEK BİR KULLANICIYI GETİR
# ==================================================

@router.get("/users/{user_id}")
def get_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    # --------------------------------------------------
    # KULLANICIYI VERİTABANINDA BUL
    # --------------------------------------------------

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    # --------------------------------------------------
    # KULLANICI YOKSA
    # --------------------------------------------------

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı."
        )

    # --------------------------------------------------
    # KULLANICI BİLGİLERİNİ DÖNDÜR
    # --------------------------------------------------
    #
    # hashed_password özellikle dönmüyoruz.
    # Admin olsa bile parola hash'ini API response'una
    # koymamıza gerek yok.
    # --------------------------------------------------

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    }
# ==================================================
# KULLANICI ROLÜNÜ DEĞİŞTİR
# ==================================================

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    # --------------------------------------------------
    # KULLANICIYI BUL
    # --------------------------------------------------

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı."
        )


    # --------------------------------------------------
    # KENDİ ADMIN YETKİSİNİ KALDIRMASINI ENGELLE
    # --------------------------------------------------
    #
    # Örneğin tugce2 admin olarak giriş yaptıysa
    # yanlışlıkla kendi rolünü "user" yapmasın.
    # --------------------------------------------------

    if (
        user.id == current_admin.id
        and role_data.role != "admin"
    ):
        raise HTTPException(
            status_code=400,
            detail="Kendi admin yetkinizi kaldıramazsınız."
        )


    # --------------------------------------------------
    # ROLÜ GÜNCELLE
    # --------------------------------------------------

    user.role = role_data.role

    db.commit()
    db.refresh(user)


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return {
        "message": "Kullanıcı rolü başarıyla güncellendi.",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
    }
# ==================================================
# ADMIN - KULLANICI SİL
# ==================================================

@router.delete("/users/{user_id}")
def delete_user_by_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    # --------------------------------------------------
    # SİLİNECEK KULLANICIYI BUL
    # --------------------------------------------------

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı."
        )


    # --------------------------------------------------
    # ADMIN KENDİ HESABINI SİLEMEZ
    # --------------------------------------------------

    if user.id == current_admin.id:
        raise HTTPException(
            status_code=400,
            detail="Admin kendi hesabını silemez."
        )


    # --------------------------------------------------
    # KULLANICIYI SİL
    # --------------------------------------------------

    db.delete(user)
    db.commit()


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return {
        "message": "Kullanıcı başarıyla silindi.",
        "deleted_user": {
            "id": user.id,
            "username": user.username
        }
    }
# ==================================================
# ADMIN - TÜM BLOGLARI GETİR
# ==================================================

@router.get("/posts")
def get_all_posts_by_admin(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    # --------------------------------------------------
    # TÜM POSTLARI GETİR
    # --------------------------------------------------
    #
    # Burada status filtresi kullanmıyoruz.
    #
    # Bu yüzden admin:
    #
    # published → yayınlanmış
    # draft     → taslak
    # archived  → arşivlenmiş
    #
    # bütün yazıları görebilir.
    # --------------------------------------------------

    posts = db.query(Post).all()


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return [
        {
            "id": post.id,
            "title": post.title,
            "owner_id": post.owner_id,
            "status": post.status,
            "created_at": post.created_at,
            "updated_at": post.updated_at
        }
        for post in posts
    ]
# ==================================================
# ADMIN - TEK BİR BLOG YAZISINI GETİR
# ==================================================

@router.get("/posts/{post_id}")
def get_post_by_admin(
    post_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    # İstenen postu bul
    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    # Post yoksa 404
    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # Admin postun detaylarını görebilir
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "owner_id": post.owner_id,
        "status": post.status,
        "category_id": post.category_id,
        "reading_time": post.reading_time,
        "published_at": post.published_at,
        "scheduled_at": post.scheduled_at,
        "created_at": post.created_at,
        "updated_at": post.updated_at
    }
# ==================================================
# ADMIN - BLOG YAZISI SİL
# ==================================================

@router.delete("/posts/{post_id}")
def delete_post_by_admin(
    post_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

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


    # Silmeden önce response için bilgileri saklıyoruz.
    deleted_post_id = post.id
    deleted_post_title = post.title


    # --------------------------------------------------
    # POSTU SİL
    # --------------------------------------------------

    db.delete(post)
    db.commit()


    return {
        "message": "Blog yazısı admin tarafından silindi.",
        "deleted_post": {
            "id": deleted_post_id,
            "title": deleted_post_title
        }
    }
# ==================================================
# ADMIN - TÜM YORUMLARI GETİR
# ==================================================

@router.get("/comments")
def get_all_comments_by_admin(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    comments = db.query(Comment).all()

    return [
        {
            "id": comment.id,
            "content": comment.content,
            "owner_id": comment.owner_id,
            "post_id": comment.post_id,
            "parent_id": comment.parent_id
        }
        for comment in comments
    ]
# ==================================================
# ADMIN - YORUM SİL
# ==================================================

@router.delete("/comments/{comment_id}")
def delete_comment_by_admin(
    comment_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):

    # --------------------------------------------------
    # YORUMU BUL
    # --------------------------------------------------

    comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()

    if comment is None:
        raise HTTPException(
            status_code=404,
            detail="Yorum bulunamadı."
        )


    # Response'ta kullanmak için bilgileri
    # silmeden önce saklıyoruz.
    deleted_comment_id = comment.id
    deleted_comment_content = comment.content


    # --------------------------------------------------
    # YORUMU SİL
    # --------------------------------------------------

    db.delete(comment)
    db.commit()


    return {
        "message": "Yorum admin tarafından silindi.",
        "deleted_comment": {
            "id": deleted_comment_id,
            "content": deleted_comment_content
        }
    }