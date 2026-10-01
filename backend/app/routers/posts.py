
import os
import uuid
import markdown
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.post import Post
from app.models.user import User
from app.models.post_history import PostHistory
from app.models.category import Category
from app.models.tag import Tag 
from app.models.post_view import PostView

from app.schemas.post import (
    PostCreate,
    PostUpdate,
    PostResponse,
    PostScheduleRequest,
    PostHistoryResponse,
    MarkdownPreviewRequest,
    MarkdownPreviewResponse,
    ImageDeleteRequest,
    VideoEmbedRequest,
    FileDeleteRequest,
    RichTextRequest

)

from app.auth import get_current_user



# ==================================================
# ROUTER
# ==================================================

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)
# ==================================================
# OKUMA SÜRESİ HESAPLAMA
# ==================================================

def calculate_reading_time(content: str) -> int:

    # Ortalama okuma hızı:
    # yaklaşık 200 kelime / dakika
    words = content.split()

    word_count = len(words)

    # En az 1 dakika gösterelim
    reading_time = max(
        1,
        round(word_count / 200)
    )

    return reading_time

# ==================================================
# YENİ BLOG YAZISI OLUŞTUR
# ==================================================
#Depends(get_db) : database sessionu verir 
#Depends(get_current_user): giriş yapan kullanıcıyı verir
@router.post(
    "",
    response_model=PostResponse # backendin dışarıya vereceği cevabın formatını belirler
)                 #PostResponse:hangi alanları tanımlıyorsa apı cevabı ona göre tanımlar 
def create_post(
    post: PostCreate, # apı den gelen verinin şekli 
    db: Session = Depends(get_db), #bu endpoint için bana bi database seesion ver
    current_user: User = Depends(get_current_user)
):  # 
# --------------------------------------------------
# KATEGORİ KONTROLÜ
# --------------------------------------------------

    if post.category_id is not None:

        category = db.query(Category).filter(
            Category.id == post.category_id
        ).first()

        if category is None:
            raise HTTPException(
                status_code=404,
                detail="Kategori bulunamadı."
            )
# --------------------------------------------------
# ETİKET KONTROLÜ
# --------------------------------------------------

    selected_tags = []

    if post.tag_ids:

        selected_tags = db.query(Tag).filter(
            Tag.id.in_(post.tag_ids)
    ).all()

    # Gönderilen bütün tag ID'leri bulundu mu?
    if len(selected_tags) != len(set(post.tag_ids)):
        raise HTTPException(
            status_code=404,
            detail="Etiketlerden biri veya birkaçı bulunamadı."
        )   

    # --------------------------------------------------
    # Yeni oluşturulan bütün yazılar
    # ilk olarak "draft" yani taslak olur.
    # --------------------------------------------------

    new_post = Post(
        title=post.title,
        content=post.content,
        owner_id=current_user.id,
        category_id=post.category_id,
        status="draft"
    )
    # Yazıya seçilen etiketleri bağla
    new_post.tags = selected_tags

    # Yazıyı veritabanına ekle
    db.add(new_post)

    # Veritabanına kaydet
    db.commit()

    # ID, created_at gibi verileri tekrar yükle
    db.refresh(new_post)

    return new_post


# ==================================================
# TÜM YAYINLANMIŞ BLOG YAZILARINI GETİR
# ==================================================

