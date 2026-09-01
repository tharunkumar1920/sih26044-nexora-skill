from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine with thread-safe settings for SQLite/PostgreSQL
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db_schema():
    """Ensure database schema is up-to-date by creating tables and adding any missing columns."""
    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    
    with engine.begin() as conn:
        for model_cls in Base.__subclasses__():
            if hasattr(model_cls, '__tablename__'):
                tname = model_cls.__tablename__
                if tname in inspector.get_table_names():
                    existing_cols = {c['name'] for c in inspector.get_columns(tname)}
                    for col in model_cls.__table__.columns:
                        if col.name not in existing_cols:
                            col_type = col.type.compile(engine.dialect)
                            default_clause = ""
                            if col.default is not None and hasattr(col.default, 'arg'):
                                if isinstance(col.default.arg, str):
                                    default_clause = f" DEFAULT '{col.default.arg}'"
                                elif isinstance(col.default.arg, (bool, int, float)):
                                    default_clause = f" DEFAULT {col.default.arg}"
                            sql = f"ALTER TABLE {tname} ADD COLUMN {col.name} {col_type}{default_clause}"
                            conn.execute(text(sql))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
