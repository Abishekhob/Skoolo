package com.example.Skoolo.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dsh4holde",
                "api_key", "178777587187171",
                "api_secret", "c2ySIUkaePZd7ms7cWxNxPILRO8"
        ));
    }
}