@router.get(
    "",
    response_model=list[PostResponse]
)
def get_posts(
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # Taslak, planlanmış veya arşivlenmiş yazılar
    # herkese açık olmamalıdır.
    #
    # Bu yüzden sadece yayınlanmış yazıları getiriyoruz.
    # --------------------------------------------------

    posts = db.query(Post).filter(
        Post.status == "published"
    ).all()

    return posts


# ==================================================
# KULLANICININ KENDİ TASLAKLARINI GETİR
# ==================================================

@router.get(
    "/me/drafts",
    response_model=list[PostResponse]
)
def get_my_drafts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # Sadece giriş yapan kullanıcıya ait
    # draft durumundaki yazıları getir.
    # --------------------------------------------------

    drafts = db.query(Post).filter(
        Post.owner_id == current_user.id,
        Post.status == "draft"
    ).all()

    return drafts
# ==================================================
# MARKDOWN ÖNİZLEME Markdown, HTML yazmadan yazıya başlık, kalın, italik, liste, link, kod bloğu gibi biçimler vermenin kolay yolu.
# ==================================================

@router.post(
    "/markdown/preview",
    response_model=MarkdownPreviewResponse
)
def preview_markdown(
    markdown_data: MarkdownPreviewRequest
):

    # --------------------------------------------------
    # MARKDOWN → HTML
    # --------------------------------------------------

    html_content = markdown.markdown(
        markdown_data.content,
        extensions=[
            "fenced_code",
            "tables",
            "codehilite",
            "toc"

        ]
    )

    return {
        "markdown": markdown_data.content,
        "html": html_content
    }
# ==================================================
# BLOG İÇERİĞİ İÇİN RESİM YÜKLE
# ==================================================

@router.post("/upload-image")
def upload_image(
    image: UploadFile = File(...)
):

    # --------------------------------------------------
    # DOSYA TİPİ KONTROLÜ
    # --------------------------------------------------

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Sadece JPEG, PNG veya WEBP resimleri yüklenebilir."
        )

    # --------------------------------------------------
    # DOSYA UZANTISINI AL
    # --------------------------------------------------

    extension = image.filename.split(".")[-1]

    # --------------------------------------------------
    # BENZERSİZ DOSYA ADI OLUŞTUR
    # --------------------------------------------------

    file_name = f"{uuid.uuid4()}.{extension}"

    # --------------------------------------------------
    # KAYDEDİLECEK KLASÖR
    # --------------------------------------------------

    upload_directory = "uploads"

    os.makedirs(
        upload_directory,
        exist_ok=True
    )

    file_path = os.path.join(
        upload_directory,
        file_name
    )

    # --------------------------------------------------
    # DOSYAYI KAYDET
    # --------------------------------------------------

    with open(file_path, "wb") as buffer:
        buffer.write(
            image.file.read()
        )

    # --------------------------------------------------
    # RESİM URL'Sİ
    # --------------------------------------------------

    image_url = f"/uploads/{file_name}"

    return {
        "message": "Resim başarıyla yüklendi.",
        "image_url": image_url
    }

# ==================================================
# BLOG İÇERİĞİ İÇİN DOSYA YÜKLE
# ==================================================

@router.post("/upload-file")
def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # İZİN VERİLEN DOSYA TÜRLERİ
    # --------------------------------------------------

    allowed_types = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Sadece PDF, TXT ve DOCX dosyaları yüklenebilir."
        )

    # --------------------------------------------------
    # DOSYA UZANTISINI AL
    # --------------------------------------------------

    extension = file.filename.split(".")[-1]

    # --------------------------------------------------
    # BENZERSİZ DOSYA ADI OLUŞTUR
    # --------------------------------------------------

    file_name = f"{uuid.uuid4()}.{extension}"

    # --------------------------------------------------
    # UPLOAD KLASÖRÜ
    # --------------------------------------------------

    upload_directory = "uploads"

    os.makedirs(
        upload_directory,
        exist_ok=True
    )

    file_path = os.path.join(
        upload_directory,
        file_name
    )

    # --------------------------------------------------
    # DOSYAYI KAYDET
    # --------------------------------------------------

    with open(file_path, "wb") as buffer:
        buffer.write(
            file.file.read()
        )

    # --------------------------------------------------
    # DOSYA URL'Sİ
    # --------------------------------------------------

    file_url = f"/uploads/{file_name}"

    return {
        "message": "Dosya başarıyla yüklendi.",
        "file_url": file_url,
        "original_filename": file.filename
    }
# ==================================================
# YÜKLENEN DOSYAYI SİL
# ==================================================

@router.delete("/delete-file")
def delete_file(
    file_data: FileDeleteRequest,
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # URL KONTROLÜ
    # --------------------------------------------------

    # Sadece uploads klasöründeki
    # dosyaların silinmesine izin veriyoruz.
    if not file_data.file_url.startswith("/uploads/"):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz dosya URL'si."
        )


    # --------------------------------------------------
    # DOSYA ADINI AL
    # --------------------------------------------------

    file_name = os.path.basename(
        file_data.file_url
    )


    # --------------------------------------------------
    # DOSYA YOLUNU OLUŞTUR
    # --------------------------------------------------

    file_path = os.path.join(
        "uploads",
        file_name
    )


    # --------------------------------------------------
    # DOSYA VAR MI?
    # --------------------------------------------------

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Dosya bulunamadı."
        )


    # --------------------------------------------------
    # DOSYAYI SİL
    # --------------------------------------------------

    os.remove(file_path)


    return {
        "message": "Dosya başarıyla silindi."
    }
# ==================================================
# YÜKLENEN RESMİ SİL
# ==================================================

