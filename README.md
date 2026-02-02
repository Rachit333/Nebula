# Nebulux - AI Powered Code Editor

An intelligent, web-based code editor powered by Google's Gemini AI that helps developers write, understand, and refactor code faster. Nebulux combines a modern IDE experience with AI-assisted code generation and a live preview environment.

## Features

- **AI Code Generation**: Generate complete code files using natural language prompts with Google Gemini integration
- **Live Code Editor**: Monaco Editor-based code editor with syntax highlighting and intelligent editing
- **Live Preview**: Real-time preview of React/JavaScript projects using Sandpack
- **Project Management**: Create, save, and manage multiple projects with persistent storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Authentication**: Secure authentication powered by Firebase
- **Cloud Sync**: Optional cloud synchronization with Upstash Redis
- **Theme Support**: Dark and light mode with persistent preferences
- **Conversational AI**: Multi-turn conversations with chat history for contextual code generation
- **AI Clarifications**: AI can ask clarifying questions when requirements are ambiguous
- **Todo Management**: Built-in todo lists for project tasks with priorities and tags

## Tech Stack

**Frontend:**
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Monaco Editor** - Advanced code editor
- **Sandpack** - React component sandbox for live preview
- **Radix UI** - Accessible component primitives
- **Zustand** - State management
- **Next-Themes** - Theme management

**Backend & Services:**
- **Firebase** - Authentication and real-time database
- **Google Gemini AI** - Code generation and AI features
- **Upstash Redis** - Cloud caching and project sync
- **Next.js API Routes** - Serverless backend functions

## Project Structure

```
nebulux/
├── app/
│   ├── api/
│   │   ├── ai/generate/       # AI code generation endpoint
│   │   └── upstash/push/      # Cloud sync endpoint
│   ├── login/                 # Login page
│   ├── studio/                # Main editor interface
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Project home page
│   └── globals.css            # Global styles
├── components/
│   ├── AICodeGenerator.tsx    # AI prompt interface
│   ├── CodeEditor.tsx         # Editor component
│   ├── LivePreview.tsx        # Preview component
│   ├── Toolbar.tsx            # File tree toolbar
│   ├── AuthPanel.tsx          # Authentication UI
│   ├── StudioClient.tsx       # Main studio layout
│   └── ui/                    # Radix UI components
├── hooks/
│   ├── useAICodeGeneration.ts # AI generation logic
│   ├── useProjectStore.ts     # Project/file state
│   └── useProjectsStore.ts    # Projects list state
├── lib/
│   ├── firebaseClient.ts      # Firebase setup
│   ├── upstashClient.ts       # Redis integration
│   └── utils.ts               # Utility functions
└── public/                    # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- Firebase project credentials
- Google Gemini API key
- Upstash Redis credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nebulux
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following credentials:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key

   # Upstash Redis (Optional)
   UPSTASH_REDIS_REST_URL=your_upstash_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Project

1. Click "Create New" on the home page
2. Enter a project name and description
3. Your project will be created with default React starter files

### Using AI Code Generation

1. Open a project and navigate to the studio
2. In the right sidebar, enter a natural language prompt describing what you want to build
3. Press `Ctrl+Enter` or click "Generate"
4. The AI will generate code files which you can review and apply to your project
5. Continue the conversation for iterative improvements

### Editing Code

1. Select files from the file tree on the left
2. Edit code in the Monaco Editor
3. Changes are automatically reflected in the Live Preview on the right
4. Save your project using the project menu

### Managing Projects

- **Save**: Persist all changes to localStorage
- **Load**: Reload a previously saved project
- **Delete**: Remove a project permanently

## Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google Sign-in)
3. Download service account credentials
4. Add credentials to `.env.local`

### Gemini API Setup

1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to `.env.local` as `GEMINI_API_KEY`

### Upstash Redis (Optional)

1. Create account at [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy REST API credentials to `.env.local`

## API Endpoints

### POST `/api/ai/generate`
Generates code based on a prompt using Gemini AI.

**Request:**
```json
{
  "prompt": "Create a React component for a todo list"
}
```

**Response:**
```json
{
  "files": {
    "/src/TodoList.js": "component code here..."
  },
  "chat": "I've created a responsive todo list component",
  "mergeStrategy": {
    "/src/TodoList.js": "replace"
  }
}
```

### POST `/api/upstash/push`
Pushes project data to cloud storage (requires authentication).

## Development

### Building

```bash
pnpm build
```

### Running Production Build

```bash
pnpm start
```

### Code Quality

The project uses:
- TypeScript for type safety
- Tailwind CSS for consistent styling
- Radix UI for accessible components

## Project State Management

The application uses **Zustand** for state management with two main stores:

- **`useProjectStore`**: Manages files, unsaved changes, and current project data
- **`useProjectsStore`**: Manages the list of projects and metadata

All project data is stored in localStorage for persistence.

## Features in Development

- [ ] Collaborative editing
- [ ] Additional AI models support
- [ ] Code linting and formatting
- [ ] Git integration
- [ ] Terminal integration
- [ ] Package installation UI

## Known Limitations

- Projects are stored locally in browser localStorage (limited to ~5-10MB)
- Cloud sync requires authentication and Upstash Redis setup
- AI generation works best with clear, specific prompts
- Preview is limited to React/JavaScript projects

## Troubleshooting

### Firebase Connection Issues
- Verify credentials in `.env.local`
- Check Firebase project permissions
- Ensure CORS is configured correctly

### AI Generation Failures
- Check that `GEMINI_API_KEY` is valid
- Verify API quota hasn't been exceeded
- Try simpler prompts first

### Storage Issues
- Clear localStorage if projects fail to load
- Check browser storage quota
- Enable IndexedDB for better performance

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is proprietary. Created by Rachit Jasoria.

## Support

For issues and questions, please open an issue in the repository.

---

**Made with ❤️ by Rachit Jasoria**
