from pydantic import BaseModel
from typing import Literal
from datetime import datetime


# ==================================================
# REACTION OLUŞTURMA / GÜNCELLEME
# ==================================================

class ReactionCreate(BaseModel):

    # Kullanıcının bırakacağı tepki türü.
    #
    # Sadece aşağıdaki değerlerden biri olabilir:
    #
    # love
    # fire
    # laugh
    # clap

    reaction_type: Literal[
        "love",
        "fire",
        "laugh",
        "clap"
    ]


# ==================================================
# REACTION RESPONSE
# ==================================================

class ReactionResponse(BaseModel):

    id: int
    user_id: int
    post_id: int
    reaction_type: str
    created_at: datetime

    class Config:
        from_attributes = True