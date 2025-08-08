package com.example.Skoolo.repo;

import com.example.Skoolo.model.ServiceRequest;
import com.example.Skoolo.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByParent(Parent parent);

    List<ServiceRequest> findAllByDocumentPublicIdIsNotNull();
}
