from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.tag import TagResponse


# ==================================================
# BLOG YAZISI OLUŞTURMA
# ==================================================

class PostCreate(BaseModel):

    # Yazı başlığı
    title: str

    # Yazı içeriği
    content: str

    # Yazının bağlı olduğu kategori
    category_id: Optional[int] = None

    # Yazıya bağlanacak etiketlerin ID listesi
    #
    # Örnek:
    # [1, 3, 5]
    tag_ids: list[int] = []


# ==================================================
# BLOG YAZISI GÜNCELLEME
# ==================================================

class PostUpdate(BaseModel):

    # Yeni başlık
    title: Optional[str] = None

    # Yeni içerik
    content: Optional[str] = None
    
    category_id: Optional[int] = None

    tag_ids: Optional[list[int]] = None

# ==================================================
# API'NİN KULLANICIYA DÖNDÜRECEĞİ VERİ
# ==================================================

class PostResponse(BaseModel):

    # Yazı ID'si
    id: int

    # Başlık
    title: str

    # İçerik
    content: str

    # Yazının sahibi
    owner_id: int

    # Tahmini okuma süresi (dakika)
    reading_time: int

    # ==================================================
    # YAZI DURUMU
    # ==================================================

    # draft
    # published
    # scheduled
    # archived
    status: str


    # ==================================================
    # TARİHLER
    # ==================================================

    # Yayınlanma zamanı
    published_at: Optional[datetime] = None

    # Planlanan yayın zamanı
    scheduled_at: Optional[datetime] = None

    # Oluşturulma zamanı
    created_at: datetime

    # Son güncellenme zamanı
    updated_at: datetime

    category_id: Optional[int] = None

    tags: list[TagResponse] = []


    class Config:
        from_attributes = True
    # ==================================================
    # PLANLANMIŞ YAYIN
   # ==================================================

class PostScheduleRequest(BaseModel):

    # Yazının hangi tarih ve saatte
    # otomatik yayınlanacağını belirtir.
    scheduled_at: datetime
# ==================================================
# POST HISTORY RESPONSE
# ==================================================

class PostHistoryResponse(BaseModel):

    # History kaydının ID'si
    id: int

    # Hangi posta ait olduğu
    post_id: int

    # Eski başlık
    title: str

    # Eski içerik
    content: str

    # Eski status
    status: str

    # Bu history kaydının oluşturulma zamanı
    created_at: datetime

    class Config:
        from_attributes = True
# ==================================================
# MARKDOWN ÖNİZLEME REQUEST
# ==================================================

class MarkdownPreviewRequest(BaseModel):

    # Markdown formatındaki içerik
    content: str


# ==================================================
# MARKDOWN ÖNİZLEME RESPONSE
# ==================================================

class MarkdownPreviewResponse(BaseModel):

    # Kullanıcının gönderdiği Markdown
    markdown: str

    # Markdown'dan oluşturulan HTML
    html: str      
# ==================================================
# RESİM SİLME REQUEST
# ==================================================

class ImageDeleteRequest(BaseModel):

    # Silinecek resmin URL'si
    #
    # Örnek:
    # /uploads/abc123.png
    image_url: str
# ==================================================
# VIDEO EKLEME REQUEST
# ==================================================

class VideoEmbedRequest(BaseModel):

    # YouTube / Vimeo gibi platformlardan video linki
    url: str
# ==================================================
# DOSYA SİLME REQUEST
# ==================================================

class FileDeleteRequest(BaseModel):

    # Silinecek dosyanın URL'si
    #
    # Örnek:
    # /uploads/abc123.pdf
    file_url: str
# ==================================================
# RICH TEXT REQUEST
# ==================================================

class RichTextRequest(BaseModel):

    # Editörden gelen HTML içerik
    content: str   