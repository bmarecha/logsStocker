# LogsStock - Fullstack Application

A modern fullstack web application built with:
- **Backend**: FastAPI (Python)
- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Database**: OpenSearch (Docker)

## Project Structure

```
.
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── config.py       # Configuration
│   │   └── main.py         # FastAPI app entry point
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── .env                # Environment variables
│
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Tailwind styles
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   ├── tsconfig.json       # TypeScript config
│   ├── vite.config.ts      # Vite config
│   ├── tailwind.config.js  # Tailwind config
│   ├── Dockerfile          # Frontend container
│   └── .env                # Environment variables
│
├── docker-compose.yml      # Container orchestration
└── .gitignore              # Git ignore rules
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Running with Docker Compose

```bash
docker-compose up
```

Then visit:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **OpenSearch**: http://localhost:9200
- **API Docs**: http://localhost:8000/docs

## Environment Variables

### Backend (.env)
- `OPENSEARCH_HOST`: OpenSearch host (default: localhost)
- `OPENSEARCH_PORT`: OpenSearch port (default: 9200)
- `ENV`: Environment (development/production)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [OpenSearch Documentation](https://opensearch.org/docs/)

## Production Deployment

TODO