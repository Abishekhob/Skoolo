package com.example.Skoolo.service;

import com.example.Skoolo.model.Parent;
import com.example.Skoolo.model.ServiceRequest;
import com.example.Skoolo.model.enums.RequestStatus;
import com.example.Skoolo.repo.ServiceRequestRepository;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final CloudinaryService cloudinaryService;

    // ✅ Parent creates a request
    public ServiceRequest createRequest(ServiceRequest request) {
        // If "Other" type is chosen, ensure custom request text is provided
        if (request.getRequestType() != null &&
                request.getRequestType().name().equals("OTHER") &&
                (request.getCustomRequest() == null || request.getCustomRequest().isBlank())) {
            throw new IllegalArgumentException("Please provide description for 'Other' request type.");
        }
        return requestRepository.save(request);
    }

    // ✅ Get all requests for a specific parent
    public List<ServiceRequest> getRequestsByParent(Parent parent) {
        return requestRepository.findByParent(parent);
    }

    // ✅ Admin gets all requests
    public List<ServiceRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    // ✅ Admin updates request status
    public ServiceRequest updateStatus(Long requestId, RequestStatus status, String adminRemarks, MultipartFile document) throws IOException {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(status);
        request.setAdminRemarks(adminRemarks);

        if (document != null && !document.isEmpty()) {
            if (request.getDocumentPublicId() != null) {
                cloudinaryService.deleteImage(request.getDocumentPublicId());
            }
            var uploadResult = cloudinaryService.uploadFileWithPublicId(document, "service_requests");
            request.setDocumentUrl(uploadResult.get("url"));
            request.setDocumentPublicId(uploadResult.get("publicId"));
            request.setDocumentUploadedAt(LocalDateTime.now());
            request.setDocumentViewedAt(null); // reset viewedAt on new upload
        }


        return requestRepository.save(request);
    }

    public ServiceRequest markDocumentViewed(Long requestId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setDocumentViewedAt(LocalDateTime.now());
        return requestRepository.save(request);
    }

}
