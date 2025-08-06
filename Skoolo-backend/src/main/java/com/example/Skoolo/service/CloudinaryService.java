package com.example.Skoolo.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public Map<String, String> uploadFileWithPublicId(MultipartFile file, String folderName) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folderName,
                        "resource_type", "raw",
                        "type", "upload",
                        "use_filename", true
                )
        );

        return Map.of(
                "url", uploadResult.get("secure_url").toString(),
                "publicId", uploadResult.get("public_id").toString()
        );
    }


    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId,
                ObjectUtils.asMap(
                        "resource_type", "raw"
                )
        );

    }

}
