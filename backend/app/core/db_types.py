"""
Database type helpers for cross-database compatibility.
"""
from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB as PGJSONB
from sqlalchemy.types import TypeDecorator, CHAR
import uuid as uuid_lib


# Use JSONB for PostgreSQL, JSON for SQLite/others
class JSON_TYPE(TypeDecorator):
    """
    Platform-independent JSON type.
    Uses JSONB on PostgreSQL, JSON on others.
    """
    impl = JSON
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PGJSONB())
        else:
            return dialect.type_descriptor(JSON())


# UUID type that works across databases
class UUID_TYPE(TypeDecorator):
    """
    Platform-independent UUID type.
    Uses native UUID on PostgreSQL, CHAR(36) on others.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PGUUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, uuid_lib.UUID):
                return str(value)
            return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if isinstance(value, str):
                return uuid_lib.UUID(value)
            return value
