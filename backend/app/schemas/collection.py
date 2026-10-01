# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ==================================================
# KOLEKSİYON OLUŞTURMA
# ==================================================

class CollectionCreate(BaseModel):

    # Koleksiyon adı zorunlu
    #
    # Örnek:
    # Backend
    # Python
    # Daha Sonra Okunacaklar
    name: str

    # Açıklama zorunlu değil
    description: Optional[str] = None


# ==================================================
# KOLEKSİYON GÜNCELLEME
# ==================================================

class CollectionUpdate(BaseModel):

    # Kullanıcı sadece istediği alanı
    # değiştirebilir.

    name: Optional[str] = None

    description: Optional[str] = None


# ==================================================
# KOLEKSİYON RESPONSE
# ==================================================

class CollectionResponse(BaseModel):

    id: int

    # Koleksiyonun sahibi
    user_id: int

    name: str

    description: Optional[str] = None

    created_at: datetime

    class Config:
        from_attributes = True