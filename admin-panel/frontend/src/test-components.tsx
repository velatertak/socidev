import toast from 'react-hot-toast';

const TestToasts = () => {
  const showSuccessToast = () => {
    toast.success('This is a success message!');
  };

  const showErrorToast = () => {
    toast.error('This is an error message!');
  };

  const showInfoToast = () => {
    toast('This is an info message!');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test Toast Notifications</h2>
      <div className="space-x-4">
        <button
          onClick={showSuccessToast}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Show Success Toast
        </button>
        <button
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Show Error Toast
        </button>
        <button
          onClick={showInfoToast}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Show Info Toast
        </button>
      </div>
    </div>
  );
};

export default TestToasts;