@router.delete("/delete-image")
def delete_image(
    image_data: ImageDeleteRequest,
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # URL KONTROLÜ
    # --------------------------------------------------

    # Sadece bizim uploads klasörümüzdeki
    # dosyaların silinmesine izin veriyoruz.
    if not image_data.image_url.startswith("/uploads/"):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz resim URL'si."
        )


    # --------------------------------------------------
    # DOSYA ADINI AL
    # --------------------------------------------------

    file_name = os.path.basename(
        image_data.image_url
    )


    # --------------------------------------------------
    # DOSYA YOLUNU OLUŞTUR
    # --------------------------------------------------

    file_path = os.path.join(
        "uploads",
        file_name
    )


    # --------------------------------------------------
    # DOSYA VAR MI?
    # --------------------------------------------------

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Resim bulunamadı."
        )


    # --------------------------------------------------
    # DOSYAYI SİL
    # --------------------------------------------------

    os.remove(file_path)


    return {
        "message": "Resim başarıyla silindi."
    }
# ==================================================
# VIDEO EKLE
# ==================================================

@router.post("/embed-video")
def embed_video(
    video_data: VideoEmbedRequest,
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # DESTEKLENEN PLATFORM KONTROLÜ
    # --------------------------------------------------

    allowed_domains = [
        "youtube.com",
        "youtu.be",
        "vimeo.com"
    ]

    # URL desteklenen platformlardan biri mi?
    if not any(
        domain in video_data.url
        for domain in allowed_domains
    ):
        raise HTTPException(
            status_code=400,
            detail="Sadece YouTube veya Vimeo linkleri destekleniyor."
        )

    # --------------------------------------------------
    # BAŞARILI RESPONSE
    # --------------------------------------------------

    return {
        "message": "Video bağlantısı başarıyla eklendi.",
        "video_url": video_data.url
    }
# ==================================================
# BLOG YAZISINI ÖNİZLE
# ==================================================

@router.get(
    "/{post_id}/preview",
    response_model=PostResponse
)
def preview_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # YAZIYI BUL
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # YETKİ KONTROLÜ
    # --------------------------------------------------

    # Yayınlanmamış bir yazının preview bilgisini
    # sadece sahibi görebilir.
    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yazıyı önizleme yetkiniz yok."
        )

    return post
# ==================================================
# TEK BLOG YAZISINI GETİR
# ==================================================

@router.get(
    "/{post_id}",
    response_model=PostResponse
)
def get_post(
    post_id: int,
    db: Session = Depends(get_db)
):

    # ID üzerinden yazıyı bul
    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    # Yazı bulunamazsa hata döndür
    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    return post
# ==================================================
# BLOG YAZISINI GÜNCELLE
# ==================================================

@router.put(
    "/{post_id}",
    response_model=PostResponse
)
def update_post(
    post_id: int,
    updated_post: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # YAZIYI BUL
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # YETKİ KONTROLÜ
    # --------------------------------------------------

    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yazıyı güncelleme yetkiniz yok."
        )

    # --------------------------------------------------
    # ESKİ SÜRÜMÜ VERSION HISTORY'YE KAYDET
    # --------------------------------------------------

    old_version = PostHistory(
        post_id=post.id,
        title=post.title,
        content=post.content,
        status=post.status
    )

    db.add(old_version)

    # --------------------------------------------------
    # BAŞLIK GÜNCELLE
    # --------------------------------------------------

    if updated_post.title is not None:
        post.title = updated_post.title

    # --------------------------------------------------
    # İÇERİK GÜNCELLE
    # --------------------------------------------------

    if updated_post.content is not None:
        post.content = updated_post.content

    # --------------------------------------------------
    # KATEGORİ GÜNCELLE
    # --------------------------------------------------

    if updated_post.category_id is not None:

        # Kategori gerçekten var mı?
        category = db.query(Category).filter(
            Category.id == updated_post.category_id
        ).first()

        if category is None:
            raise HTTPException(
                status_code=404,
                detail="Kategori bulunamadı."
            )

        # Yazının kategorisini değiştir
        post.category_id = updated_post.category_id

    # --------------------------------------------------
    # VERİTABANINA KAYDET
    # --------------------------------------------------
# --------------------------------------------------
# ETİKETLERİ GÜNCELLE
# --------------------------------------------------

    if updated_post.tag_ids is not None:

    # Gönderilen ID'lere ait etiketleri veritabanından bul.
        selected_tags = db.query(Tag).filter(
        Tag.id.in_(updated_post.tag_ids)
    ).all()

    # Gönderilen ID'lerden biri veritabanında yoksa
    # güncelleme işlemini yapma.
    if len(selected_tags) != len(set(updated_post.tag_ids)):
        raise HTTPException(
            status_code=404,
            detail="Etiketlerden biri veya birkaçı bulunamadı."
        )

    # Yazının eski etiketlerini yeni etiketlerle değiştir.
    post.tags = selected_tags
    db.commit()

    # Güncel verileri tekrar yükle
    db.refresh(post)

    # ÇOK ÖNEMLİ:
    # PostResponse beklediği için post nesnesini döndürmeliyiz.
    return post

