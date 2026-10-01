from pydantic import BaseModel
from typing import Optional


# --------------------------------------------------
# Yorum Oluşturma
# --------------------------------------------------

class CommentCreate(BaseModel):
    content: str


# --------------------------------------------------
# Yorum Güncelleme
# --------------------------------------------------

class CommentUpdate(BaseModel):
    content: str


# --------------------------------------------------
# API'nin Kullanıcıya Döndüreceği Yorum
# --------------------------------------------------

class CommentResponse(BaseModel):

    id: int

    content: str

    owner_id: int

    post_id: int

    # Eğer ana yorum ise None olur.
    # Eğer başka yoruma cevap ise
    # cevap verilen yorumun ID'si gelir.
    parent_id: Optional[int] = None

    # SQLAlchemy nesnesini Pydantic'e
    # çevirmeye izin verir.
    class Config:
        from_attributes = True