from pathlib import Path

from django.conf import settings
from django.http import FileResponse, HttpResponse


def spa_index(request):
    index = Path(settings.BASE_DIR) / "frontend" / "dist" / "index.html"
    if not index.is_file():
        return HttpResponse(
            "Frontend build missing. Run: cd frontend && npm run build",
            status=503,
            content_type="text/plain; charset=utf-8",
        )
    return FileResponse(index.open("rb"), content_type="text/html")