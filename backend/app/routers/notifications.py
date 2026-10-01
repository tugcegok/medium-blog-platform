# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db

from app.models.notification import Notification
from app.models.user import User

from app.schemas.notification import (
    NotificationResponse,
    SystemNotificationCreate

)

from app.auth import get_current_user


# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ==================================================
# BİLDİRİMLERİMİ GETİR
# ==================================================

@router.get(
    "",
    response_model=list[NotificationResponse]
)
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Sadece giriş yapan kullanıcıya ait
    # bildirimleri getir.
    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id
        )
        # En yeni bildirim en üstte görünsün.
        .order_by(
            desc(Notification.created_at)
        )
        .all()
    )

    return notifications


# ==================================================
# OKUNMAMIŞ BİLDİRİM SAYISI
# ==================================================

@router.get("/unread-count")
def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Kullanıcının is_read=False olan
    # bildirimlerini say.
    unread_count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .count()
    )

    return {
        "unread_count": unread_count
    }


# ==================================================
# TEK BİLDİRİMİ OKUNDU OLARAK İŞARETLE
# ==================================================

@router.put(
    "/{notification_id}/read",
    response_model=NotificationResponse
)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Bildirimi bul.
    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Bildirim bulunamadı."
        )

    # --------------------------------------------------
    # GÜVENLİK KONTROLÜ
    # --------------------------------------------------
    #
    # Kullanıcı başka bir kullanıcının
    # bildirimini okuyamaz/değiştiremez.
    # --------------------------------------------------

    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu bildirim üzerinde işlem yapma yetkiniz yok."
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


# ==================================================
# TÜM BİLDİRİMLERİ OKUNDU YAP
# ==================================================

@router.put("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Sadece okunmamış bildirimleri bul.
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).all()

    # Hepsini okundu yap.
    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "message": "Tüm bildirimler okundu olarak işaretlendi.",
        "updated_count": len(notifications)
    }


# ==================================================
# BİLDİRİM SİL
# ==================================================

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    notification = db.query(Notification).filter(
        Notification.id == notification_id
    ).first()

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Bildirim bulunamadı."
        )

    # Sadece bildirimin sahibi silebilir.
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu bildirimi silme yetkiniz yok."
        )

    db.delete(notification)
# ==================================================
# SİSTEM BİLDİRİMİ OLUŞTUR
# ==================================================

@router.post(
    "/system",
    response_model=NotificationResponse
)
def create_system_notification(
    notification_data: SystemNotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # HEDEF KULLANICI BELİRLENDİ Mİ?
    # --------------------------------------------------

    if notification_data.user_id is None:
        raise HTTPException(
            status_code=400,
            detail="Sistem bildirimi için kullanıcı ID gereklidir."
        )

    # --------------------------------------------------
    # KULLANICI VAR MI?
    # --------------------------------------------------

    target_user = db.query(User).filter(
        User.id == notification_data.user_id
    ).first()

    if target_user is None:
        raise HTTPException(
            status_code=404,
            detail="Kullanıcı bulunamadı."
        )

    # --------------------------------------------------
    # SİSTEM BİLDİRİMİ OLUŞTUR
    # --------------------------------------------------

    notification = Notification(
        # Bildirimi alacak kişi
        user_id=target_user.id,

        # Sistem bildirimlerinde actor yok
        actor_id=None,

        notification_type="system",

        message=notification_data.message,

        # Herhangi bir posta bağlı değil
        post_id=None
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification
