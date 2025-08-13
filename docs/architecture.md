# AuthenTcare Suite - Architecture Overview

## System Architecture

The AuthenTcare Suite follows a modern Electron architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    RENDERER PROCESS                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                React Frontend                       │   │
│  │  ├── Components (UI)                               │   │
│  │  ├── Context (State Management)                    │   │
│  │  ├── Hooks (Custom Logic)                          │   │
│  │  └── Utils (Helper Functions)                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ contextBridge
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRELOAD SCRIPT                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              IPC API Exposure                       │   │
│  │  ├── dbAPI (Database operations)                   │   │
│  │  ├── themeAPI (Theme management)                   │   │
│  │  ├── webCrawlerAPI (Web scraping)                  │   │
│  │  └── maintenanceAPI (DB maintenance)               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ ipcRenderer/ipcMain
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MAIN PROCESS                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                IPC Handlers                         │   │
│  │  ├── Database Operations                           │   │
│  │  ├── File System Access                            │   │
│  │  ├── Web Crawler Integration                       │   │
│  │  └── System Integration                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Direct calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Business Logic                         │   │
│  │  ├── WebCrawler Service                            │   │
│  │  ├── DataSync Service                              │   │
│  │  ├── ProAnalyser Plugins                           │   │
│  │  └── Plugin Registry                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Database queries
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     STORAGE LAYER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                SQLite Database                      │   │
│  │  ├── Migration System                              │   │
│  │  ├── Schema Management                             │   │
│  │  ├── Full-Text Search (FTS5)                       │   │
│  │  └── Data Persistence                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### Renderer Process (Frontend)
- **React Application**: Modern React 18 with hooks and context
- **Component Architecture**: Modular, reusable UI components
- **State Management**: React Context API with useReducer
- **Styling**: CSS modules with theme support

### Preload Script (Security Bridge)
- **Context Bridge**: Secure communication between renderer and main
- **API Exposure**: Exposes specific APIs to the renderer
- **Security**: Maintains Electron's security model

### Main Process (Backend)
- **IPC Handlers**: Handle communication from renderer
- **System Integration**: File system, OS integration
- **Database Management**: SQLite connection and operations
- **Service Orchestration**: Coordinates business logic services

### Services Layer
- **Web Crawler**: Fetches and parses web content
- **Data Sync**: Handles data synchronization
- **Plugin System**: Extensible analysis tools
- **Business Logic**: Core application functionality

### Storage Layer
- **SQLite Database**: Local data persistence
- **Migration System**: Version-controlled schema changes
- **Full-Text Search**: FTS5 for advanced search capabilities
- **Data Models**: Structured data representation

## Security Model

The application follows Electron's security best practices:

1. **Context Isolation**: Renderer process is isolated from Node.js
2. **Preload Scripts**: Controlled API exposure through context bridge
3. **CSP Headers**: Content Security Policy prevents XSS attacks
4. **Sandboxed Renderer**: Renderer process runs in sandbox mode
5. **No Node Integration**: Direct Node.js access disabled in renderer

## Data Flow

1. **User Interaction**: User interacts with React components
2. **API Call**: Component calls exposed API through window object
3. **IPC Communication**: Preload script sends IPC message to main process
4. **Handler Execution**: Main process IPC handler processes request
5. **Service Call**: Handler calls appropriate service
6. **Database Operation**: Service performs database operations
7. **Response Chain**: Result flows back through the same chain

## Plugin Architecture

The application supports extensible plugins through:

- **Base Plugin Class**: Common interface for all plugins
- **Plugin Registry**: Manages plugin lifecycle
- **Event System**: Plugin communication through events
- **Dynamic Loading**: Plugins loaded at runtime

## Performance Considerations

- **Lazy Loading**: Components loaded on demand
- **Database Indexing**: Optimized queries with proper indexes
- **FTS Integration**: Fast full-text search capabilities
- **Memory Management**: Efficient state management
- **Caching**: Strategic caching of frequently accessed data