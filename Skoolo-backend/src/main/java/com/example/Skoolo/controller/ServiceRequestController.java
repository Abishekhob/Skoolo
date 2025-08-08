package com.example.Skoolo.controller;

import com.example.Skoolo.model.Parent;
import com.example.Skoolo.model.ServiceRequest;
import com.example.Skoolo.model.enums.RequestStatus;
import com.example.Skoolo.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // ✅ Admin updates status
    @PutMapping("/{requestId}/status")
    public ServiceRequest updateStatus(@PathVariable Long requestId,
                                       @RequestParam RequestStatus status,
                                       @RequestParam(required = false) String adminRemarks) {
        return requestService.updateStatus(requestId, status, adminRemarks);
    }
}
