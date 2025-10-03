export const ErrorAlert = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center">
        <AlertCircle size={16} className="text-red-500 mr-2 flex-shrink-0" />
        <span className="text-red-700 text-sm flex-1">{message}</span>
        {onClose && (
            <button onClick={onClose} className="text-red-500 hover:text-red-700 ml-2">
                <XCircle size={16} />
            </button>
        )}
    </div>
);