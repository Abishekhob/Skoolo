package com.example.Skoolo.controller;

import com.example.Skoolo.dto.FeeDto;
import com.example.Skoolo.dto.StudentFeeStatusDto;
import com.example.Skoolo.model.Fee;
import com.example.Skoolo.repo.FeeRepository;
import com.example.Skoolo.service.FeeService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private FeeService feeService;

    @PostMapping
    public Fee createFee(@RequestBody Fee fee) {
        return feeRepository.save(fee);
    }

    @GetMapping
    public List<FeeDto> getAllFees() {
        return feeRepository.findAll().stream().map(fee -> {
            String className = fee.getClassEntity() != null ? fee.getClassEntity().getClassName() : null;
            String sectionName = fee.getSection() != null ? fee.getSection().getSectionName() : null;
            Long classId = fee.getClassEntity() != null ? fee.getClassEntity().getId() : null;
            Long sectionId = fee.getSection() != null ? fee.getSection().getId() : null;

            return new FeeDto(
                    fee.getId(),
                    fee.getFeeType(),
                    fee.getAmount(),
                    fee.getDueDate(),
                    classId,
                    sectionId,
                    className,
                    sectionName
            );
        }).toList();
    }

    @GetMapping("/{feeId}/payments")
    public List<StudentFeeStatusDto> getFeePaymentStatus(@PathVariable Long feeId) {
        return feeService.getStudentPaymentStatus(feeId);
    }



}
