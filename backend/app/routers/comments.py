from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

# Veritabanı bağlantısını almak için
from app.database import get_db

# Veritabanındaki Comment, Post ve User modelleri
from app.models.comment import Comment
from app.models.post import Post
from app.models.user import User
from app.models.notification import Notification

# Yorum oluşturma, güncelleme ve response şemaları
from app.schemas.comment import (
    CommentCreate,
    CommentUpdate,
    CommentResponse
)

# JWT ile giriş yapan mevcut kullanıcıyı almak için
from app.auth import get_current_user


# ==================================================
# ROUTER
# ==================================================

# Bu router'ın bütün endpoint'leri
# /comments ile başlayacak.
#
# Örneğin:
# POST /comments
# GET  /comments/post/1
# PUT  /comments/1
# DELETE /comments/1

router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)


# ==================================================
# YENİ YORUM OLUŞTUR
# ==================================================

@router.post(
    "",
    response_model=CommentResponse
)
def create_comment(
    post_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --------------------------------------------------
    # Önce yorum yapılmak istenen blog yazısının
    # veritabanında olup olmadığını kontrol ediyoruz.
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    # Eğer böyle bir yazı yoksa
    # 404 Not Found döndürüyoruz.
    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # Yeni Comment nesnesi oluşturuyoruz.
    # --------------------------------------------------
    #
    # content:
    # Kullanıcının yazdığı yorum.
    #
    # owner_id:
    # Yorumu yapan kullanıcının ID'si.
    #
    # current_user JWT token sayesinde
    # giriş yapan kullanıcıyı temsil ediyor.
    #
    # post_id:
    # Yorumun hangi blog yazısına ait olduğunu
    # belirtiyor.
    # --------------------------------------------------

    new_comment = Comment(
        content=comment.content,
        owner_id=current_user.id,
        post_id=post_id
    )

    # Yorumu veritabanına ekle
    db.add(new_comment)

    # ==================================================
    # YENİ YORUM BİLDİRİMİ
    # ==================================================
    #
    # Kullanıcı kendi yazısına yorum yaptıysa
    # kendisine bildirim göndermiyoruz.
    # --------------------------------------------------

    if post.owner_id != current_user.id:

        notification = Notification(
            # Bildirimi post sahibi alır
            user_id=post.owner_id,

            # Yorumu yapan kullanıcı
            actor_id=current_user.id,

            notification_type="comment",

            message=(
                f"{current_user.username} "
                "yazınıza yorum yaptı."
            ),

            # Hangi yazıyla ilgili?
            post_id=post.id
        )

        db.add(notification)

    # Değişiklikleri kaydet
    db.commit()

    # Veritabanının oluşturduğu ID gibi bilgileri
    # nesneye tekrar yükle
    db.refresh(new_comment)

    # Oluşturulan yorumu response olarak döndür
    return new_comment


# ==================================================
# BİR YAZININ TÜM YORUMLARINI GETİR
# ==================================================

@router.get(
    "/post/{post_id}",
    response_model=list[CommentResponse]
)
def get_post_comments(
    post_id: int,
    db: Session = Depends(get_db)
):
    # --------------------------------------------------
    # Önce ilgili blog yazısının var olup olmadığını
    # kontrol ediyoruz.
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
    # Sadece bu yazıya ait yorumları getiriyoruz.
    #
    # Örneğin:
    #
    # /comments/post/1
    #
    # → post_id'si 1 olan yorumlar gelir.
    # --------------------------------------------------

    comments = db.query(Comment).filter(
        Comment.post_id == post_id
    ).all()

    # Yorum listesini döndür
    return comments


# ==================================================
# YORUM GÜNCELLE
# ==================================================

@router.put(
    "/{comment_id}",
    response_model=CommentResponse
)
def update_comment(
    comment_id: int,
    updated_comment: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --------------------------------------------------
    # Güncellenmek istenen yorumu buluyoruz.
    # --------------------------------------------------

    comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()

    # Yorum bulunamazsa 404 döndür.
    if comment is None:
        raise HTTPException(
            status_code=404,
            detail="Yorum bulunamadı."
        )

    # --------------------------------------------------
    # GÜVENLİK KONTROLÜ
    # --------------------------------------------------
    #
    # Sadece yorumu yazan kullanıcı
    # kendi yorumunu güncelleyebilir.
    #
    # Örneğin:
    #
    # comment.owner_id = 9
    # current_user.id = 5
    #
    # 9 != 5 olduğu için
    # bu kullanıcı yorumu güncelleyemez.
    # --------------------------------------------------

    if comment.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yorumu güncelleme yetkiniz yok."
        )

    # --------------------------------------------------
    # Yorumun içeriğini güncelliyoruz.
    # --------------------------------------------------

    comment.content = updated_comment.content

    # Değişikliği veritabanına kaydet
    db.commit()

    # Güncel veriyi tekrar veritabanından yükle
    db.refresh(comment)

    # Güncellenmiş yorumu döndür
    return comment


# ==================================================
# YORUM SİL
# ==================================================

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --------------------------------------------------
    # Silinmek istenen yorumu buluyoruz.
    # --------------------------------------------------

    comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()

    # Yorum bulunamazsa 404 döndür.
    if comment is None:
        raise HTTPException(
            status_code=404,
            detail="Yorum bulunamadı."
        )

    # --------------------------------------------------
    # GÜVENLİK KONTROLÜ
    # --------------------------------------------------
    #
    # Yorumu sadece yazan kişi silebilir.
    # --------------------------------------------------

    if comment.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yorumu silme yetkiniz yok."
        )

    # Yorumu veritabanından sil
    db.delete(comment)

    # Değişikliği kaydet
    db.commit()

    # Başarılı mesajı döndür
    return {
        "message": "Yorum başarıyla silindi."
    }
