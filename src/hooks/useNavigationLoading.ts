import { useNavigate } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

export const useNavigationLoading = () => {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  const navigateWithLoading = (to: string) => {
    startLoading();
    
    // Simulate loading time (có thể điều chỉnh)
    setTimeout(() => {
      navigate(to);
      // Stop loading sau khi navigate xong
      setTimeout(() => {
        stopLoading();
      }, 100);
    }, 500);
  };

  return { navigateWithLoading };
};
