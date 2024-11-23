import { useRouter } from 'next/router';
import { useMediaQuery } from '@mantine/hooks';
import PhotoGrid from '@/components/PhotoGrid';
import Google from 'next-auth/providers/google';
import LoginButton from '@/components/LoginButton';
import LoginForm from '@/components/LoginForm';

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
      <LoginForm/>
    </>
  );
}
