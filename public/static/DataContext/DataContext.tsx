import { createContext, useContext, useState } from 'react';
import { ContextOfDataContext, DataProviderProps, } from './DataContextTypes';

const ContextOfDataContextInstance = createContext<ContextOfDataContext | undefined>(undefined);

export function useDataContext() {
    const dataContext = useContext(ContextOfDataContextInstance);
    if (!dataContext) {
        throw new Error('Something went wrong with context provider.');
    }
    return dataContext;
}

export function DataProvider({ children }: DataProviderProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMorePhotos, setHasMorePhotos] = useState(true);
    const [photos, setPhotos] = useState<any[]>([]);
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


    const contextValues: ContextOfDataContext = {
        currentPage,
        setCurrentPage,
        hasMorePhotos,
        setHasMorePhotos,
        photos,
        setPhotos,
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
    };

    return (
        <ContextOfDataContextInstance.Provider value={contextValues}>
            {children}
        </ContextOfDataContextInstance.Provider>
    );
}
