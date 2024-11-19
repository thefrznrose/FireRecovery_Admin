import { useEffect, useState, useRef } from 'react';
import { Grid, Image, Loader, Text, Button, Select, Paper } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function PhotoGrid() {
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 12; // Number of images to fetch per page

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
                setPhotos((prevPhotos) => [...prevPhotos, ...data]);
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
        ? photos.filter((photo) => photo.category === filter)
        : photos;

    return (
        <Grid>
            {/* Sidebar */}
            <Grid.Col span={3}>
                <Paper
                    withBorder
                    style={{
                        padding: '2rem',
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
                        data={[
                            { value: '#BSLTfire01', label: '#BSLTfire01 Riparian zone' },
                            { value: '#BSLTfire02', label: '#BSLTfire02 Redwood & tanoak habitat' },
                            { value: '#BSLTfire03', label: '#BSLTfire03 Upland redwood & tanoak habitat' },
                            { value: '#BSLTfire04', label: '#BSLTfire04 Grassland habitat' },
                            { value: '#BSLTfire05', label: '#BSLTfire05 Chaparral habitat' },
                        ]}
                        value={filter}
                        onChange={setFilter}
                    />
                </Paper>
            </Grid.Col>

            {/* Main Content */}
            <Grid.Col span={9}>
                <Grid gutter="lg" columns={12}>
                    {filteredPhotos.map((photo, index) => {
                        const isLastElement = index === filteredPhotos.length - 1;

                        return (
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
                                    >
                                        <Image
                                            style={{
                                                objectFit: 'contain',
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                            }}
                                            src={`data:image/jpeg;base64,${photo.image}`}
                                            alt={`Photo ${index + 1}`}
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
                                        <div style={{ textAlign: 'left' }}>
                                            <Text>Location: {photo.location}</Text>
                                        </div>
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
                        );
                    })}
                </Grid>

                {loading && <Loader size="lg" style={{ margin: '2rem auto' }} />}
            </Grid.Col>
        </Grid>
    );
}
