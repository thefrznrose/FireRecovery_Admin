import { ReactNode } from 'react';
import { Session } from 'next-auth';

// Define a Photo interface to store photo-related data
export interface Photo {
    id: string;
    location: string;
    timestamp: string; // Full ISO datetime string
    uploadDate: string; // e.g., "2024/01/26"
    uploadTime: string; // e.g., "15:45:00"
    uploaderName: string,
    fileLink: string;
    thumbnailLink: string;
    description: string;
    url: string;
    name: string;
    isSelectedForTimelapse: boolean;
}

// Define the Context type for the Data Context
export interface ContextOfDataContext {
    session: Session | null,
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    hasMorePhotos: boolean;
    setHasMorePhotos: React.Dispatch<React.SetStateAction<boolean>>;
    photos: Photo[];
    setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
    sortedPhotos: Photo[];
    setSortedPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    gapiLoaded: boolean;
    setGapiLoaded: React.Dispatch<React.SetStateAction<boolean>>;
    isGoogleAuthenticated: boolean;
    setGoogleAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    isProcessingModalOpen: boolean;
    setProcessingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    processedImageCount: number;
    setProcessedImageCount: React.Dispatch<React.SetStateAction<number>>;
    spreadsheetId: string | null;
    setSpreadsheetId: React.Dispatch<React.SetStateAction<string | null>>;
    sortOption: string | null;
    setSortOption: React.Dispatch<React.SetStateAction<string | null>>;
    selectedForTimelapse: Photo[];
    setSelectedForTimelapse: React.Dispatch<React.SetStateAction<Photo[]>>;
    filteredPhotos: Photo[];
    setFilteredPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
    imageDuration: number;
    setImageDuration: React.Dispatch<React.SetStateAction<number>>;
    locationFilter: string | null;
    setLocationFilter: React.Dispatch<React.SetStateAction<string | null>>;
    startDate: string;
    setStartDate: React.Dispatch<React.SetStateAction<string>>;
    endDate: string;
    setEndDate: React.Dispatch<React.SetStateAction<string>>;
    timeRange: [number, number];
    setTimeRange: React.Dispatch<React.SetStateAction<[number, number]>>;
    isLargeScreen: Boolean | undefined;
    isMediumScreen: Boolean | undefined;
    isSmallScreen: Boolean | undefined;
    flaggedPhotos: string[]; // Array of photo identifiers (timestamps) that are flagged
    setFlaggedPhotos: React.Dispatch<React.SetStateAction<string[]>>;
    showFlaggedOnly: boolean; // Flag to toggle viewing only flagged photos
    setShowFlaggedOnly: React.Dispatch<React.SetStateAction<boolean>>;
    favoritePhotos: string[]; // Array of photo identifiers (timestamps) that are marked as favorites
    setFavoritePhotos: React.Dispatch<React.SetStateAction<string[]>>;
    showFavoritesOnly: boolean; // Flag to toggle viewing only favorite photos
    setShowFavoritesOnly: React.Dispatch<React.SetStateAction<boolean>>;
}

// Data Provider props interface
export interface DataProviderProps {
    children: ReactNode;
}
