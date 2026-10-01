from pydantic import BaseModel
from typing import Optional


# ==================================================
# KATEGORİ OLUŞTURMA
# ==================================================

class CategoryCreate(BaseModel):

    # Kategori adı
    name: str

    # Kategori açıklaması
    description: Optional[str] = None

    # Eğer bu kategori başka bir kategorinin altındaysa
    # üst kategorinin ID'sini burada tutacağız.
    parent_id: Optional[int] = None


# ==================================================
# KATEGORİ GÜNCELLEME
# ==================================================

class CategoryUpdate(BaseModel):

    # Kullanıcı sadece değiştirmek istediği
    # alanları gönderebilir.
    name: Optional[str] = None

    description: Optional[str] = None

    parent_id: Optional[int] = None


# ==================================================
# API'NİN KULLANICIYA DÖNDÜRECEĞİ KATEGORİ
# ==================================================

class CategoryResponse(BaseModel):

    id: int

    name: str

    description: Optional[str] = None

    parent_id: Optional[int] = None

    class Config:
        from_attributes = True