from pydantic import BaseModel


# ==================================================
# REPOST RESPONSE
# ==================================================
#
# API'nin kullanıcıya döndüreceği repost bilgileri.
# ==================================================

class RepostResponse(BaseModel):

    # Repost işleminin ID'si
    id: int

    # Repost yapan kullanıcının ID'si
    owner_id: int

    # Repost edilen postun ID'si
    post_id: int

    # SQLAlchemy nesnesini Pydantic modeline
    # dönüştürmeye izin verir.
    class Config:
        from_attributes = True