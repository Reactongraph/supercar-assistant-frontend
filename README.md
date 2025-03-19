# SuperCar Virtual Sales Assistant - Frontend

A modern, responsive web application that provides an AI-powered virtual sales assistant for SuperCar dealerships. The application features a real-time chat interface with streaming responses and various interactive tools.

## Key Features

### Chat Interface

- Real-time message streaming with SSE (Server-Sent Events)
- Persistent chat sessions with local storage
- Session management (create, rename, delete)
- Message history preservation
- Responsive design for mobile and desktop

### Interactive Tools

- **Weather Information**

  - Real-time weather data display
  - Dynamic weather icons and conditions
  - Temperature, humidity, and wind speed metrics

- **Dealership Information**

  - Detailed dealership profiles
  - Business hours and contact information
  - Interactive location maps
  - Address and directions

- **Appointment Management**
  - Interactive time slot selection
  - Test drive scheduling
  - Appointment confirmation system
  - Calendar integration

### Technical Features

- Server-Side Rendering (SSR) with Next.js
- TypeScript for type safety
- Real-time updates with hot reloading
- Docker containerization
- Environment-based configuration
- Error handling and retry mechanisms
- Responsive Tailwind CSS design

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional, for containerized development)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Quick Start

### Local Development

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Development

1. Start the development environment:

   ```bash
   docker-compose up
   ```

2. Access the application at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx    # Root layout component
│   │   └── page.tsx      # Main page component
│   ├── components/       # React components
│   │   ├── Chat.tsx      # Main chat interface
│   │   ├── ToolOutput/   # Tool-specific components
│   │   └── ui/           # Reusable UI components
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/              # Static assets
├── styles/             # Global styles
└── docker/             # Docker configuration
```

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Application Configuration
NEXT_PUBLIC_APP_NAME=SuperCar Assistant
NEXT_PUBLIC_APP_ENV=development

# Feature Flags
NEXT_PUBLIC_ENABLE_WEATHER=true
NEXT_PUBLIC_ENABLE_APPOINTMENTS=true
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Docker Commands

### Development

```bash
# Start development environment
docker-compose up

# Stop development environment
docker-compose down
```

### Production

```bash
# Build production image
docker build --target production -t supercar-assistant-frontend .

# Run production container
docker run -p 3000:3000 supercar-assistant-frontend
```

## Component Features

### Chat Component

- Real-time message streaming
- Message history preservation
- Session management
- Responsive design
- Tool integration
- Error handling and retry logic

### Tool Components

- Weather display with dynamic icons
- Dealership information cards
- Interactive appointment scheduling
- Address and location services

### UI Components

- Responsive modals
- Custom buttons
- Loading indicators
- Error messages
- Toast notifications

## Error Handling

The application implements comprehensive error handling:

- Network connectivity checks
- Retry mechanism for failed requests
- Graceful degradation
- User-friendly error messages
- Debug logging

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.

## Troubleshooting

### Common Issues

1. **Docker Compose Environment Error**

   ```bash
   ERROR: Couldn't find env file
   ```

   Solution: Create the .env file before running docker-compose:

   ```bash
   cp .env.example .env
   # or manually create .env with required variables
   ```

2. **Port Already in Use**

   ```bash
   Error: listen tcp 0.0.0.0:3000: bind: address already in use
   ```

   Solution: Stop any running services on port 3000 or change the port in docker-compose.yml:

   ```bash
   ports:
     - "3001:3000"  # Maps container port 3000 to host port 3001
   ```

3. **Node Modules Issues**
   If you encounter node_modules related errors:

   ```bash
   # Remove node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

4. **Docker Permission Issues**
   If you encounter permission issues with Docker:
   ```bash
   # Run Docker commands with sudo or add user to docker group
   sudo docker-compose up
   # or
   sudo usermod -aG docker $USER  # Requires logout/login
   ```

### Development Workflow

1. Always ensure `.env` file exists before starting:

   ```bash
   test -f .env || cp .env.example .env
   ```

2. For clean Docker setup:

   ```bash
   # Stop and remove containers, networks
   docker-compose down

   # Remove volumes if needed
   docker-compose down -v

   # Start fresh
   docker-compose up --build
   ```

3. Checking logs:

   ```bash
   # View logs
   docker-compose logs

   # Follow logs
   docker-compose logs -f
   ```
