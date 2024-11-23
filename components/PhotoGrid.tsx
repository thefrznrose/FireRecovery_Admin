import { useEffect, useState, useRef } from 'react';
import { Grid, Image, Loader, Text, Button, Select, Paper, RangeSlider, Modal, Flex } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function PhotoGrid() {
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 8; // Number of images to fetch per page
    const [startMonth, setStartMonth] = useState<string | null>(null);
    const [startYear, setStartYear] = useState<string | null>(null);
    const [endMonth, setEndMonth] = useState<string | null>(null);
    const [endYear, setEndYear] = useState<string | null>(null);
    const [uniqueLocations, setUniqueLocations] = useState<{ value: string; label: string }[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<{
        image: string;
        location?: string;
        datetime?: string;
        resolution?: string;
    } | null>(null);
    const [selectedPhotoMeta, setSelectedPhotoMeta] = useState<{
        location?: string;
        datetime?: string;
        resolution?: string;
    } | null>(null);
    
    
    const [isModalOpen, setModalOpen] = useState(false);


    // Media queries for responsive grid adjustments
    const observer = useRef<IntersectionObserver | null>(null);

    // Media queries for responsive grid adjustments
    const isLargeScreen = useMediaQuery('(min-width: 1200px)');
    const isMediumScreen = useMediaQuery('(min-width: 768px)');
    const isSmallScreen = useMediaQuery('(min-width: 480px)');

    const fetchPhotos = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/images?page=${page}&pageSize=${pageSize}`
            );
            const data = await response.json();

            if (Array.isArray(data)) {
                // Combine new photos with existing ones
                setPhotos((prevPhotos) => [...prevPhotos, ...data]);

                // Extract unique locations
                const locations = [...new Set(data.map((photo) => photo.location))]
                    .filter((loc) => loc) // Filter out null or undefined locations
                    .map((loc) => ({ value: loc, label: loc }));
                
                setUniqueLocations((prevLocations) => {
                    const existingValues = prevLocations.map((loc) => loc.value);
                    const newLocations = locations.filter((loc) => !existingValues.includes(loc.value));
                    return [...prevLocations, ...newLocations];
                });

                if (data.length < pageSize) setHasMore(false);
            } else {
                console.error('Unexpected response format');
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setLoading(false);
        }
    };
    // Trigger fetchPhotos when `page` changes
    useEffect(() => {
        if (hasMore) {
            fetchPhotos();
        }
    }, [page]);

    const lastPhotoElementRef = (node: HTMLElement | null) => {
        if (loading || !hasMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setPage((prevPage) => prevPage + 1); // Load next page
            }
        });

        if (node) observer.current.observe(node);
    };

    const handleImageClick = async (imageId: number) => {
        setSelectedPhoto(null);
        try {
            setLoading(true); // Optionally show a loader while fetching
            setModalOpen(true);
            const response = await fetch(`http://localhost:5000/images/full/${imageId}`);
            const data = await response.json();
    
            if (data && data.image) {
                setSelectedPhoto(data.image);
                setSelectedPhotoMeta({
                                    // image: data.image,
                                    location: data.location || 'Unknown Location',
                                    datetime: data.datetime || 'Unknown Date',
                                    resolution: `${data.width || 'N/A'} x ${data.height || 'N/A'}`,
                                });
                
            } else {
                console.error('Failed to fetch full-resolution image.');
            }
        } catch (error) {
            console.error('Error fetching full-resolution image:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // const handleImageClick = async (imageId: number) => {
    //     setSelectedPhoto(null);
    //     try {
    //         setLoading(true); // Optionally show a loader while fetching
    //         setModalOpen(true);
    
    //         // Fetch full-resolution image and metadata
    //         const response = await fetch(`http://localhost:5000/images/full/${imageId}`);
    //         const data = await response.json();
    
    //         if (data && data.image) {
    //             setSelectedPhoto({
    //                 image: data.image,
    //                 location: data.location || 'Unknown Location',
    //                 datetime: data.datetime || 'Unknown Date',
    //                 resolution: `${data.width || 'N/A'} x ${data.height || 'N/A'}`,
    //             });
    //         } else {
    //             console.error('Failed to fetch full-resolution image.');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching full-resolution image:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    


    const handleDelete = async (photoId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/images/${photoId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== photoId));
            } else {
                console.error('Error deleting photo');
            }
        } catch (error) {
            console.error('Error deleting photo:', error);
        }
    };

    const filteredPhotos = filter
        ? photos.filter((photo) => photo.location === filter)
        : photos;
    console.log('Photo locations:', photos.map((photo) => photo.location));
    console.log(filter)


    return (
        <>
        <Grid>
            {/* Sidebar */}
            <Grid.Col span={2.75}>
                <Paper
                    withBorder
                    style={{
                        padding: '2rem', // Increased padding for more space
                        boxShadow: 'sm',
                        height: '100vh',
                        position: 'sticky',
                        top: 0,
                    }}
                >
                    <Text size="lg" mb="sm" style={{ fontWeight: 500 }}>
                        Filters
                    </Text>
                    <Select
                            label="Post Location"
                            placeholder="Select a location"
                            data={uniqueLocations} // Use dynamically generated locations
                            value={filter}
                            onChange={setFilter}
                        />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
                        <Select
                            label="Start Month"
                            placeholder="Select month"
                            data={[
                                { value: '1', label: 'January' },
                                { value: '2', label: 'February' },
                                { value: '3', label: 'March' },
                                { value: '4', label: 'April' },
                                { value: '5', label: 'May' },
                                { value: '6', label: 'June' },
                                { value: '7', label: 'July' },
                                { value: '8', label: 'August' },
                                { value: '9', label: 'September' },
                                { value: '10', label: 'October' },
                                { value: '11', label: 'November' },
                                { value: '12', label: 'December' },
                            ]}
                            value={startMonth}
                            onChange={setStartMonth}
                        />
                        <Select
                            label="Start Year"
                            placeholder="Select year"
                            data={[
                                { value: '2022', label: '2022' },
                                { value: '2023', label: '2023' },
                                { value: '2024', label: '2024' },
                            ]}
                            value={startYear}
                            onChange={setStartYear}
                        />
                        <Text style={{ fontSize: '1rem', fontWeight: 'bold' }}>-</Text>
                        <Select
                            label="End Month"
                            placeholder="Select month"
                            data={[
                                { value: '1', label: 'January' },
                                { value: '2', label: 'February' },
                                { value: '3', label: 'March' },
                                { value: '4', label: 'April' },
                                { value: '5', label: 'May' },
                                { value: '6', label: 'June' },
                                { value: '7', label: 'July' },
                                { value: '8', label: 'August' },
                                { value: '9', label: 'September' },
                                { value: '10', label: 'October' },
                                { value: '11', label: 'November' },
                                { value: '12', label: 'December' },
                            ]}
                            value={endMonth}
                            onChange={setEndMonth}
                        />
                        <Select
                            label="End Year"
                            placeholder="Select year"
                            data={[
                                { value: '2022', label: '2022' },
                                { value: '2023', label: '2023' },
                                { value: '2024', label: '2024' },
                            ]}
                            value={endYear}
                            onChange={setEndYear}
                        />
                    </div>
                    <RangeSlider
                        style={{ marginTop: '2rem', marginBottom: '2rem',  marginRight: '1rem',  marginLeft: '1rem' }}
                        label={(value) => {
                            const hours = Math.floor(value / 60);
                            const minutes = value % 60;
                            const period = hours < 12 ? 'AM' : 'PM';
                            const formattedHours = hours % 12 || 12; // Convert 0 to 12
                            const formattedMinutes = minutes.toString().padStart(2, '0');
                            return `${formattedHours}:${formattedMinutes} ${period}`;
                        }}
                        marks={[
                            { value: 0, label: '12:00 AM' },
                            { value: 360, label: '6:00 AM' },
                            { value: 720, label: '12:00 PM' },
                            { value: 1080, label: '6:00 PM' },
                            { value: 1439, label: '11:59 PM' },
                        ]}
                        min={0}
                        max={1439}
                        step={15} // Increment in 15-minute intervals
                        defaultValue={[360, 1080]} // Default to 6:00 AM - 6:00 PM
                        onChange={(value) => {
                            const [start, end] = value;
                            console.log('Start time in minutes:', start, 'End time in minutes:', end);
                        }}
                    />
                    <Button
                        mt="md"
                        fullWidth
                        variant="outline"
                        onClick={() => {
                            setStartMonth(null);
                            setStartYear(null);
                            setEndMonth(null);
                            setEndYear(null);
                        }}
                    >
                        Clear Date Range
                    </Button>
                </Paper>
            </Grid.Col>

            {/* Main Content */}
            <Grid.Col span={9}>
            <Grid gutter="lg" columns={12}>
            {filteredPhotos.map((photo, index) => {
                // Parse the datetime field into a JavaScript Date object
                const parsedDate = new Date(photo.datetime);

                // Format the date as MM/DD/YYYY
                const formattedDate = `Date: ${parsedDate.getMonth() + 1}/${parsedDate.getDate()}/${parsedDate.getFullYear()}`;

                // Format the time as h:mm am/pm
                const hours = parsedDate.getHours();
                const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
                const period = hours < 12 ? 'am' : 'pm';
                const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
                const formattedTime = `Time: ${formattedHours}:${minutes} ${period}`;

                // Check if this is the last photo element
                const isLastElement = index === filteredPhotos.length - 1;

                return (
                    <>
                    <Grid.Col
                        key={photo.id}
                        span={isLargeScreen ? 3 : isMediumScreen ? 4 : isSmallScreen ? 6 : 12}
                        ref={isLastElement ? lastPhotoElementRef : null}
                    >
                        <Paper
                            withBorder
                            shadow="md"
                            radius="md"
                            style={{
                                height: '450px',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                gap: '0.5rem',
                            }}
                        >
                            {/* Image Section */}
                            <div
                                style={{
                                    width: '100%',
                                    height: '70%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onClick={() => handleImageClick(photo.id)} // Pass photo ID to fetch full-resolution image
                            >
                                <Image
                                    style={{
                                        objectFit: 'contain',
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                    }}
                                    src={`data:image/jpeg;base64,${photo.image}`}
                                    alt={`Photo ${photo.id}`}
                                />
                            </div>
                            {/* Information and Delete Section */}
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '0.5rem',
                                }}
                            >
                                {/* Left Side Information */}
                                <div style={{ textAlign: 'left' }}>
                                    <Text>Location: {photo.location}</Text>
                                    <Text size="sm">Upload {formattedDate}</Text>
                                    <Text color="dimmed" size="sm">{formattedTime}</Text>
                                    <Text size="sm">{`Resolution: ${photo.width || 'N/A'} x ${photo.height || 'N/A'}`}</Text>
                                    <Text size="sm">{`Uploader: ${photo.uploaderName || '[Uploader]'}`}</Text>
                                </div>

                                {/* Right Side Delete Button */}
                                <Button
                                    color="red"
                                    onClick={() => handleDelete(photo.id)}
                                    size="sm"
                                >
                                    Delete
                                </Button>
                            </div>
                        </Paper>
                    </Grid.Col>
                    </>
                );
            })}
        </Grid>

                {loading && <Loader size="lg" style={{ margin: '2rem auto' }} />}
            </Grid.Col>
        </Grid>
        <Modal
    opened={isModalOpen}
    onClose={() => setModalOpen(false)}
    centered
    fullScreen
    title={
        selectedPhoto && (
            <>
                <Flex gap="lg">
                    <Text>
                        <span style={{ fontWeight: 'bold' }}>Location:</span> {selectedPhotoMeta?.location}
                    </Text>
                    <Text>
                        <span style={{ fontWeight: 'bold' }}>Date:</span> {String(selectedPhotoMeta?.datetime)}
                    </Text>
                    <Text>
                        <span style={{ fontWeight: 'bold' }}>Resolution:</span> {selectedPhotoMeta?.resolution}
                    </Text>
                </Flex>
            </>
        )
    }
    styles={{
        content: {
            height: '100vh', // Ensure modal height fits viewport
            maxHeight: '100vh', // Prevent overflow beyond viewport height
            display: 'flex',
            flexDirection: 'column',
        },
    }}
>
    {selectedPhoto ? (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1, // Ensure image container takes up remaining space
                overflow: 'auto',
                backgroundColor: 'black',
            }}
        >
            <Image
                src={`data:image/jpeg;base64,${selectedPhoto}`}
                alt="Full-Resolution Photo"
                style={{
                    maxHeight: '100vh', // Adjust max height to leave space for title and close button
                    maxWidth: '100vw', // Adjust max width
                    // objectFit: 'contain', // Ensure the image fits properly
                    // cursor: 'zoom-in'
                }}
                // onClick={(e) => {
                //     e.currentTarget.style.transform =
                //         e.currentTarget.style.transform === 'scale(1.5)'
                //             ? 'scale(1)'
                //             : 'scale(1.5)';
                //     e.currentTarget.style.cursor =
                //         e.currentTarget.style.transform === 'scale(1.5)'
                //             ? 'zoom-out'
                //             : 'zoom-in';
                // }}

            />
        </div>
    ) : (
        <Loader size="lg" />
    )}
</Modal>



        </>
    );
}
