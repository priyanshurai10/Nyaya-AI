import dotenv
dotenv.load_dotenv()
from sqlalchemy import text
from app.core.database import engine

def fix():
    print("Connecting to database and finding constraints pointing to old 'users' table...")
    with engine.connect() as conn:
        query = text("""
            SELECT 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                tc.constraint_name
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users';
        """)
        results = conn.execute(query).fetchall()
        print(f"Found {len(results)} constraints pointing to 'users':")
        for row in results:
            table_name = row[0]
            col_name = row[1]
            ref_col = row[3]
            constraint_name = row[4]
            print(f"Processing Constraint: {constraint_name} on table {table_name}({col_name})")
            
            # Drop constraint
            print(f"  Dropping constraint {constraint_name}...")
            conn.execute(text(f'ALTER TABLE "{table_name}" DROP CONSTRAINT "{constraint_name}";'))
            
            # Add corrected constraint referencing "User"
            new_constraint_name = f"{table_name}_{col_name}_User_fkey"
            print(f"  Adding new constraint {new_constraint_name} referencing User(id)...")
            conn.execute(text(f"""
                ALTER TABLE "{table_name}" 
                ADD CONSTRAINT "{new_constraint_name}" 
                FOREIGN KEY ("{col_name}") 
                REFERENCES "User"("{ref_col}")
                ON DELETE CASCADE;
            """))
        conn.commit()
    print("SUCCESS: Database foreign key constraints repaired!")

if __name__ == '__main__':
    fix()
