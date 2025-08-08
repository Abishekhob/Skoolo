package com.example.Skoolo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class SkooloApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkooloApplication.class, args);
	}

}
