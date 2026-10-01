# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

from pydantic import BaseModel
from datetime import datetime


# ==================================================
# FAVORITE RESPONSE
# ==================================================

class FavoriteResponse(BaseModel):

    id: int

    user_id: int

    post_id: int

    created_at: datetime

    class Config:
        from_attributes = True