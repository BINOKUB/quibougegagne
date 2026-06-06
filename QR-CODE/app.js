/* Révision v1.2 - Intégration du vigile (LocalStorage) et validation de clé de passeport - app.js */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- SECTION 1 : GESTION DU PASSEPORT (LE VIGILE) ---
    const ecranVente = document.getElementById('ecran-vente');
    const generateurQr = document.getElementById('generateur-qr');
    const unlockBtn = document.getElementById('unlock-btn');
    const vipKeyInput = document.getElementById('vip-key');
    const errorMsg = document.getElementById('error-msg');
    
    // 1. Vérification silencieuse au chargement de la page
    const passeport = localStorage.getItem('qr_vip_access');
    
    if (passeport === 'valide') {
        // Le client est connu, on ouvre la porte directement
        ecranVente.style.display = 'none';
        generateurQr.style.display = 'block';
    }

   
    unlockBtn.addEventListener('click', () => {
        const cleSaisie = vipKeyInput.value.trim().toUpperCase();
        
       
        if (cleSaisie.startsWith('QR-PRO-') && cleSaisie.length >= 11) {
            
            // C'est un succès ! On tamponne le passeport dans le navigateur
            localStorage.setItem('qr_vip_access', 'valide');
            
            // On bascule l'affichage vers l'outil
            ecranVente.style.display = 'none';
            generateurQr.style.display = 'block';
            errorMsg.style.display = 'none';
        } else {
            // Échec de l'authentification : La clé ne respecte pas le format
            errorMsg.style.display = 'block';
        }
    });


    // --- SECTION 2 : MOTEUR DE GÉNÉRATION QR (EXISTANT) ---
    const urlInput = document.getElementById('qr-url');
    const generateBtn = document.getElementById('generate-btn');
    const qrContainer = document.getElementById('qrcode-container');
    const downloadBtn = document.getElementById('download-btn');
    
    generateBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        
        if (!url) {
            console.warn('Saisie vide.');
            return;
        }

        qrContainer.innerHTML = '';
        qrContainer.style.display = 'flex';
        downloadBtn.style.display = 'none';

        new QRCode(qrContainer, {
            text: url,
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        setTimeout(() => {
            const qrImage = qrContainer.querySelector('img');
            if (qrImage) {
                downloadBtn.style.display = 'block';
            }
        }, 100);
    });

    downloadBtn.addEventListener('click', () => {
        const qrImage = qrContainer.querySelector('img');
        
        if (qrImage && qrImage.getAttribute('src')) {
            const img = new Image();
            img.src = qrImage.getAttribute('src');
            
            img.onload = () => {
                const padding = 20; 
                const size = 256;
                
                const canvas = document.createElement('canvas');
                canvas.width = size + (padding * 2);
                canvas.height = size + (padding * 2);
                const ctx = canvas.getContext('2d');
                
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.drawImage(img, padding, padding, size, size);
                
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'QR_Code_Tactique.png';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
        } else {
            console.error('Erreur lors de la capture de l\'image.');
        }
    });
});
