import { createContext, useContext, useState } from 'react';
import { ContextOfDataContext, DataProviderProps, } from './DataContextTypes';
import { useSession } from 'next-auth/react';
import { useMediaQuery } from '@mantine/hooks';

const ContextOfDataContextInstance = createContext<ContextOfDataContext | undefined>(undefined);
    
export function useDataContext() {
    const dataContext = useContext(ContextOfDataContextInstance);
    if (!dataContext) {
        throw new Error('Something went wrong with context provider.');
    }
    return dataContext;
}

export function DataContextProvider({ children }: DataProviderProps) {
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePhotos, setHasMorePhotos] = useState(true);
    const [photos, setPhotos] = useState<any[]>([]);
    const [sortedPhotos, setSortedPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [gapiLoaded, setGapiLoaded] = useState(false);
    const [isGoogleAuthenticated, setGoogleAuthenticated] = useState(false);
    const [isProcessingModalOpen, setProcessingModalOpen] = useState(false);
    const [processedImageCount, setProcessedImageCount] = useState(0);
    const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<string | null>("location-asc");
    const [selectedForTimelapse, setSelectedForTimelapse] = useState<any[]>([]);
    const [filteredPhotos, setFilteredPhotos] = useState<any[]>([]);
    const [imageDuration, setImageDuration] = useState<number>(5);
    const [locationFilter, setLocationFilter] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [timeRange, setTimeRange] = useState<[number, number]>([240, 1200]);
    
    const isLargeScreen = useMediaQuery('(min-width: 1200px)');
    const isMediumScreen = useMediaQuery('(min-width: 768px)');
    const isSmallScreen = useMediaQuery('(min-width: 480px)');

    const [flaggedPhotos, setFlaggedPhotos] = useState<string[]>([]);
    const [showFlaggedOnly, setShowFlaggedOnly] = useState<boolean>(false);
    const [favoritePhotos, setFavoritePhotos] = useState<string[]>([]);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

    const contextValues: ContextOfDataContext = {
        session,
        currentPage,
        setCurrentPage,
        hasMorePhotos,
        setHasMorePhotos,
        photos,
        setPhotos,
        sortedPhotos, setSortedPhotos,
        loading,
        setLoading,
        gapiLoaded,
        setGapiLoaded,
        isGoogleAuthenticated,
        setGoogleAuthenticated,
        isProcessingModalOpen,
        setProcessingModalOpen,
        processedImageCount,
        setProcessedImageCount,
        spreadsheetId,
        setSpreadsheetId,
        sortOption,
        setSortOption,
        selectedForTimelapse,
        setSelectedForTimelapse,
        filteredPhotos,
        setFilteredPhotos,
        imageDuration,
        setImageDuration,
        locationFilter,
        setLocationFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        timeRange,
        setTimeRange,
        isLargeScreen,
        isMediumScreen,
        isSmallScreen,
        flaggedPhotos,
        setFlaggedPhotos,
        showFlaggedOnly,
        setShowFlaggedOnly,
        favoritePhotos,
        setFavoritePhotos,
        showFavoritesOnly,
        setShowFavoritesOnly,
    };

    return (
        <ContextOfDataContextInstance.Provider value={contextValues}>
            {children}
        </ContextOfDataContextInstance.Provider>
    );
}
