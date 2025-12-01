// components/common/LoadingSpinner.jsx
export const LoadingSpinner = ({ size = 'medium', message = t('common.loading') }) => {
    const sizes = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <div className={`${sizes[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-2`}></div>
            <p className="text-gray-600 text-sm">{message}</p>
        </div>
    );
};