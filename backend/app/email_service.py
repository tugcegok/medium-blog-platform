# ==================================================
# GEREKLİ IMPORTLAR
# ==================================================

# Resend servisini kullanmak için
import resend

# .env içindeki RESEND_API_KEY değerini
# config.py üzerinden alıyoruz.
from app.config import RESEND_API_KEY


# ==================================================
# RESEND API KEY AYARI
# ==================================================

# Resend hesabımızdan aldığımız API key'i
# burada Resend kütüphanesine tanıtıyoruz.
#
# API key doğrudan bu dosyaya yazılmıyor.
# .env → config.py → email_service.py
# şeklinde geliyor.

resend.api_key = RESEND_API_KEY


# ==================================================
# FRONTEND URL
# ==================================================

# Email doğrulama ve şifre sıfırlama linkleri
# backend endpoint'ine değil frontend sayfalarına
# yönlendirilmelidir.

FRONTEND_URL = "http://localhost:3000"


# ==================================================
# EMAIL DOĞRULAMA MAILİ GÖNDER
# ==================================================

def send_verification_email(
    email: str,
    verification_token: str
):
    """
    Kullanıcının email adresini doğrulaması için
    doğrulama maili gönderir.
    """

    # --------------------------------------------------
    # DOĞRULAMA LİNKİ
    # --------------------------------------------------
    #
    # Kullanıcı maildeki linke tıkladığında
    # frontend verify-email sayfasına gider.
    #
    # Frontend URL'den token'ı alır ve:
    #
    # GET /users/verify-email?token=...
    #
    # endpoint'ine istek gönderir.
    # --------------------------------------------------

    verification_link = (
        f"{FRONTEND_URL}/verify-email"
        f"?token={verification_token}"
    )

    # --------------------------------------------------
    # MAIL İÇERİĞİ
    # --------------------------------------------------

    html_content = f"""
    <html>
        <body>

            <h2>Mindscape</h2>

            <p>
                Merhaba,
            </p>

            <p>
                Hesabınızı kullanmaya devam etmek için
                email adresinizi doğrulamanız gerekiyor.
            </p>

            <p>
                Aşağıdaki bağlantıya tıklayarak
                email adresinizi doğrulayabilirsiniz:
            </p>

            <p>
                <a href="{verification_link}">
                    Email Adresimi Doğrula
                </a>
            </p>

            <p>
                Eğer bu hesabı siz oluşturmadıysanız
                bu emaili dikkate almayabilirsiniz.
            </p>

        </body>
    </html>
    """

    # --------------------------------------------------
    # RESEND MAIL PARAMETRELERİ
    # --------------------------------------------------

    params: resend.Emails.SendParams = {
        "from": "Mindscape <onboarding@resend.dev>",
        "to": [email],
        "subject": "Email Adresinizi Doğrulayın",
        "html": html_content
    }

    # --------------------------------------------------
    # MAILİ GÖNDER
    # --------------------------------------------------

    email_response = resend.Emails.send(params)

    return email_response


# ==================================================
# ŞİFRE SIFIRLAMA MAILİ GÖNDER
# ==================================================

def send_password_reset_email(
    email: str,
    reset_token: str
):
    """
    Kullanıcının şifresini sıfırlayabilmesi için
    reset token içeren email gönderir.
    """

    # --------------------------------------------------
    # RESET LINK
    # --------------------------------------------------
    #
    # Kullanıcı maildeki linke tıkladığında
    # frontend reset-password sayfasına gider.
    #
    # Frontend token'ı URL'den okuyup:
    #
    # POST /users/reset-password
    #
    # endpoint'ine token + yeni şifre gönderir.
    # --------------------------------------------------

    reset_link = (
        f"{FRONTEND_URL}/reset-password"
        f"?token={reset_token}"
    )

    # --------------------------------------------------
    # MAIL İÇERİĞİ
    # --------------------------------------------------

    html_content = f"""
    <html>
        <body>

            <h2>Mindscape</h2>

            <p>
                Şifrenizi sıfırlamak için bir istek aldık.
            </p>

            <p>
                Aşağıdaki bağlantıyı kullanabilirsiniz:
            </p>

            <p>
                <a href="{reset_link}">
                    Şifremi Sıfırla
                </a>
            </p>

            <p>
                Eğer bu işlemi siz başlatmadıysanız
                bu emaili dikkate almayabilirsiniz.
            </p>

        </body>
    </html>
    """

    # --------------------------------------------------
    # RESEND MAIL PARAMETRELERİ
    # --------------------------------------------------

    params: resend.Emails.SendParams = {
        "from": "Mindscape <onboarding@resend.dev>",
        "to": [email],
        "subject": "Şifre Sıfırlama",
        "html": html_content
    }

    # --------------------------------------------------
    # MAILİ GÖNDER
    # --------------------------------------------------

    email_response = resend.Emails.send(params)

    return email_response