import { useEffect, useState } from 'react';
import { Grid, Image, Loader, Text, Button, Group, Select, Paper } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function PhotoGrid() {
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<string | null>(null);

    // Media queries for responsive grid adjustments
    const isLargeScreen = useMediaQuery('(min-width: 1200px)');
    const isMediumScreen = useMediaQuery('(min-width: 768px)');
    const isSmallScreen = useMediaQuery('(min-width: 480px)');

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await fetch('http://localhost:5000/images');
                const data = await response.json();
                if (Array.isArray(data)) {
                    setPhotos(data);
                    console.log(data);
                } else {
                    console.error('Error: Expected an array, but received', typeof data);
                }
            } catch (error) {
                console.error('Error fetching photos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

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

    if (loading) {
        return <Loader size="lg" />;
    }

    if (photos.length === 0) {
        return <Text>No photos available</Text>;
    }

    return (
        <Grid>
            {/* Sidebar */}
            <Grid.Col span={3}>
                <Paper withBorder style={{ padding: '1rem', boxShadow: 'sm' }}>
                    <Text size="lg" mb="sm" style={{ fontWeight: 500 }}>
                        Filters
                    </Text>
                    <Select
                        label="Category"
                        placeholder="Select category"
                        data={[
                            { value: 'landscape', label: 'Landscape' },
                            { value: 'portrait', label: 'Portrait' },
                            { value: 'abstract', label: 'Abstract' },
                        ]}
                        value={filter}
                        onChange={setFilter}
                    />
                    <Button
                        mt="md"
                        fullWidth
                        variant="outline"
                        onClick={() => setFilter(null)}
                    >
                        Clear Filters
                    </Button>
                </Paper>
            </Grid.Col>

            {/* Main Content */}
            <Grid.Col span={9}>
                <Grid gutter="lg" columns={12}>
                    {filteredPhotos.map((photo, index) => (
                        <Grid.Col
                            key={index}
                            span={
                                isLargeScreen ? 3 : isMediumScreen ? 4 : isSmallScreen ? 6 : 12
                            }
                        >
                            {/* Paper provides the box around each item */}
                            <Paper
                                withBorder
                                shadow="md"
                                radius="md"
                                style={{
                                    height: '350px', // Standardized height for all items
                                    width: '100%', // Full width for responsive layout
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    gap: '0.5rem',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100%',
                                        height: '70%', // Allocate 70% of the container for the image
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Image
                                        style={{
                                            objectFit: 'contain', // Ensures the full image is visible
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                        }}
                                        src={`data:image/jpeg;base64,${photo.image}`}
                                        alt={`Photo ${index + 1}`}
                                    />
                                </div>
                                <Text>
                                    {`Uploader name: ${photo.uploaderName || '[NAME]'}`}
                                </Text>
                                <Text>
                                    {`Resolution: ${photo.width} x ${photo.height}`}
                                </Text>
                                <Group>
                                    <Button color="red" onClick={() => handleDelete(photo.id)}>
                                        Delete
                                    </Button>
                                </Group>
                            </Paper>
                        </Grid.Col>
                    ))}
                </Grid>
            </Grid.Col>
        </Grid>
    );
}
