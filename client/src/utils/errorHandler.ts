import { AxiosError } from 'axios';

/**
 * Xử lý lỗi API và hiển thị toast nếu có addToast function
 * @param error Lỗi từ API
 * @param addToast Function để hiển thị toast
 */
export const handleApiError = (error: any, addToast?: any): void => {
  console.error('API Error:', error);
  
  // Chỉ lấy message từ API, không có text thay thế
  const message = error?.response?.data?.message;
  
  // Chỉ hiển thị toast nếu có message từ API
  if (message && addToast) {
    addToast({
      type: 'error',
      title: '', // Không hiển thị tiêu đề
      message,
      duration: 5000
    });
  }
};