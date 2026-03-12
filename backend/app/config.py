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

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            "?charset=utf8mb4"
        )

    class Config:
        env_file = ".env"


settings = Settings()
