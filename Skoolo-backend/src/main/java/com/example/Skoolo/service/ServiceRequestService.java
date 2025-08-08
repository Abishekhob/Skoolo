package com.example.Skoolo.service;

import com.example.Skoolo.model.Parent;
import com.example.Skoolo.model.ServiceRequest;
import com.example.Skoolo.model.enums.RequestStatus;
import com.example.Skoolo.repo.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;

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
    public ServiceRequest updateStatus(Long requestId, RequestStatus status, String adminRemarks) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setStatus(status);
        request.setAdminRemarks(adminRemarks);
        return requestRepository.save(request);
    }
}
