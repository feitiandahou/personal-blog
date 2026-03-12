from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DB_USER: str = "root"
    DB_PASSWORD: str = "123456"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "personal_blog"

    # JWT
    SECRET_KEY: str = "change-me-to-a-random-secret-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB

    # Public site / CORS
    SITE_URL: str = "http://localhost:5173"
    FRONTEND_ORIGINS: str = Field(
        default=(
            "http://localhost:5173,"
            "http://127.0.0.1:5173,"
            "http://localhost:8000,"
            "http://127.0.0.1:8000"
        )
    )

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            "?charset=utf8mb4"
        )

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [origin.strip() for origin in self.FRONTEND_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
