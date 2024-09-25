import json
import psycopg2
import os
from datetime import datetime, timedelta
import pytz

DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': 5432
}

def get_db_connection():
    """Create a database connection."""
    return psycopg2.connect(**DB_PARAMS)

def update_credits():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            today = datetime.now(pytz.utc)
            
            # Handle the case for the last day of the month
            if today.day == today.replace(day=1) + timedelta(days=32) - timedelta(days=1).day:
                # It's the last day of the month
                cur.execute("""
                    UPDATE users
                    SET credits = CASE
                        WHEN plan_type = 'pro' THEN credits + 1000
                        WHEN plan_type = 'jet_setter' THEN credits + 100000
                        ELSE credits
                    END,
                    last_credit_update = %s
                    WHERE (EXTRACT(DAY FROM created_at) >= 29 OR EXTRACT(DAY FROM created_at) = 1)
                    AND (last_credit_update IS NULL OR last_credit_update < %s)
                """, (today, today.replace(day=1)))
            else:
                # Regular day of the month
                cur.execute("""
                    UPDATE users
                    SET credits = CASE
                        WHEN plan_type = 'pro' THEN credits + 1000
                        WHEN plan_type = 'jet_setter' THEN credits + 100000
                        ELSE credits
                    END,
                    last_credit_update = %s
                    WHERE EXTRACT(DAY FROM created_at) = %s
                    AND (last_credit_update IS NULL OR last_credit_update < %s)
                """, (today, today.day, today.replace(day=1)))

            users_updated = cur.rowcount
            conn.commit()

            return {
                'users_updated': users_updated,
                'timestamp': today.isoformat()
            }
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'error': str(e)}
    finally:
        conn.close()

def lambda_handler(event, context):
    result = update_credits()
    
    return {
        'statusCode': 200 if 'error' not in result else 500,
        'body': json.dumps(result),
        'headers': {
            'Content-Type': 'application/json'
        }
    }

if __name__ == "__main__":
    print(lambda_handler({}, None))