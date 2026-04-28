require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testUpload() {
    console.log('Testing Cloudinary Config:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? 'Has Key' : 'MISSING'
    });

    try {
        const result = await cloudinary.uploader.upload("https://via.placeholder.com/150", {
            folder: 'test_upload'
        });
        console.log('✅ Upload Success:', result.secure_url);

        // Cleanup
        await cloudinary.uploader.destroy(result.public_id);
    } catch (error) {
        console.error('❌ Upload Failed:', error.message);
    }
}

testUpload();