# ==================================================
# OTOMATİK TASLAK KAYDI
# ==================================================

@router.put(
    "/{post_id}/autosave",
    response_model=PostResponse
)
def autosave_post(
    post_id: int,
    updated_post: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # YAZIYI BUL
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # YETKİ KONTROLÜ
    # --------------------------------------------------

    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yazıyı otomatik kaydetme yetkiniz yok."
        )

    # --------------------------------------------------
    # SADECE TASLAK / PLANLANMIŞ YAZILAR
    # --------------------------------------------------

    if post.status not in ["draft", "scheduled"]:
        raise HTTPException(
            status_code=400,
            detail="Sadece taslak veya planlanmış yazılar otomatik kaydedilebilir."
        )

    # --------------------------------------------------
    # BAŞLIK GÜNCELLE
    # --------------------------------------------------

    if updated_post.title is not None:
        post.title = updated_post.title

    # --------------------------------------------------
    # İÇERİK GÜNCELLE
    # --------------------------------------------------

    if updated_post.content is not None:
        post.content = updated_post.content

    # --------------------------------------------------
    # KAYDET
    # --------------------------------------------------

    db.commit()
    db.refresh(post)

    return post
# ==================================================
# BLOG YAZISINI YAYINLA
# ==================================================

@router.post(
    "/{post_id}/publish",
    response_model=PostResponse
)
def publish_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # YAZIYI BUL
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )


    # --------------------------------------------------
    # YETKİ KONTROLÜ
    # --------------------------------------------------

    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yazıyı yayınlama yetkiniz yok."
        )


    # --------------------------------------------------
    # ZATEN YAYINLANMIŞ MI?
    # --------------------------------------------------

    if post.status == "published":
        raise HTTPException(
            status_code=400,
            detail="Bu yazı zaten yayınlanmış."
        )


    # --------------------------------------------------
    # YAYINLA
    # --------------------------------------------------

    # Yazının durumunu published yap
    post.status = "published"

    # Yayınlanma zamanını kaydet
    post.published_at = datetime.utcnow()

    # Daha önce planlanmışsa planlama bilgisini temizle
    post.scheduled_at = None


    # Değişiklikleri kaydet
    db.commit()

    # Güncel verileri tekrar yükle
    db.refresh(post)

    return post


# ==================================================
# BLOG YAZISINI YAYINDAN KALDIR
# ==================================================

@router.post(
    "/{post_id}/unpublish",
    response_model=PostResponse
)
def unpublish_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # YAZIYI BUL
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )


    # --------------------------------------------------
    # YETKİ KONTROLÜ
    # --------------------------------------------------

    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yazıyı yayından kaldırma yetkiniz yok."
        )


    # --------------------------------------------------
    # YAZI ZATEN YAYINDA DEĞİL Mİ?
    # --------------------------------------------------

    if post.status != "published":
        raise HTTPException(
            status_code=400,
            detail="Bu yazı zaten yayında değil."
        )


    # --------------------------------------------------
    # TASLAĞA GERİ AL
    # --------------------------------------------------

    # Yazıyı yeniden taslak durumuna getir
    post.status = "draft"

    # Artık yayında olmadığı için
    # yayın tarihini temizle
    post.published_at = None

    # Planlanmış tarih varsa temizle
    post.scheduled_at = None


    # Değişiklikleri kaydet
    db.commit()

    # Güncel verileri tekrar yükle
    db.refresh(post)

    return post

# ==================================================
# BLOG YAZISINI İLERİ TARİHE PLANLA
# ==================================================

@router.post(
    "/{post_id}/schedule",
    response_model=PostResponse
)
def schedule_post(
    post_id: int,
    schedule_data: PostScheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # YAZIYI BUL
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # YETKİ KONTROLÜ
    # --------------------------------------------------

    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yazıyı planlama yetkiniz yok."
        )

    # --------------------------------------------------
    # TARİH KONTROLÜ
    # --------------------------------------------------

    if schedule_data.scheduled_at <= datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Planlanan yayın tarihi gelecekte olmalıdır."
        )

    # --------------------------------------------------
    # PLANLANMIŞ YAYIN
    # --------------------------------------------------

    post.status = "scheduled"

    post.scheduled_at = schedule_data.scheduled_at

    # Henüz yayınlanmadığı için
    # published_at boş olmalı.
    post.published_at = None

    db.commit()
    db.refresh(post)

    return post
