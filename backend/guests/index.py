import json
import os
import urllib.request
import urllib.parse
import psycopg2  # v4

# Telegram chat_id — номер телефона привязан к аккаунту, но нужен chat_id
# Пользователь должен написать боту /start, тогда мы получим его chat_id
# Пока используем переменную TELEGRAM_CHAT_ID (можно получить написав боту)
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")


def send_telegram(text: str):
    """Отправка сообщения в Telegram."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
    if not token or not chat_id:
        return
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        data = urllib.parse.urlencode({
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "HTML",
        }).encode()
        req = urllib.request.Request(url, data=data, method="POST")
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass


def handler(event: dict, context) -> dict:
    """Сохранение ответа гостя и отправка уведомления в Telegram."""

    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    # Специальный эндпоинт для получения chat_id после /start
    qs = event.get("queryStringParameters") or {}
    if qs.get("action") == "get_updates":
        token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
        if token:
            try:
                url = f"https://api.telegram.org/bot{token}/getUpdates"
                with urllib.request.urlopen(url, timeout=5) as r:
                    data = json.loads(r.read())
                return {"statusCode": 200, "headers": cors, "body": json.dumps(data)}
            except Exception as e:
                return {"statusCode": 200, "headers": cors, "body": json.dumps({"error": str(e)})}
        return {"statusCode": 200, "headers": cors, "body": json.dumps({"error": "no token"})}

    dsn = os.environ["DATABASE_URL"]
    if "sslmode" not in dsn:
        sep = "&" if "?" in dsn else "?"
        dsn = dsn + sep + "sslmode=disable"

    conn = psycopg2.connect(dsn)

    try:
        cur = conn.cursor()

        if event.get("httpMethod") == "POST":
            body = json.loads(event.get("body") or "{}")
            name = (body.get("name") or "").strip()
            attending = (body.get("attending") or "").strip()

            if not name or attending not in ("yes", "no"):
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Неверные данные"})}

            cur.execute(
                "INSERT INTO guests (name, attending) VALUES (%s, %s) RETURNING id",
                (name, attending)
            )
            row = cur.fetchone()
            conn.commit()
            cur.close()

            emoji = "✅" if attending == "yes" else "❌"
            status = "придёт на свадьбу 🎉" if attending == "yes" else "не сможет прийти 😔"
            tg_text = f"💌 <b>Новый ответ гостя!</b>\n\n{emoji} <b>{name}</b>\n{status}"
            send_telegram(tg_text)

            return {
                "statusCode": 200,
                "headers": cors,
                "body": json.dumps({"ok": True, "id": row[0]}),
            }

        if event.get("httpMethod") == "GET":
            cur.execute("SELECT id, name, attending, created_at FROM guests ORDER BY created_at DESC")
            rows = cur.fetchall()
            guests = [
                {"id": r[0], "name": r[1], "attending": r[2], "created_at": str(r[3])}
                for r in rows
            ]
            cur.close()
            return {
                "statusCode": 200,
                "headers": cors,
                "body": json.dumps({"guests": guests}, ensure_ascii=False),
            }

    finally:
        conn.close()

    return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "Method not allowed"})}
