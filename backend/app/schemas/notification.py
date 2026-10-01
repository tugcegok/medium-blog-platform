from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


# ==================================================
# NOTIFICATION RESPONSE
# ==================================================

class NotificationResponse(BaseModel):

    id: int

    # Bildirimi alan kullanıcı
    user_id: int

    # Bildirimi tetikleyen kullanıcı
    # Sistem bildirimlerinde None olabilir
    actor_id: Optional[int] = None

    # Bildirim türü
    notification_type: Literal[
        "follow",
        "comment",
        "like",
        "reply",
        "system"
    ]

    # Kullanıcıya gösterilecek mesaj
    message: str

    # Bildirim bir yazıyla ilgiliyse post ID
    post_id: Optional[int] = None

    # Okundu / okunmadı bilgisi
    is_read: bool

    # Oluşturulma zamanı
    created_at: datetime

    class Config:
        from_attributes = True


# ==================================================
# SYSTEM NOTIFICATION CREATE
# ==================================================
#
# Sistem bildirimi oluştururken kullanacağız.
# Örneğin admin:
#
# "Bakım çalışması yapılacaktır."
# ==================================================

class SystemNotificationCreate(BaseModel):

    message: str

    # İstersen belirli bir kullanıcıya gönderebiliriz.
    # None ise ileride tüm kullanıcılara gönderme
    # mantığı eklenebilir.
    user_id: Optional[int] = None