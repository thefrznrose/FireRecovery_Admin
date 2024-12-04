import { useRouter } from 'next/router';
import { useMediaQuery } from '@mantine/hooks';
import LoginForm from '@/components/Login/LoginForm';
import PhotoGrid from '@/components/PhotoGrid';

export default function HomePage() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleNavigation = () => {
    router.push('/view-posts');
  };

  return (
    <>
      {/* <PhotoGrid/> */}
      {/* <LoginButton/> */}
      {/* <LoginForm/> */}
      <PhotoGrid/>
    </>
  );
}
