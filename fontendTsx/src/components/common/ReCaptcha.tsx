// frontend/src/components/common/ReCaptcha.tsx
import { useEffect, useRef } from 'react';

// Déclaration des types pour l'API Google reCAPTCHA
declare global {
    interface Window {
        grecaptcha: {
            render: (container: HTMLElement, parameters: {
                sitekey: string;
                callback: (token: string) => void;
                'expired-callback': () => void;
                'error-callback': () => void;
                size: string;
            }) => number;
            reset: (widgetId: number) => void;
        };
    }
}

interface ReCaptchaProps {
    onVerify: (token: string) => void;
    onExpired: () => void;
    onError: () => void;
}

const ReCaptcha = ({ onVerify, onExpired, onError }: ReCaptchaProps) => {
    const recaptchaRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<number | null>(null);
    const isRendering = useRef<boolean>(false);

    useEffect(() => {
        if (isRendering.current) return;
        isRendering.current = true;

        const renderRecaptcha = () => {
            if (!recaptchaRef.current) return;
            
            if (widgetId.current !== null) {
                try {
                    window.grecaptcha.reset(widgetId.current);
                    console.log('✅ reCAPTCHA reset');
                    return;
                } catch (e) {
                    console.log('⚠️ Reset impossible, tentative de nouveau render');
                }
            }

            if (recaptchaRef.current.children.length > 0) {
                console.log('⚠️ L\'élément contient déjà un reCAPTCHA');
                return;
            }

            if (window.grecaptcha && window.grecaptcha.render) {
                try {
                    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
                    
                    if (!siteKey) {
                        console.error('❌ VITE_RECAPTCHA_SITE_KEY non définie');
                        return;
                    }

                    widgetId.current = window.grecaptcha.render(recaptchaRef.current, {
                        sitekey: siteKey,
                        callback: onVerify,
                        'expired-callback': onExpired,
                        'error-callback': onError,
                        size: 'normal'
                    });
                    console.log('✅ reCAPTCHA rendu avec succès');
                } catch (e) {
                    const error = e as Error;
                    console.error('❌ Erreur render reCAPTCHA:', error.message);
                    if (recaptchaRef.current) {
                        recaptchaRef.current.innerHTML = '';
                    }
                }
            }
        };

        if (!window.grecaptcha) {
            const script = document.createElement('script');
            script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);

            script.onload = () => {
                const checkReady = setInterval(() => {
                    if (window.grecaptcha && window.grecaptcha.render) {
                        clearInterval(checkReady);
                        renderRecaptcha();
                    }
                }, 100);
            };
        } else {
            renderRecaptcha();
        }

        return () => {
            isRendering.current = false;
        };
    }, [onVerify, onExpired, onError]);

    return (
        <div 
            ref={recaptchaRef}
            style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '15px',
                transform: 'scale(0.85)',
                transformOrigin: 'center'
            }}
        />
    );
};

export default ReCaptcha;