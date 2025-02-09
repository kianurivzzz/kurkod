document.addEventListener('DOMContentLoaded', () => {
    const likeServiceSection = document.querySelector('.like-service');
    const likeServiceBtn = document.getElementById('like-service-btn');
    const likeOptions = document.getElementById('like-options');
    const shareBtn = document.getElementById('share-btn');

    // Show the like service section when QR code is generated
    const qrCode = document.getElementById('qr-code');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && qrCode.children.length > 0) {
                likeServiceSection.classList.remove('hidden');
            }
        });
    });

    observer.observe(qrCode, { childList: true });

    // Toggle like options
    likeServiceBtn.addEventListener('click', () => {
        likeOptions.classList.toggle('hidden');
    });

    // Share functionality
    shareBtn.addEventListener('click', async () => {
        const url = window.location.href;
        const title = document.querySelector('meta[name="title"]').content;
        const text = document.querySelector('meta[name="description"]').content;

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url
                });
            } catch (err) {
                console.error('Error sharing:', err);
                fallbackShare();
            }
        } else {
            fallbackShare();
        }
    });

    function fallbackShare() {
        const url = window.location.href;
        const tempInput = document.createElement('input');
        document.body.appendChild(tempInput);
        tempInput.value = url;
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert(window.translations[document.documentElement.lang || 'ru'].linkCopied);
    }
});
