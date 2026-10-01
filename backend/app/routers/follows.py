# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

# FastAPI'den gerekli yapılar
from fastapi import APIRouter, Depends, HTTPException

# Veritabanı oturumu
from sqlalchemy.orm import Session

# Veritabanı bağlantısı
from app.database import get_db

# Modeller
from app.models.follow import Follow
from app.models.user import User
from app.models.notification import Notification

# Giriş yapan kullanıcıyı bulmak için
from app.auth import get_current_user


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/follows",
    tags=["Follows"]
)


# ==================================================
# KULLANICIYI TAKİP ET
# ==================================================

@router.post("/{user_id}")
def follow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # TAKİP EDİLECEK KULLANICI VAR MI?
    # --------------------------------------------------

    target_user = db.query(User).filter(
        User.id == user_id
    ).first()

    if target_user is None:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı."
        )


    # --------------------------------------------------
    # KULLANICI KENDİSİNİ TAKİP EDEMEZ
    # --------------------------------------------------

    if target_user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Kendinizi takip edemezsiniz."
        )


    # --------------------------------------------------
    # DAHA ÖNCE TAKİP EDİLMİŞ Mİ?
    # --------------------------------------------------

    existing_follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()

    if existing_follow:
        raise HTTPException(
            status_code=400,
            detail="Bu kullanıcıyı zaten takip ediyorsunuz."
        )


    # --------------------------------------------------
    # YENİ TAKİP KAYDI OLUŞTUR
    # --------------------------------------------------
    #
    # follower_id:
    # Takip eden kişi
    #
    # following_id:
    # Takip edilen kişi
    # --------------------------------------------------

    new_follow = Follow(
        follower_id=current_user.id,
        following_id=user_id
    )

    db.add(new_follow)


    # ==================================================
    # YENİ TAKİPÇİ BİLDİRİMİ OLUŞTUR
    # ==================================================
    #
    # Örnek:
    #
    # Tuğçe → Ahmet'i takip ediyor.
    #
    # current_user = Tuğçe
    # target_user  = Ahmet
    #
    # user_id
    # → Bildirimi ALACAK kişi = Ahmet
    #
    # actor_id
    # → Bildirimi TETİKLEYEN kişi = Tuğçe
    # ==================================================

    notification = Notification(

        # Bildirimi takip edilen kullanıcı alır.
        user_id=target_user.id,

        # Takip işlemini yapan kullanıcı.
        actor_id=current_user.id,

        # Bildirimin türü.
        notification_type="follow",

        # Kullanıcıya gösterilecek mesaj.
        message=(
            f"{current_user.username} "
            "sizi takip etmeye başladı."
        ),

        # Takip bildirimi herhangi bir
        # blog yazısına bağlı değildir.
        post_id=None
    )

    db.add(notification)


    # --------------------------------------------------
    # VERİTABANINA KAYDET
    # --------------------------------------------------
    #
    # Hem Follow hem Notification aynı işlem
    # içerisinde kaydediliyor.
    # --------------------------------------------------

    db.commit()

    db.refresh(new_follow)
    db.refresh(notification)


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return {
        "message": "Kullanıcı takip edildi."
    }


# ==================================================
# TAKİPTEN ÇIK
# ==================================================

@router.delete("/{user_id}")
def unfollow_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # TAKİP KAYDINI BUL
    # --------------------------------------------------

    follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()

    if follow is None:
        raise HTTPException(
            status_code=404,
            detail="Bu kullanıcıyı takip etmiyorsunuz."
        )


    # --------------------------------------------------
    # TAKİP KAYDINI SİL
    # --------------------------------------------------

    db.delete(follow)

    db.commit()

    return {
        "message": "Takipten çıkıldı."
    }


# ==================================================
# TAKİPÇİ SAYISINI GETİR
# ==================================================

@router.get("/{user_id}/followers")
def get_followers(
    user_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # KULLANICI VAR MI?
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
    # KULLANICIYI TAKİP EDENLERİ BUL
    # --------------------------------------------------

    followers = db.query(Follow).filter(
        Follow.following_id == user_id
    ).all()

    return {
        "user_id": user_id,
        "follower_count": len(followers)
    }


# ==================================================
# TAKİP EDİLEN KİŞİ SAYISINI GETİR
# ==================================================

@router.get("/{user_id}/following")
def get_following(
    user_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # KULLANICI VAR MI?
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
    # KULLANICININ TAKİP ETTİĞİ KİŞİLERİ BUL
    # --------------------------------------------------

    following = db.query(Follow).filter(
        Follow.follower_id == user_id
    ).all()

    return {
        "user_id": user_id,
        "following_count": len(following)
    }