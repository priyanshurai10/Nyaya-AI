import sqlite3

def check():
    conn = sqlite3.connect('nyaya_ai.db')
    c = conn.cursor()
    
    # Check tables
    c.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in c.fetchall()]
    print("Tables:", tables)
    
    if 'courses' in tables:
        c.execute('SELECT count(*) FROM courses')
        print("Courses:", c.fetchone()[0])
        
        c.execute('SELECT count(*) FROM lessons')
        print("Lessons:", c.fetchone()[0])
        
    conn.close()

if __name__ == "__main__":
    check()
