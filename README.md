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
│   │   ├── main.py         # FastAPI app with endpoints (GET /logs/search, POST /logs)
│   │   ├── config.py       # Configuration from environment variables
│   │   └── scripts/
│   │       └── seed.py     # One-time database seeding with sample data
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── entrypoint.sh       # Container startup script
│
├── frontend/               # React + TypeScript + Vite application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── LogForm.tsx           # Manual log creation form
│   │   │   ├── LogFilters.tsx        # Search and filter panel
│   │   │   ├── LogsList.tsx          # Logs list display
│   │   │   └── LogsStatistics.tsx    # Pie chart visualization
│   │   ├── services/
│   │   │   └── logsApi.ts           # Axios API client
│   │   ├── types/
│   │   │   └── log.ts               # TypeScript types and styles
│   │   ├── App.tsx                  # Main application component
│   │   ├── main.tsx                 # Vite entry point
│   │   └── index.css                # Tailwind styles
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   ├── vite.config.ts      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── Dockerfile          # Frontend container
│   └── .env                # Environment variables
│
├── docker-compose.yml      # Service orchestration (OpenSearch, Backend, Frontend)
├── .env                    # Root environment variables (single source of truth)
└── .gitignore              # Git ignore rules
```

## Quick Start

### Prerequisites
- Docker & Docker Compose

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
- `BACKEND_HOST`: Backend server bind address (default: 0.0.0.0)
- `BACKEND_PORT`: Backend server port (default: 8000)
- `SEEDING`: Enable one-time data seeding (default: true)
- `SEEDING_SIZE`: Number of logs to seed (default: 50)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)
- `FRONTEND_PORT`: Frontend dev server port (default: 5173)

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [OpenSearch Documentation](https://opensearch.org/docs/)