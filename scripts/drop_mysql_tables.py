import pymysql

def drop_all_tables(host='127.0.0.1', user='edufund_user', password='132456', db='edufund', port=3306):
    print('Dropping all tables in edufund...')
    conn=pymysql.connect(host=host, user=user, password=password, database=db, port=port)
    cur=conn.cursor()
    cur.execute('SET FOREIGN_KEY_CHECKS=0')
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema=%s", (db,))
    tables=[r[0] for r in cur.fetchall()]
    for t in tables:
        cur.execute(f"DROP TABLE IF EXISTS {t}")
    print('Dropped tables:', tables)
    cur.execute('SET FOREIGN_KEY_CHECKS=1')
    conn.commit()
    cur.close()
    conn.close()
    print('Done.')

if __name__ == '__main__':
    drop_all_tables()