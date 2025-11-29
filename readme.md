# ModelMarkt Backend

A lightweight marketplace for fast classification APIs. Users can upload pretrained vision models (e.g., fruit-freshness classifier, dog detector, etc.), test them in an interactive playground, and generate API keys to call them programmatically.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Python 3** (v3.8 or higher recommended)
- **npm** (comes with Node.js)

## Installation

### 1. Set up Python Virtual Environment

Create and activate a Python virtual environment, then install the required dependencies:

```bash
# Navigate to the project directory
cd modelmarkt

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate

# Install Python dependencies
pip install tensorflow tensorflow-hub numpy pillow
```

### 2. Install Node.js Dependencies

```bash
npm install
```

## Running the Application

### Development Mode

With the virtual environment activated, run the server using `ts-node`:

```bash
npx ts-node src/index.ts
```

Or use the npm dev script (with nodemon for auto-reload):

```bash
npm run dev
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

| Method | Endpoint                 | Description                       |
| ------ | ------------------------ | --------------------------------- |
| `GET`  | `/`                      | Health check - returns API status |
| `GET`  | `/models`                | Returns list of available models  |
| `POST` | `/models/:id`            | Runs inference on a model         |
| `POST` | `/upload`                | Uploads a new trained model       |
| `POST` | `/apikey/create`         | Creates a new API key for a user  |
| `GET`  | `/apikey/get?userId=XXX` | Retrieves an existing API key     |

## Project Structure

```
modelmarkt/
├── src/
│   ├── index.ts          # Main entry point
│   ├── inference/
│   │   └── run.py        # Python inference script
│   ├── middleware/       # Express middlewares
│   ├── routes/           # API route handlers
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── models/               # Stored ML models and metadata
│   ├── models.json       # Model registry
│   └── *.keras / *.h5    # Keras model files
├── apikeys.json          # API key storage
├── package.json
├── tsconfig.json
└── venv/                 # Python virtual environment
```

## Environment Variables

| Variable | Default | Description             |
| -------- | ------- | ----------------------- |
| `PORT`   | `3001`  | Port the server runs on |

## Notes

- Make sure the Python virtual environment is activated before running the server, as the inference script requires TensorFlow.
- Models are stored in the `/models` directory as `.keras` or `.h5` files.
- This is a hackathon-optimized build using file-based storage (no database required).
