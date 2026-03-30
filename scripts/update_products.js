import fs from 'fs';
import path from 'path';

const STORE_PATH = '/home/kareltestspecial/0-IT/2-Productie/athena/sites/urban-sneakers-store';
const IMAGES_DIR = path.join(STORE_PATH, 'public/images');
const PRODUCTS_FILE = path.join(STORE_PATH, 'src/data/producten.json');

function updateProducts() {
    console.log('--- Synchronizing Urban Sneakers Store Images (ESM) ---');

    // 1. Get images from public/images
    if (!fs.existsSync(IMAGES_DIR)) {
        console.error('Error: Images directory not found.');
        return;
    }

    const imageFiles = fs.readdirSync(IMAGES_DIR).filter(file => {
        return /\.(jpe?g|png|webp|gif|avif)$/i.test(file);
    });

    console.log(`Found ${imageFiles.length} images in public/images/`);

    // 2. Read current producten.json
    let products = [];
    if (fs.existsSync(PRODUCTS_FILE)) {
        try {
            products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
        } catch (e) {
            console.error('Error reading producten.json:', e);
            return;
        }
    }

    const existingImageUrls = new Set(products.map(p => p['afbeelding-url']));
    
    // 3. Find missing images
    const missingImages = imageFiles.filter(img => !existingImageUrls.has(img));

    if (missingImages.length === 0) {
        console.log('All images are already mapped in producten.json.');
        return;
    }

    console.log(`Adding ${missingImages.length} new products based on missing images...`);

    // 4. Add new entries using a placeholder template
    const newProducts = missingImages.map(img => {
        const nameParts = img.split('.')[0].replace(/[-_]/g, ' ');
        const capitalizedName = nameParts.charAt(0).toUpperCase() + nameParts.slice(1);
        
        console.log(`+ Added: ${img}`);
        return {
            "naam": capitalizedName,
            "prijs": "0.00",
            "afbeelding-url": img,
            "beschrijving": `Premium sneaker: ${capitalizedName}. Comfortabel, stijlvol en gebouwd voor duurzaamheid.`,
            "categorie": "New Arrival",
            "populair": "Nee",
            "image_prompt": `studio shot of ${capitalizedName} sneaker, high quality, neutral background`
        };
    });

    const updatedProducts = [...products, ...newProducts];

    // 5. Write back to producten.json
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));
    console.log('Update complete!');
}

updateProducts();
