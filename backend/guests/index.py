import json
import os
import urllib.request
import urllib.parse
import psycopg2  # v3


# ID страницы ВКонтакте sonechka_nss — отправляем сообщение на эту страницу
VK_SCREEN_NAME = "sonechka_nss"


def send_vk_message(text: str):
    """Отправка сообщения в ВКонтакте."""
    token = os.environ.get("VK_ACCESS_TOKEN", "")
    if not token:
        return

    # Сначала получаем user_id по screen_name
    resolve_url = "https://api.vk.com/method/utils.resolveScreenName?" + urllib.parse.urlencode({
        "screen_name": VK_SCREEN_NAME,
        "access_token": token,
        "v": "5.199",
    })
    try:
        with urllib.request.urlopen(resolve_url, timeout=5) as r:
            data = json.loads(r.read())
        obj = data.get("response", {})
        peer_id = obj.get("object_id")
        if not peer_id:
            return

        # Отправляем сообщение
        msg_url = "https://api.vk.com/method/messages.send"
        params = urllib.parse.urlencode({
            "user_id": peer_id,
            "message": text,
            "random_id": 0,
            "access_token": token,
            "v": "5.199",
        }).encode()
        req = urllib.request.Request(msg_url, data=params, method="POST")
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass  # не блокируем основной ответ если ВК недоступен


def handler(event: dict, context) -> dict:
    """Сохранение ответа гостя и отправка уведомления в ВКонтакте."""

    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

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

            # Уведомление в ВК
            emoji = "✅" if attending == "yes" else "❌"
            status = "придёт на свадьбу" if attending == "yes" else "не сможет прийти"
            vk_text = f"💌 Новый ответ гостя!\n\n{emoji} {name} — {status}"
            send_vk_message(vk_text)

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
