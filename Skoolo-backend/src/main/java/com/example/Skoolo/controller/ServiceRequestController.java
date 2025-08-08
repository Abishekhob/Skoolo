package com.example.Skoolo.controller;

import com.example.Skoolo.model.Parent;
import com.example.Skoolo.model.ServiceRequest;
import com.example.Skoolo.model.enums.RequestStatus;
import com.example.Skoolo.service.ServiceRequestService;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService requestService;

    // ✅ Parent creates request
    @PostMapping
    public ServiceRequest createRequest(@RequestBody ServiceRequest request) {
        return requestService.createRequest(request);
    }

    // ✅ Parent views their requests
    @GetMapping("/parent/{parentId}")
    public List<ServiceRequest> getRequestsByParent(@PathVariable Long parentId) {
        Parent parent = new Parent();
        parent.setId(parentId);
        return requestService.getRequestsByParent(parent);
    }

    // ✅ Admin views all requests
    @GetMapping
    public List<ServiceRequest> getAllRequests() {
        return requestService.getAllRequests();
    }

    @PutMapping("/{requestId}/status")
    public ServiceRequest updateStatus(
            @PathVariable Long requestId,
            @RequestParam String status,
            @RequestParam(required = false) String adminRemarks,
            @RequestPart(required = false) MultipartFile document) throws IOException {

        RequestStatus requestStatus;
        try {
            requestStatus = RequestStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status value: " + status);
        }

        return requestService.updateStatus(requestId, requestStatus, adminRemarks, document);
    }

    @PutMapping("/{requestId}/mark-viewed")
    public ServiceRequest markDocumentViewed(@PathVariable Long requestId) {
        return requestService.markDocumentViewed(requestId);
    }


}
