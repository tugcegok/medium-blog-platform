from pydantic import BaseModel
from typing import Optional


# ==================================================
# TAG OLUŞTURMA
# ==================================================

class TagCreate(BaseModel):

    # Etiket adı
    name: str


# ==================================================
# TAG GÜNCELLEME
# ==================================================

class TagUpdate(BaseModel):

    # Etiket adı isteğe bağlı güncellenebilir
    name: Optional[str] = None


# ==================================================
# API'NİN DÖNDÜRECEĞİ TAG
# ==================================================

class TagResponse(BaseModel):

    id: int

    name: str

    slug: str

    class Config:
        from_attributes = True