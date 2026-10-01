from pydantic import BaseModel, Field


# ==================================================
# AI'YA GÖNDERİLECEK İÇERİK
# ==================================================

class AIContentRequest(BaseModel):

    # Kullanıcının AI tarafından analiz edilmesini
    # istediği blog içeriği.
    #
    # min_length=20:
    # Çok kısa ve anlamsız içeriklerin AI'ya
    # gönderilmesini engeller.
    content: str = Field(
        ...,
        min_length=20,
        description="AI tarafından analiz edilecek blog içeriği"
    )


# ==================================================
# AI BAŞLIK ÖNERİSİ RESPONSE
# ==================================================

class AITitleSuggestionResponse(BaseModel):

    # AI'dan birden fazla başlık önerisi alacağız.
    titles: list[str]