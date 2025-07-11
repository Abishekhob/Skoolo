package com.example.Skoolo.service;

import com.example.Skoolo.dto.StudentFeeStatusDto;
import com.example.Skoolo.model.Fee;
import com.example.Skoolo.model.FeePaymentStatus;
import com.example.Skoolo.model.Student;
import com.example.Skoolo.repo.FeePaymentStatusRepository;
import com.example.Skoolo.repo.FeeRepository;
import com.example.Skoolo.repo.StudentRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FeeService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private FeePaymentStatusRepository feePaymentStatusRepository;

    public List<StudentFeeStatusDto> getStudentPaymentStatus(Long feeId) {
        Fee fee = feeRepository.findById(feeId).orElseThrow();
        Long classId = fee.getClassEntity().getId();
        Long sectionId = fee.getSection() != null ? fee.getSection().getId() : null;

        List<Student> students;

        if (sectionId != null) {
            students = studentRepository.findByCurrentClassAndCurrentSection(fee.getClassEntity(), fee.getSection());
        } else {
            students = studentRepository.findByCurrentClassId(classId);
        }


        return students.stream().map(student -> {
            Optional<FeePaymentStatus> paymentOpt = feePaymentStatusRepository.findByFeeAndStudent(fee, student);

            if (paymentOpt.isPresent()) {
                FeePaymentStatus payment = paymentOpt.get();
                return new StudentFeeStatusDto(student.getId(), student.getFullName(), true, payment.getPaymentDate());
            } else {
                return new StudentFeeStatusDto(student.getId(), student.getFullName(), false, null);
            }
        }).toList();
    }

}
