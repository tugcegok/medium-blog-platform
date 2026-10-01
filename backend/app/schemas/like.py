# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from pydantic import BaseModel
from datetime import datetime


# ==================================================
# LIKE RESPONSE
# ==================================================

class LikeResponse(BaseModel):

    # Beğeninin ID'si
    id: int

    # Beğeniyi yapan kullanıcı
    user_id: int

    # Beğenilen post
    post_id: int

    # Beğeninin oluşturulma zamanı
    created_at: datetime

    class Config:
        from_attributes = True


# ==================================================
# LIKE COUNT RESPONSE
# ==================================================

class LikeCountResponse(BaseModel):

    # Post ID
    post_id: int

    # Postun toplam beğeni sayısı
    like_count: int