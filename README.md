# 🔥 Big Sur Land Trust Fire Recovery Monitoring

## 📋 Overview

The Big Sur Land Trust (BSLT) Fire Recovery Monitoring application is a specialized web platform designed to track environmental recovery following wildfires in the Big Sur region. This admin interface allows BSLT staff to manage, organize, and visualize photographs submitted by community members visiting various recovery sites.

The application integrates directly with Google services (Drive and Sheets) to store photos and metadata, providing a centralized dashboard where administrators can:
- View all submitted photos with associated metadata
- Filter and sort images by location, time, and other criteria
- Flag inappropriate content
- Generate time-lapse videos to visualize recovery over time

This project serves as a vital tool for the BSLT's conservation efforts, enabling better data management and visualization for monitoring environmental change in fire-affected areas.

## 🛠️ Technology Stack

### Core Technologies
- **[Next.js](https://nextjs.org/)** - React framework for server-rendered applications
  - [Documentation](https://nextjs.org/docs)
  - [Learn Tutorial](https://nextjs.org/learn)
  - [GitHub Repository](https://github.com/vercel/next.js)

- **[TypeScript](https://www.typescriptlang.org/)** - Typed JavaScript for improved code quality
  - [Documentation](https://www.typescriptlang.org/docs/)
  - [TypeScript for JS Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
  - [TypeScript Playground](https://www.typescriptlang.org/play)

- **[Mantine UI](https://mantine.dev/)** - Component library for consistent UI elements
  - [Component Documentation](https://mantine.dev/core/getting-started/)
  - [UI Components Gallery](https://ui.mantine.dev/)
  - [GitHub Repository](https://github.com/mantinedev/mantine)

- **Google APIs** - Integration with Google services
  - [Google Drive API](https://developers.google.com/drive/api/v3/about-sdk)
  - [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts)
  - [Google Picker API](https://developers.google.com/drive/api/v3/picker)

- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
  - [Documentation](https://next-auth.js.org/getting-started/introduction)
  - [Google Provider](https://next-auth.js.org/providers/google)
  - [GitHub Repository](https://github.com/nextauthjs/next-auth)

### Package Management
- **[Yarn](https://yarnpkg.com/)** - Fast, reliable dependency management
  - [Installation](https://yarnpkg.com/getting-started/install)
  - [Usage](https://yarnpkg.com/getting-started/usage)

## 📂 Project Structure

```
📁 bslt-fire-recovery/
├── 📁 components/               # React UI components organized by feature
│   ├── 📁 GoogleAPIs/           # Google services integration
│   │   ├── 📄 FolderSelector.tsx    # UI for Google Drive folder selection via Picker API
│   │   ├── 📄 GoogleAPI.tsx         # Core API functions for Drive and Sheets operations
│   │   └── 📄 GoogleSignInButton.tsx # OAuth login button with session display
│   ├── 📁 PhotoGrid/            # Main photo management UI components
│   │   ├── 📄 PhotoGrid.tsx         # Primary grid display with sorting and filtering logic
│   │   ├── 📄 PhotoItem.tsx         # Individual photo card with metadata and action buttons
│   │   └── 📄 Sidebar.tsx           # Controls for filtering, sorting, and timelapse generation
│   └── 📄 IndexComponent.tsx    # Main app wrapper that orchestrates component rendering
├── 📁 pages/                   # Next.js routing and page components
│   ├── 📁 api/                 # Backend API routes handled by Next.js
│   │   ├── 📁 auth/            # Authentication API endpoints
│   │   │   ├── 📄 [...nextauth].ts  # NextAuth configuration with Google provider setup
│   │   │   └── 📄 google.ts         # Google-specific authentication handler
│   ├── 📄 _app.tsx             # Global app wrapper with providers and styles
│   ├── 📄 _document.tsx        # HTML document customization with Google API scripts
│   ├── 📄 index.tsx            # Landing page that redirects to photo grid
│   └── 📄 photoGrid.tsx        # Page component that renders the PhotoGrid
├── 📁 public/                  # Static assets and client-accessible files
│   ├── 📁 static/              # Non-image static resources
│   │   └── 📁 DataContext/     # Global state management
│   │       ├── 📄 DataContext.tsx      # Context provider with photos, filters, and UI state
│   │       └── 📄 DataContextTypes.tsx # TypeScript interfaces for context data
│   └── 📁 utils/               # Utility functions accessible client-side
│       └── 📄 googleDrive.ts   # Helper functions for Google Drive operations
├── 📁 src/                     # Core application source code
│   ├── 📁 hooks/               # Custom React hooks
│   │   └── 📄 useGooglePicker.ts  # Hook for initializing and using Google Picker API
│   └── 📁 types/               # Global TypeScript definitions
│       └── 📄 google-picker.d.ts  # Type definitions for Google Picker integration
├── 📄 .env.local               # Environment variables for API keys and secrets
├── 📄 next.config.mjs          # Next.js configuration for images and headers
├── 📄 package.json             # Dependencies and scripts for the project
└── 📄 tsconfig.json            # TypeScript compiler configuration
```

### Key Directories and Files

#### 🖥️ Core Components
- **PhotoGrid/**: Contains the main UI components for displaying and managing photos
  - `PhotoGrid.tsx` orchestrates the display of photos with filtering and sorting
  - `PhotoItem.tsx` renders individual photo cards with metadata and action buttons
  - `Sidebar.tsx` provides controls for filtering, sorting, and timelapse generation

#### 🔌 Google Integration
- **GoogleAPIs/**: Contains components for Google services integration
  - `GoogleAPI.tsx` provides core functions for interacting with Google Drive and Sheets
  - `GoogleSignInButton.tsx` handles authentication flow and displays user session
  - `FolderSelector.tsx` implements Google Picker for selecting Drive folders

#### 🌍 Pages and Routing
- `pages/_app.tsx`: Sets up global providers including MantineProvider and SessionProvider
- `pages/api/auth/[...nextauth].ts`: Configures NextAuth with Google OAuth and scope permissions
- `pages/photoGrid.tsx`: The main page component that displays the photo grid interface

#### 📊 State Management
- `public/static/DataContext/`: Contains global state management via React Context
  - `DataContext.tsx`: Implements the context provider with all application state
  - `DataContextTypes.tsx`: Defines TypeScript interfaces for strongly-typed state

## 🔑 Critical Functions

Here are the key functions that are crucial to the application's operation:

### Authentication
- **GoogleSignInButton.tsx** - Handles Google authentication flow
  ```typescript
  // Initializes Google Sign-In and manages auth state
  const initializeGoogleSignIn = () => { ... }
  ```

### Data Management
- **DataContext.tsx** - Provides state management across the application
  ```typescript
  // Creates context provider with all application state
  export function DataContextProvider({ children }: DataProviderProps) { ... }
  ```

### Google Integration
- **GoogleAPI.tsx** - Core API functions for Google services
  ```typescript
  // Fetches sheet data from Google Sheets
  export const fetchSheetData = async (spreadsheetId: string, accessToken: String) => { ... }
  
  // Deletes a photo from both Google Drive and the spreadsheet
  export const deletePhoto = async (...) => { ... }
  
  // Extracts the file ID from a Google Drive link
  export const extractFileId = (url: string) => { ... }
  ```

### Google Sheets Integration
- **Sidebar.tsx** - Handles Google Sheets operations
  ```typescript
  // Fetches and processes sheet data
  const fetchSheetData = async (spreadsheetId: string) => { ... }
  
  // Processes raw sheet data into photo objects
  const processSheetData = async (data: any) => { ... }
  
  // Fetches sheet metadata to get sheet information
  const fetchSheetMetadata = async (spreadsheetId: string) => { ... }
  ```

- **PhotoGrid.tsx** - Implements flagging and favoriting functionality
  ```typescript
  // Updates flag status in Google Sheets
  const handleFlagPhoto = async (photo: any, index: number) => { ... }
  
  // Updates favorite status in Google Sheets
  const handleFavoritePhotos = async (photo: any, index: number) => { ... }
  ```

The application relies on a specific Google Sheet structure with the following columns:
| Column | Name | Description |
|--------|------|-------------|
| A | Timestamp | When the photo was uploaded |
| B | Location | Physical location where the photo was taken |
| C | Uploader Name | Name of the person who uploaded the photo |
| D | Upload Date | Date when the photo was taken |
| E | Upload Time | Time when the photo was taken |
| F | File Link | Google Drive link to the full-resolution photo |
| G | Flagged | Whether the photo has been flagged (`Yes` or empty) |
| H | Favorites | Whether the photo has been favorited (`Yes` or empty) |

### Photo Display and Management
- **PhotoGrid.tsx** - Renders the photo grid with filtering and sorting
  ```typescript
  // Filters photos based on selected criteria
  const filterPhotos = () => { ... }
  
  // Handles flagging inappropriate content
  const handleFlagPhoto = async (photo: any, index: number) => { ... }
  ```

### Timelapse Generation and Metadata Processing
- **Sidebar.tsx** - Contains core functionality for data fetching and timelapse generation
  ```typescript
  // Generates timelapse video from selected photos
  const handleGenerateTimelapse = async (): Promise<void> => { ... }
  
  // Fetches metadata about Google Sheet structure
  const fetchSheetMetadata = async (spreadsheetId: string) => { ... }
  
  // Retrieves data from Google Sheets and processes it
  const fetchSheetData = async (spreadsheetId: string) => { ... }
  
  // Processes raw spreadsheet data into structured photo objects
  const processSheetData = async (data: any) => { ... }
  
  // Extracts file ID from Google Drive link formats
  const extractFileId = (url: string) => { ... }
  
  // Fetches thumbnail images for all photos
  const fetchThumbnails = async (photoData: any[]) => { ... }
  
  // Fetches full-resolution image content for timelapse
  const fetchFileContent = async (fileId: string | null) => { ... }
  ```

The Google Sheets integration involves several critical functions that work together:

1. **Metadata Retrieval**:
   - `fetchSheetMetadata` gets structural information about the Google Sheet
   - Used to identify sheet names and properly target API requests
   - Handles fallback methods if sheet names can't be retrieved

2. **Data Fetching**:
   - `fetchSheetData` makes API calls to Google Sheets
   - Retrieves raw photo metadata from the specified spreadsheet
   - Handles authentication and error states

3. **Data Processing**:
   - `processSheetData` transforms raw spreadsheet values into usable objects
   - Maps column data to proper field names
   - Initializes flagging and favorites states

4. **Image Handling**:
   - `extractFileId` parses Google Drive links to get file identifiers
   - `fetchThumbnails` retrieves preview images for the photo grid
   - `fetchFileContent` gets full-resolution images for timelapse creation

The timelapse generation process relies on these metadata functions to:
- Locate the correct files in Google Drive
- Organize photos by metadata (location, date, time)
- Apply filters based on user preferences
- Process images in the correct sequence

## 🔄 Workflow & Setup Guide

### Installation and Setup

#### Prerequisites
- Node.js (v14 or higher)
- Yarn package manager
- Google Cloud Platform account

#### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd bslt-fire-recovery
```

#### Step 2: Install Dependencies
```bash
yarn install
```

#### Step 3: Set Up Google Cloud Platform
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the following APIs:
   - Google Drive API
   - Google Sheets API
   - Google Picker API
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth client ID**
   - Select **Web application**
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-production-domain.com/api/auth/callback/google` (for production)
   - Note your **Client ID** and **Client Secret**
5. Create an API Key:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > API Key**
   - Restrict the key to the APIs you're using (recommended)

#### Step 4: Configure Environment Variables
Create a `.env.local` file with the following variables:
```
GOOGLE_CLIENT_ID=your-client-id-from-google-console
GOOGLE_CLIENT_SECRET=your-client-secret-from-google-console
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-from-google-console
NEXT_PUBLIC_GOOGLE_API_KEY=your-google-api-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-min-32-chars
```

#### Step 5: Start the Development Server
```bash
yarn dev
```

#### Step 6: Open the Application
Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## 👩‍💻 Admin Workflow

### 1. Authentication
- Sign in using your Google account credentials
- The application will request necessary permissions to access Google Drive and Sheets

### 2. Import Google Sheet
- After signing in, click "Import Sheet" button
- Select the Google Sheet containing photo metadata
  - Sheet should have the following columns:
    - Timestamp
    - Location
    - Uploader Name
    - Upload Date
    - Upload Time
    - File Link
    - Flagged (contains "Yes" or is blank)
    - Favorites (contains "Yes" or is blank)

### 3. Browse Photos
- Once the sheet is imported, the photo grid will display all images
- Each photo card shows:
  - Thumbnail image
  - Location information
  - Uploader name
  - Date and time taken
  - Upload timestamp

### 4. Filter and Sort
- Use the sidebar controls to:
  - Sort by location, timestamp, or uploader name
  - Filter by specific location
  - Set date range filters
  - Filter by time of day
  - Show only flagged photos

### 5. Photo Management
The following features are currently working:
- **View Photos**: Click "View" to open the original high-resolution image
- **Flag Photos**: Mark inappropriate or noteworthy content
  - Flagging updates the Google Sheet with a "Yes" value in the Flagged column
  - Flagged photos are visually marked with an icon
- **Favorite Photos**: Mark important or useful photos
  - Favoriting updates the Google Sheet with a "Yes" value in the Favorites column
  - Favorited photos are visually marked with a star icon
- **Delete Photos**: Remove photos from both Google Drive and the spreadsheet
  - Requires confirmation to prevent accidental deletion

### 6. Generate Timelapses
- Select photos for inclusion in timelapse
  - Use individual checkboxes or "Select All" button
- Click "Generate Timelapse" to create a video
- Wait for processing to complete (progress is shown)
- The timelapse will automatically download as a .webm file

## 📊 Feature Details

### Google Sheets Integration

#### Sheet Structure
The application integrates with a specific Google Sheet format with the following columns:

| Column | Name | Description |
|--------|------|-------------|
| A | Timestamp | When the photo was uploaded (e.g., `2025-01-15T09:30:45Z`) |
| B | Location | Physical location where the photo was taken (e.g., `Ridge Trail`) |
| C | Uploader Name | Name of the person who uploaded the photo (e.g., `John Smith`) |
| D | Upload Date | Date when the photo was taken (e.g., `04/01/2024`) |
| E | Upload Time | Time when the photo was taken (e.g., `9:15:32 AM`) |
| F | File Link | Google Drive link to the full-resolution photo |
| G | Flagged | Whether the photo has been flagged (`Yes` or empty) |
| H | Favorites | Whether the photo has been favorited (`Yes` or empty) |

#### File Links
The "File Link" column should contain direct Google Drive links to the photos. These links should be in one of the following formats:
- `https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing`
- Links containing `id={FILE_ID}` parameter

The application automatically extracts the file ID from either format to:
1. Fetch thumbnails for the photo grid display
2. Retrieve full-resolution images for timelapse generation
3. Perform deletion operations when needed

#### Flagging System
- Administrators can flag photos that may be inappropriate or require special attention
- When a photo is flagged, the application updates column G in the Google Sheet with "Yes"
- Flagged photos are visually marked with an icon in the UI
- Users can filter to view only flagged photos

#### Favorites System
- Important or particularly useful photos can be marked as favorites
- When a photo is favorited, the application updates column H in the Google Sheet with "Yes"
- Favorited photos are visually marked with a star icon in the UI
- Users can filter to view only favorited photos
- Favorites can be used to curate photos for timelapses or presentations

### Filtering and Sorting

The application offers multiple ways to filter and sort the photo collection:

- **Sort by**:
  - Location (A-Z or Z-A)
  - Taken time/date (oldest or newest first)
  - Uploader name (A-Z or Z-A)
  - Flagged status
  - Favorites first

- **Filter by**:
  - Specific location
  - Date range
  - Time of day range
  - Show only flagged photos
  - Show only favorited photos

### Timelapse Generation Details

The timelapse generation process follows these steps:

1. The application fetches full-resolution images for all selected photos
2. Each image is processed into multiple frames (for display duration)
3. Frames are combined into a video stream using the browser's MediaRecorder API
4. The resulting WebM video file is automatically downloaded to the user's device

#### Implementation Notes
- The timelapse generation happens entirely in the browser without server processing
- The process can be memory-intensive for large numbers of high-resolution photos
- Progress indicators show both download progress and processing status

## 🚀 Next Steps for Future Development

### 1. Create Public-Facing Interface

Develop a separate view for public users to:

- View approved photos without editing capabilities
- Filter by location to see recovery progress
- View pre-generated timelapses

#### 📱 Public Photo Submission Options

Implement one or more of these approaches to enable public contribution:

- **Web Upload Form**  
  Create a simple, mobile-friendly form where visitors can upload photos directly:
  - Implement basic validation (file type, size, required metadata)
  - Add reCAPTCHA to prevent spam
  - Store submissions in a "pending" state for admin approval

- **Dedicated Email Submission**  
  Set up a dedicated email address (e.g., `bsltfirerecoveryphotoproject@gmail.com`):
  - Create an automated email processor to extract photos and metadata
  - Add email templates for submission confirmation and status updates

- **Location-Based QR Codes**  
  Generate unique QR codes for each monitoring location:
  - Place codes on trailhead signs with simple instructions
  - QR codes open a mobile-optimized submission form pre-filled with location data
  - Include photo examples of what to capture for consistency

- **Custom Mobile Application**  
  Develop a simple BSLT-branded mobile app for iOS and Android:
  - Add camera integration with location tagging
  - Provide educational content about fire recovery monitoring

- **iNaturalist Integration**  
  Partner with [iNaturalist](https://www.inaturalist.org/observations):
  - Create a dedicated BSLT Fire Recovery project
  - Develop an API integration to pull relevant observations automatically [API Docs](https://www.inaturalist.org/pages/api+reference)
  - Add guidelines for proper tagging and documentation

#### Implementation Guidance

- Create new pages in the `pages` directory for public routes
- Implement read-only versions of components
- Add submission handlers and validation
- Create a moderation queue for new submissions

---

### 2. Add User Roles and Permissions

Implement role-based access control:

- **Admin**: Full access to all features
- **Moderator**: Can flag but not delete photos
- **Viewer**: Read-only access to approved content

#### Implementation Guidance

- Extend `NextAuth.js` configuration to include roles
- Add role information to user sessions
- Create middleware to check permissions

---

### 3. Create Tests for All Features

Implement comprehensive testing:

- **Unit Tests**: For utility functions
- **Component Tests**: For UI elements
- **Integration Tests**: For API routes
- **End-to-End Tests**: For critical workflows

#### Implementation Guidance

- Utilize Jest and React Testing Library
- Create test files in a `__tests__` directory
- Add testing scripts to `package.json`

---

### 4. Create New GitHub Repository and Deploy

Since the previous cohort is unreachable:

- Create a new GitHub repository
- Transfer all code with proper documentation
- Set up CI/CD pipelines

#### Deployment Options

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**

---

### 5. Additional Improvements

- Enhance error handling and recovery mechanisms
- Optimize performance for large photo collections
- Add statistics and reporting features
- Implement image processing for better timelapse quality

## 📚 Git Etiquette Guidelines

### Branch Management
- Always create a new branch for your work:
  ```bash
  git checkout -b feature/your-feature-name
  ```
- Use descriptive branch names with prefixes:
  - `feature/` for new features
  - `fix/` for bug fixes
  - `docs/` for documentation updates
  - `refactor/` for code refactoring

### Documentation
- Document your findings and implementation details:
  - Update the README when adding significant features
  - Add inline code comments for complex logic
  - Create or update documentation files in a `docs` directory

### Code Quality
- List working and non-working code:
  - Add `TODO` comments for incomplete features
  - Use `FIXME` comments for known issues
  - Add comments explaining workarounds or limitations

### Commit Messages
- Write clear, descriptive commit messages:
  ```
  feat: Add photo flagging functionality
  
  - Implement flag button in PhotoItem component
  - Add Google Sheets API integration to update flagged status
  - Update UI to show flag icon on flagged photos
  ```

### Pull Requests
- Create detailed pull requests with:
  - Clear description of changes
  - Screenshots if applicable
  - Notes for the next cohort
  - Testing steps

## 🤝 Contributing

This project is maintained by CSUMB service learning students. Please coordinate with the current project manager before making contributions.

### Current Maintainers
- Salvatore Eze - CSUMB Service Learning Student (Spring 2025) - ezesalvatore4@gmail.com 
- Logan Druley- CSUMB Service Learning Student (Spring 2025) - ldruley@csumb.edu

### Previous Contributors
- Shaun Rose - shaunrose831@gmail.com | 831-710-8120
- Noel Hann 

### Contact
For questions or coordination, please contact:
- Jenny Jacox (BSLT Project Stakeholder)