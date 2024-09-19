import json
import psycopg2
import os
from datetime import datetime
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

def add_monthly_credits():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Add 1,000 credits to Pro plan users
            cur.execute("""
                UPDATE users
                SET credits = credits + 1000
                WHERE plan_type = 'pro'
            """)
            pro_users_updated = cur.rowcount

            # Add 100,000 credits to Jet Setter plan users
            cur.execute("""
                UPDATE users
                SET credits = credits + 100000
                WHERE plan_type = 'jet_setter'
            """)
            jet_setter_users_updated = cur.rowcount

            conn.commit()

            return {
                'pro_users_updated': pro_users_updated,
                'jet_setter_users_updated': jet_setter_users_updated,
                'timestamp': datetime.now(pytz.utc).isoformat()
            }
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return {'error': str(e)}
    finally:
        conn.close()

def lambda_handler(event, context):
    result = add_monthly_credits()
    
    return {
        'statusCode': 200 if 'error' not in result else 500,
        'body': json.dumps(result),
        'headers': {
            'Content-Type': 'application/json'
        }
    }

if __name__ == "__main__":
    print(lambda_handler({}, None))