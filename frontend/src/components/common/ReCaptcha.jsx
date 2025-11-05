// frontend/src/components/common/ReCaptcha.jsx
import React, { useEffect, useRef } from 'react';

const ReCaptcha = ({ onVerify, onExpired, onError }) => {
    const recaptchaRef = useRef(null);
    const widgetId = useRef(null);
    const isRendering = useRef(false);

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
                    widgetId.current = window.grecaptcha.render(recaptchaRef.current, {
                        sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
                        callback: onVerify,
                        'expired-callback': onExpired,
                        'error-callback': onError,
                        size: 'normal'
                    });
                    console.log('✅ reCAPTCHA rendu avec succès');
                } catch (e) {
                    console.error('❌ Erreur render reCAPTCHA:', e.message);
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
    }, []);

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