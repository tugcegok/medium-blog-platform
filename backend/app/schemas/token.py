from pydantic import BaseModel


# ==================================================
# TOKEN RESPONSE
# ==================================================

class Token(BaseModel):

    # API isteklerinde kullanılacak Access Token
    access_token: str

    # Token türü
    token_type: str

    # Access Token süresi dolduğunda
    # yeni Access Token almak için kullanılacak Refresh Token
    refresh_token: str


# ==================================================
# REFRESH TOKEN REQUEST
# ==================================================

class RefreshTokenRequest(BaseModel):

    # Kullanıcının gönderdiği Refresh Token
    refresh_token: str