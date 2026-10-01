# ==================================================
# EMAIL SERVİSİNİ İÇE AKTAR
# ==================================================

from app.email_service import send_verification_email


# ==================================================
# TEST AYARLARI
# ==================================================

# Buraya kendi Gmail adresini yaz.
test_email = "tugcegok000@gmail.com"

# Örnek token
test_token = "abc123456"


# ==================================================
# EMAIL GÖNDER
# ==================================================

try:

    response = send_verification_email(
        email=test_email,
        verification_token=test_token
    )

    print("=================================")
    print("MAIL GÖNDERİLDİ")
    print(response)

except Exception as e:

    print("=================================")
    print("HATA OLUŞTU")
    print(e)