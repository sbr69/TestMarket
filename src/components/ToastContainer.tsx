import { useToastStore } from '../store/toastStore';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center justify-between min-w-[250px] transform transition-all duration-300 translate-y-0 opacity-100 ${
            toast.type === 'success' ? 'bg-[#1B1F5E] text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            'bg-gray-800 text-white'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
