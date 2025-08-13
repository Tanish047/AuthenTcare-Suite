# AuthenTcare Suite - Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AuthenTcareSuite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run database migrations**
   ```bash
   npm run migrate
   ```

4. **Generate project index**
   ```bash
   npm run make:index
   ```

## Development

### Start Development Server
```bash
npm start
```
This runs the Electron app in development mode with hot reloading and React DevTools.

### Build for Production
```bash
npm run build
```

### Start Production Build
```bash
npm run start:prod
```

## Testing

### Run Tests
```bash
npm test
```

### Run Tests with CI Reporter
```bash
npm run test:ci
```

## Project Structure

```
src/
├── main.js              # Electron main process
├── preload.js           # Preload script for IPC
├── renderer/            # React frontend
│   ├── components/      # React components
│   ├── context/         # React context providers
│   └── utils/           # Utility functions
├── main/
│   └── ipc/            # IPC handlers
├── services/           # Business logic services
├── storage/
│   └── sqlite/         # Database migrations
└── database/           # Database schema and utilities
```

## Key Features

- **Project Management**: Track medical device projects
- **Device Versioning**: Manage device versions and specifications
- **Market Licensing**: Track regulatory licenses across markets
- **Research Tools**: Built-in web crawler and analysis tools
- **Global Intelligence**: Regulatory news and market trends

## Configuration

The app uses SQLite for local data storage. Database files are stored in the user's application data directory.

## Troubleshooting

### Database Issues
If you encounter database errors, try running:
```bash
npm run migrate
```

### Build Issues
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```