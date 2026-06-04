/* Révision v1.1 - Correction de la "Zone de Silence" (marge blanche) pour l'export - app.js */
document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('qr-url');
    const generateBtn = document.getElementById('generate-btn');
    const qrContainer = document.getElementById('qrcode-container');
    const downloadBtn = document.getElementById('download-btn');
    
    // Moteur de génération principal
    generateBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        
        if (!url) {
            console.warn('Saisie vide.');
            return;
        }

        // Nettoyage de la zone
        qrContainer.innerHTML = '';
        qrContainer.style.display = 'flex';
        downloadBtn.style.display = 'none';

        // Génération du code brut (256x256)
        new QRCode(qrContainer, {
            text: url,
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        // Activation du bouton
        setTimeout(() => {
            const qrImage = qrContainer.querySelector('img');
            if (qrImage) {
                downloadBtn.style.display = 'block';
            }
        }, 100);
    });

    // Logique d'exportation avec Zone de Silence (Quiet Zone)
    downloadBtn.addEventListener('click', () => {
        const qrImage = qrContainer.querySelector('img');
        
        if (qrImage && qrImage.getAttribute('src')) {
            const img = new Image();
            img.src = qrImage.getAttribute('src');
            
            img.onload = () => {
                // 1. Configuration de la marge (20px de chaque côté)
                const padding = 20; 
                const size = 256;
                
                // 2. Création de notre plan de travail virtuel
                const canvas = document.createElement('canvas');
                canvas.width = size + (padding * 2);
                canvas.height = size + (padding * 2);
                const ctx = canvas.getContext('2d');
                
                // 3. Peinture de la Zone de Silence en blanc pur
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // 4. Impression du code QR au centre
                ctx.drawImage(img, padding, padding, size, size);
                
                // 5. Extraction et téléchargement du produit final
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
