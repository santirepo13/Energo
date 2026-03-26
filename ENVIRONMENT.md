# Environment Configuration

This project supports dynamic URL selection for different environments using environment variables.

## Available Environments

### Home Environment
- **URL**: `http://192.168.2.24:4000`
- **File**: `.env.local.home`
- **Usage**: Copy to `.env.local` when working from home

### College Environment (via Tailscale)
- **URL**: `http://100.76.213.9:4000`
- **File**: `.env.local.college`
- **Usage**: Copy to `.env.local` when working from college

## Usage Instructions

1. **For Home Network**:
   ```bash
   cp .env.local.home .env.local
   npm run dev
   ```

2. **For College Network (Tailscale)**:
   ```bash
   cp .env.local.college .env.local
   npm run dev
   ```

3. **Default Fallback**:
   If no `.env.local` file exists, the application will use `http://192.168.2.24:4000` as the default API URL.

## Configuration Details

- **Vite Proxy**: Automatically uses the `VITE_API_BASE_URL` environment variable for proxy configuration
- **API Client**: Uses the same environment variable for axios baseURL
- **Single Target**: Only one proxy target is active at a time, preventing conflicts

## Environment Variable

The `VITE_API_BASE_URL` variable is used by:
- Vite development server proxy configuration
- Axios API client baseURL
- Both frontend and backend communication

## Notes

- The `.env.local` file is ignored by git (in `.gitignore`)
- Always copy the appropriate environment file to `.env.local` before starting development
- The application will automatically detect and use the configured URL