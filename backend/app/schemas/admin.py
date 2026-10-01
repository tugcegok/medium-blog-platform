from typing import Literal
from pydantic import BaseModel


# ==================================================
# KULLANICI ROLÜ GÜNCELLEME
# ==================================================

class UserRoleUpdate(BaseModel):

    # Sadece bu iki değer kabul edilir.
    #
    # "user"  → Normal kullanıcı
    # "admin" → Yönetici
    #
    # Örneğin "superadmin", "abc" gibi bir değer
    # gönderilirse Pydantic 422 hatası verir.
    role: Literal["user", "admin"]