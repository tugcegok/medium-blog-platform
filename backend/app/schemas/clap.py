from pydantic import BaseModel


# ==================================================
# CLAP RESPONSE
# ==================================================
#
# API başarılı bir clap işleminden sonra
# kullanıcıya bu bilgileri döndürecek.
#
# owner_id → Clap atan kullanıcı
# post_id  → Clap atılan yazı
# ==================================================

class ClapResponse(BaseModel):
    id: int
    owner_id: int
    post_id: int

    # SQLAlchemy nesnesini
    # Pydantic modeline çevirmeye izin verir.
    class Config:
        from_attributes = True