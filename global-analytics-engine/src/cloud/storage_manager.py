import os
import duckdb
import pandas as pd
import polars as pl
from pathlib import Path
import boto3
from botocore.exceptions import BotoCoreError, ClientError

from config.cloud_config import CloudConfig, PARQUET_DATA_DIR

class CloudStorageManager:
    """Unified abstraction layer for S3, Cloud Data Lake, & DuckDB Parquet engine."""
    
    def __init__(self):
        self.mode = CloudConfig.STORAGE_MODE
        self.s3_client = None
        
        if self.mode == "AWS_S3" and CloudConfig.AWS_ACCESS_KEY_ID:
            try:
                self.s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=CloudConfig.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=CloudConfig.AWS_SECRET_ACCESS_KEY,
                    region_name=CloudConfig.AWS_REGION
                )
            except Exception as e:
                print(f"[CloudStorageManager Warning] S3 init failed, falling back to LOCAL_MOCK: {e}")
                self.mode = "LOCAL_MOCK"

    def get_duckdb_connection(self):
        """Returns an optimized in-memory DuckDB connection configured for Parquet querying."""
        con = duckdb.connect(database=":memory:")
        con.execute(f"SET memory_limit='{CloudConfig.DUCKDB_MEMORY_LIMIT}';")
        con.execute(f"SET threads={CloudConfig.DUCKDB_THREADS};")
        
        if self.mode == "AWS_S3" and CloudConfig.AWS_ACCESS_KEY_ID:
            con.execute("INSTALL httpfs; LOAD httpfs;")
            con.execute(f"SET s3_region='{CloudConfig.AWS_REGION}';")
            con.execute(f"SET s3_access_key_id='{CloudConfig.AWS_ACCESS_KEY_ID}';")
            con.execute(f"SET s3_secret_access_key='{CloudConfig.AWS_SECRET_ACCESS_KEY}';")
            
        return con

    def save_parquet(self, df: pd.DataFrame, table_name: str) -> str:
        """Saves a dataframe to columnar Parquet locally and uploads to Cloud Data Lake if configured."""
        local_path = PARQUET_DATA_DIR / f"{table_name}.parquet"
        
        # High-performance compression via PyArrow
        df.to_parquet(local_path, compression="snappy", engine="pyarrow", index=False)
        
        if self.mode == "AWS_S3" and self.s3_client:
            try:
                s3_key = f"lakehouse/v1/{table_name}.parquet"
                self.s3_client.upload_file(str(local_path), CloudConfig.S3_BUCKET_NAME, s3_key)
                print(f"[Cloud Storage] Uploaded {table_name} to s3://{CloudConfig.S3_BUCKET_NAME}/{s3_key}")
            except (BotoCoreError, ClientError) as e:
                print(f"[Cloud Storage Error] S3 upload failed: {e}")
                
        return str(local_path)

    def load_parquet(self, table_name: str) -> pd.DataFrame:
        """Loads dataset from local Parquet cache or S3 Cloud Data Lake."""
        local_path = PARQUET_DATA_DIR / f"{table_name}.parquet"
        
        if not local_path.exists() and self.mode == "AWS_S3" and self.s3_client:
            try:
                s3_key = f"lakehouse/v1/{table_name}.parquet"
                self.s3_client.download_file(CloudConfig.S3_BUCKET_NAME, s3_key, str(local_path))
            except Exception as e:
                print(f"[Cloud Storage Error] S3 download failed: {e}")
                
        if local_path.exists():
            return pd.read_parquet(local_path)
        else:
            raise FileNotFoundError(f"Parquet table '{table_name}' not found locally or in cloud lake.")

    def query_sql(self, sql_query: str) -> pd.DataFrame:
        """Runs a direct DuckDB SQL query over local/cloud Parquet files."""
        con = self.get_duckdb_connection()
        # Register local parquet files as tables
        for pfile in PARQUET_DATA_DIR.glob("*.parquet"):
            tbl_name = pfile.stem
            con.execute(f"CREATE VIEW IF NOT EXISTS {tbl_name} AS SELECT * FROM read_parquet('{pfile.as_posix()}')")
            
        result_df = con.execute(sql_query).df()
        con.close()
        return result_df