# ==================================================
# YORUMA CEVAP VER
# ==================================================

@router.post(
    "/{comment_id}/reply",
    response_model=CommentResponse
)
def reply_to_comment(
    comment_id: int,
    reply: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # CEVAP VERİLECEK YORUMU BUL
    # --------------------------------------------------
    #
    # Örneğin:
    #
    # comment_id = 5
    #
    # Kullanıcı 5 numaralı yoruma cevap vermek istiyor.
    # --------------------------------------------------

    parent_comment = db.query(Comment).filter(
        Comment.id == comment_id
    ).first()


    # --------------------------------------------------
    # YORUM VAR MI?
    # --------------------------------------------------

    if parent_comment is None:
        raise HTTPException(
            status_code=404,
            detail="Cevap verilecek yorum bulunamadı."
        )


    # --------------------------------------------------
    # YENİ CEVAP OLUŞTUR
    # --------------------------------------------------
    #
    # Burada önemli nokta:
    #
    # post_id
    # → Ana yorum hangi posta aitse cevap da
    #   otomatik olarak aynı posta ait olacak.
    #
    # parent_id
    # → Hangi yoruma cevap verdiğimizi tutacak.
    # --------------------------------------------------

    new_reply = Comment(

        # Kullanıcının yazdığı cevap
        content=reply.content,

        # JWT'den giriş yapan kullanıcı
        owner_id=current_user.id,

        # Ana yorum hangi posta aitse
        # cevap da aynı posta ait
        post_id=parent_comment.post_id,

        # Cevap verilen yorum
        parent_id=parent_comment.id
    )


    # --------------------------------------------------
    # VERİTABANINA KAYDET
    # --------------------------------------------------

    db.add(new_reply)

        # ==================================================
    # YENİ CEVAP BİLDİRİMİ
    # ==================================================
    #
    # Kullanıcı kendi yorumuna cevap verdiyse
    # kendisine bildirim göndermiyoruz.
    # --------------------------------------------------

    if parent_comment.owner_id != current_user.id:

        notification = Notification(
            # Bildirimi ana yorumun sahibi alır
            user_id=parent_comment.owner_id,

            # Cevabı yazan kullanıcı
            actor_id=current_user.id,

            notification_type="reply",

            message=(
                f"{current_user.username} "
                "yorumunuza cevap verdi."
            ),

            # Cevabın ait olduğu post
            post_id=parent_comment.post_id
        )

        db.add(notification)

    db.commit()

    db.refresh(new_reply)


    # --------------------------------------------------
    # CEVABI DÖNDÜR
    # --------------------------------------------------

    return new_reply