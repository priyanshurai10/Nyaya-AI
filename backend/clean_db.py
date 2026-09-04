import sqlite3

def clean_db():
    conn = sqlite3.connect('nyaya_ai.db')
    c = conn.cursor()
    tables = c.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    for t in tables:
        table_name = t[0]
        if table_name not in ('location_pincodes', 'sqlite_sequence'):
            c.execute(f"DELETE FROM {table_name}")
            print(f"Cleared {table_name}")
    conn.commit()
    c.execute('VACUUM')
    conn.close()
    print("Database cleaned and vacuumed.")

if __name__ == '__main__':
    clean_db()
