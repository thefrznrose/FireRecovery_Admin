import { Image, Stack, Text, Flex } from '@mantine/core';
import { useRouter } from 'next/router';
import PhotoUploadButton from '@/components/PhotoUpload/PhotoUploadButton';
import { useMediaQuery } from '@mantine/hooks';
import PhotoGrid from '@/components/PhotoGrid';

export default function HomePage() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleNavigation = () => {
    router.push('/view-posts');
  };

  return (
    <>
      <PhotoGrid/>
    </>
  );
}
