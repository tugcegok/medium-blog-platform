# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

import os
from dotenv import load_dotenv


# ==================================================
# .ENV DOSYASINI YÜKLE
# ==================================================

load_dotenv()


# ==================================================
# DATABASE AYARLARI
# ==================================================

DATABASE_URL = os.getenv("DATABASE_URL")


# ==================================================
# JWT AYARLARI
# ==================================================

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv("ALGORITHM")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
)


# ==================================================
# PASSWORD RESET TOKEN
# ==================================================

PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_MINUTES")
)


# ==================================================
# REFRESH TOKEN
# ==================================================

REFRESH_TOKEN_EXPIRE_DAYS = 7


# ==================================================
# RESEND
# ==================================================

RESEND_API_KEY = os.getenv("RESEND_API_KEY")