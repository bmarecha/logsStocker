import os
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings from environment variables"""

    opensearch_host: str = Field("localhost", env="OPENSEARCH_HOST")
    opensearch_port: int = Field(9200, env="OPENSEARCH_PORT")
    env: str = Field("development", env="ENV")
    seeding: bool = Field(False, env="SEEDING")
    backend_host: str = Field("0.0.0.0", env="BACKEND_HOST")
    backend_port: int = Field(8000, env="BACKEND_PORT")

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
