import os
import json
import urllib.request
import boto3

# Публичные источники трека Golden Brown Slowed GhalyProd
SOURCES = [
    "https://music.2ip.ru/download/GhalyProd-Golden-Brown-Slowed.mp3",
    "https://zvukovoi.ru/upload/music/GhalyProd-Golden-Brown-Slowed.mp3",
]

def handler(event: dict, context) -> dict:
    """Загрузка трека Golden Brown Slowed в S3 для плеера."""

    cors = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    # Принимаем URL трека в теле запроса
    body = json.loads(event.get("body") or "{}")
    track_url = body.get("url", "")

    if not track_url:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Укажите url трека"})}

    # Скачиваем трек
    req = urllib.request.Request(track_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        audio_data = r.read()

    # Загружаем в S3
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    s3.put_object(
        Bucket="files",
        Key="golden-brown-slowed.mp3",
        Body=audio_data,
        ContentType="audio/mpeg",
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/golden-brown-slowed.mp3"
    return {
        "statusCode": 200,
        "headers": cors,
        "body": json.dumps({"ok": True, "url": cdn_url}),
    }
