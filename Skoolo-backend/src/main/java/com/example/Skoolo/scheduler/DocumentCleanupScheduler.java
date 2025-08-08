package com.example.Skoolo.scheduler;

import com.example.Skoolo.model.ServiceRequest;
import com.example.Skoolo.repo.ServiceRequestRepository;
import com.example.Skoolo.service.CloudinaryService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DocumentCleanupScheduler {

    private final ServiceRequestRepository requestRepository;
    private final CloudinaryService cloudinaryService;

    @Scheduled(cron = "0 0 0 * * ?") // every day at midnight
    public void cleanupOldDocuments() {
        LocalDateTime now = LocalDateTime.now();

        // Find all requests with documents
        List<ServiceRequest> requestsWithDocs = requestRepository.findAllByDocumentPublicIdIsNotNull();

        for (ServiceRequest req : requestsWithDocs) {
            LocalDateTime uploadedAt = req.getDocumentUploadedAt();
            LocalDateTime viewedAt = req.getDocumentViewedAt();

            boolean delete = false;

            if (viewedAt != null) {
                // If parent viewed, delete if 2 days passed since viewedAt
                if (viewedAt.plusDays(2).isBefore(now)) {
                    delete = true;
                }
            } else {
                // If not viewed, delete if 5 days passed since upload
                if (uploadedAt.plusDays(5).isBefore(now)) {
                    delete = true;
                }
            }

            if (delete) {
                try {
                    cloudinaryService.deleteImage(req.getDocumentPublicId());
                    // Remove document info from DB
                    req.setDocumentUrl(null);
                    req.setDocumentPublicId(null);
                    req.setDocumentUploadedAt(null);
                    req.setDocumentViewedAt(null);
                    requestRepository.save(req);
                } catch (Exception e) {
                    // Log error, but continue
                    System.err.println("Failed to delete document: " + e.getMessage());
                }
            }
        }
    }
}
