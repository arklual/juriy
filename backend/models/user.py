from sqlalchemy import Boolean, Column, String, Integer
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=True)  # Может быть null для соц. авторизации
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    
    # Поля для социальной авторизации
    vk_id = Column(String, unique=True, nullable=True)
    telegram_id = Column(String, unique=True, nullable=True) 