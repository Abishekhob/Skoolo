package com.example.Skoolo.repo;

import com.example.Skoolo.model.FeePaymentStatus;
import com.example.Skoolo.model.Fee;
import com.example.Skoolo.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeePaymentStatusRepository extends JpaRepository<FeePaymentStatus, Long> {

    List<FeePaymentStatus> findByFee(Fee fee);

    Optional<FeePaymentStatus> findByFeeAndStudent(Fee fee, Student student);
}
