package com.example.Skoolo.service;

import com.example.Skoolo.model.User;
import com.example.Skoolo.model.enums.Role;
import com.example.Skoolo.repo.UserRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public void processCsv(MultipartFile file) throws IOException, CsvValidationException {
        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
             CSVReader csvReader = new CSVReader(reader)) {

            String[] nextLine;
            boolean isFirstLine = true;

            while ((nextLine = csvReader.readNext()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // Skip header
                }

                User user = new User();
                user.setFirstName(nextLine[0]);
                user.setLastName(nextLine[1]);
                user.setEmail(nextLine[2]);
                user.setRole(Role.valueOf(nextLine[3].toUpperCase()));

                user.setPassword(null); // password will be set later by user
                user.setActive(false);  // optionally mark user as inactive until password is set

                userRepository.save(user);
            }
        }
    }

    public void processExcel(MultipartFile file) throws IOException {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            boolean isFirstRow = true;

            for (Row row : sheet) {
                if (isFirstRow) {
                    isFirstRow = false;
                    continue; // Skip header
                }

                User user = new User();
                user.setFirstName(row.getCell(0).getStringCellValue());
                user.setLastName(row.getCell(1).getStringCellValue());
                user.setEmail(row.getCell(2).getStringCellValue());
                user.setRole(Role.valueOf(row.getCell(3).getStringCellValue().toUpperCase()));

                user.setPassword(null); // user sets password later
                user.setActive(false);  // optional

                userRepository.save(user);
            }
        }
    }
}
