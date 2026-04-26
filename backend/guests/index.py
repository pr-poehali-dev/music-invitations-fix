import json
import os
import psycopg2  # v2


def handler(event: dict, context) -> dict:
    """Сохранение ответа гостя и получение списка гостей."""

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