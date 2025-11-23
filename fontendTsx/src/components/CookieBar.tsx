import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieBar() {
  const [showCookie, setShowCookie] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowCookie(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookie(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowCookie(false);
  };

  const handleClose = () => {
    setShowCookie(false);
  };

  if (!showCookie) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary text-white p-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-white">
              We use cookies to enhance your experience. By continuing to browse this site you agree to our use of cookies.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              <a href="#" className="hover:underline">Learn more about our cookie policy</a>
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-4 py-2 text-sm border border-gray-500 rounded hover:text-primary hover:bg-white transition"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm bg-accent/60 rounded hover:bg-accent transition font-medium"
            >
              Accept
            </button>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-800 rounded transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}