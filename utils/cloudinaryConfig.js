// const cloudinary = require("cloudinary").v2;
// const fs = require("fs");

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) return null;

//         // Upload the file to Cloudinary
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         });

//         // File has been uploaded successfully
//         // console.log("File is uploaded on Cloudinary", response.url);
//         fs.unlinkSync(localFilePath); // Remove the local file
//         return response;

//     } catch (error) {
//         fs.unlinkSync(localFilePath); // Remove the local file on error
//         return null;
//     }
// };

// const deleteFromCloudinary = async (publicId) => {
//     try {
//         await cloudinary.uploader.destroy(publicId);
//         return true;
//     } catch (error) {
//         console.error('Failed to delete image from Cloudinary:', error);
//         return false;
//     }
// };

// module.exports = { uploadOnCloudinary, deleteFromCloudinary };
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const uploadOnCloudinary = async (filePathOrUrl) => {
    try {
        if (!filePathOrUrl) return null;

        let response;
        if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
            // Upload from URL
            response = await cloudinary.uploader.upload(filePathOrUrl, {
                resource_type: "auto"
            });
        } else {
            // Upload from local file path
            response = await cloudinary.uploader.upload(filePathOrUrl, {
                resource_type: "auto"
            });
            fs.unlinkSync(filePathOrUrl); // Remove the local file
        }

        return response;

    } catch (error) {
        if (!filePathOrUrl.startsWith('http://') && !filePathOrUrl.startsWith('https://')) {
            fs.unlinkSync(filePathOrUrl); // Remove the local file on error
        }
        console.error('Failed to upload to Cloudinary:', error);
        return null;
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
        return false;
    }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
