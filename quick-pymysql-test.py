import pymysql
from dotenv import load_dotenv
import os

load_dotenv()

try:
    print("Attempting to connect to MySQL...")
    print(f"Host: 127.0.0.1")
    print(f"Port: 3306")
    print(f"User: {os.getenv('DB_USER')}")
    print(f"Database: {os.getenv('DB_NAME')}\n")

    connection = pymysql.connect(
        host='127.0.0.1',  # Force IP address instead of hostname
        port=3306,
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME'),
        connect_timeout=10
    )

    print("[SUCCESS] Connected to MySQL!")

    with connection.cursor() as cursor:
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"MySQL Version: {version[0]}")

        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()
        print(f"Users in database: {count[0]}")

    connection.close()
    print("\n[SUCCESS] All tests passed!")

except pymysql.err.OperationalError as e:
    print(f"\n[ERROR] Connection failed: {e}")
    print("\nPossible solutions:")
    print("1. Check if MySQL is running on port 3306")
    print("2. Verify the password is correct")
    print("3. Check MySQL user permissions:")
    print("   mysql -u root -p")
    print("   SELECT user, host FROM mysql.user WHERE user='root';")
except Exception as e:
    print(f"\n[ERROR] Unexpected error: {e}")
