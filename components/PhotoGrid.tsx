import { useEffect, useState } from 'react';
import { Grid, Image, Loader, Text, Button, Group, Select, Paper, RangeSlider } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

export default function PhotoGrid() {
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filter, setFilter] = useState<string | null>(null);
    const [startMonth, setStartMonth] = useState<string | null>(null);
    const [startYear, setStartYear] = useState<string | null>(null);
    const [endMonth, setEndMonth] = useState<string | null>(null);
    const [endYear, setEndYear] = useState<string | null>(null);

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

    const marks = [
        { value: 20, label: '20%' },
        { value: 50, label: '50%' },
        { value: 80, label: '80%' },
      ];

    return (
        <Grid>
            {/* Sidebar */}
            <Grid.Col span={3}>
                <Paper withBorder style={{ padding: '1rem', boxShadow: 'sm', height: '100vh' }}>
                    <Text size="lg" mb="sm" style={{ fontWeight: 500 }}>
                        Filters
                    </Text>
                    <Select
                        label="Post Location"
                        placeholder="Select a location"
                        data={[
                            { value: '#BSLTfire01', label: 'Riparian zone' },
                            { value: '#BSLTfire02', label: 'Redwood & tanoak habitat' },
                            { value: '#BSLTfire03', label: 'Upland redwood & tanoak habitat' },
                            { value: '#BSLTfire04', label: 'Grassland habitat' },
                            { value: '#BSLTfire05', label: 'Chaparral habitat' },
                        ]}
                        value={filter}
                        onChange={setFilter}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                    <RangeSlider
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
                                <Text>{`Uploader name: ${photo.uploaderName || '[NAME]'}`}</Text>
                                <Text>{`Location: ${photo.location || '[NAME]'}`}</Text>
                                <Text>{`Resolution: ${photo.width} x ${photo.height}`}</Text>
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