# ==================================================
# BLOG YAZISINI KOPYALA
# ==================================================

@router.post(
    "/{post_id}/duplicate",
    response_model=PostResponse
)
def duplicate_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # KOPYALANACAK YAZIYI BUL
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # YETKİ KONTROLÜ
    # --------------------------------------------------

    # Sadece yazının sahibi kendi yazısını kopyalayabilir.
    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yazıyı kopyalama yetkiniz yok."
        )

    # --------------------------------------------------
    # YENİ KOPYA OLUŞTUR
    # --------------------------------------------------

    copied_post = Post(
        title=f"{post.title} (Kopya)",
        content=post.content,
        owner_id=current_user.id,

        # Kopyalanan yazı direkt yayınlanmaz.
        # Taslak olarak oluşturulur.
        status="draft"
    )

    # Veritabanına ekle
    db.add(copied_post)

    # Değişiklikleri kaydet
    db.commit()

    # Yeni ID ve tarih bilgilerini yükle
    db.refresh(copied_post)

    return copied_post
# ==================================================
# BLOG YAZISINI ARŞİVLE
# ==================================================

@router.post(
    "/{post_id}/archive",
    response_model=PostResponse
)
def archive_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # YAZIYI BUL
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # YETKİ KONTROLÜ
    # --------------------------------------------------

    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yazıyı arşivleme yetkiniz yok."
        )

    # --------------------------------------------------
    # ZATEN ARŞİVDE Mİ?
    # --------------------------------------------------

    if post.status == "archived":
        raise HTTPException(
            status_code=400,
            detail="Bu yazı zaten arşivde."
        )

    # --------------------------------------------------
    # ARŞİVLE
    # --------------------------------------------------

    post.status = "archived"

    post.published_at = None

    post.scheduled_at = None

    db.commit()
    db.refresh(post)

    return post
# ==================================================
# ARŞİVLENEN YAZILARIM
# ==================================================

@router.get(
    "/me/archive",
    response_model=list[PostResponse]
)
def get_my_archive(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    posts = db.query(Post).filter(
        Post.owner_id == current_user.id,
        Post.status == "archived"
    ).all()

    return posts
# ==================================================
# BLOG YAZISININ VERSION HISTORY'SİNİ GETİR
# ==================================================

@router.get(
    "/{post_id}/history",
    response_model=list[PostHistoryResponse]
)
def get_post_history(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # YAZIYI BUL
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # YETKİ KONTROLÜ
    # --------------------------------------------------

    # History sadece yazının sahibi tarafından görülebilir.
    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yazının geçmişini görüntüleme yetkiniz yok."
        )

    # --------------------------------------------------
    # HISTORY KAYITLARINI GETİR
    # --------------------------------------------------

    history = db.query(PostHistory).filter(
        PostHistory.post_id == post_id
    ).order_by(
        PostHistory.created_at.desc()
    ).all()

    return history
# ==================================================
# BLOG YAZISINI SİL
# ==================================================

@router.delete(
    "/{post_id}"
)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # Silinecek yazıyı bul
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )


    # --------------------------------------------------
    # YETKİ KONTROLÜ
    # --------------------------------------------------

    if post.owner_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Bu yazıyı silme yetkiniz yok."
        )


    # Yazıyı sil
    db.delete(post)

    # Değişikliği kaydet
    db.commit()


    return {
        "message": "Blog yazısı başarıyla silindi."
    }
# ==================================================
# RICH TEXT ÖNİZLEME
# ==================================================

@router.post("/rich-text/preview")
def preview_rich_text(
    rich_text: RichTextRequest
):

    # Frontend editöründen gelen HTML'i
    # şimdilik doğrudan preview olarak döndürüyoruz.

    return {
        "html": rich_text.content
    }
# ==================================================
# POST GÖRÜNTÜLENME KAYDI OLUŞTUR
# ==================================================

@router.post("/{post_id}/view")
def add_post_view(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # --------------------------------------------------
    # POST VAR MI?
    # --------------------------------------------------

    post = db.query(Post).filter(
        Post.id == post_id
    ).first()

    if post is None:
        raise HTTPException(
            status_code=404,
            detail="Blog yazısı bulunamadı."
        )

    # --------------------------------------------------
    # VIEW KAYDI OLUŞTUR
    # --------------------------------------------------

    new_view = PostView(
        post_id=post_id,
        user_id=current_user.id
    )

    db.add(new_view)
    db.commit()
    db.refresh(new_view)

    return {
        "message": "Görüntülenme kaydedildi.",
        "post_id": post_id,
        "user_id": current_user.id,
        "view_id": new_view.id,
        "viewed_at": new_view.viewed_at
    }