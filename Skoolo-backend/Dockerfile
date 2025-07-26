FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN chmod +x ./mvnw
RUN ./mvnw clean install -DskipTests

EXPOSE 8081

CMD ["./mvnw", "spring-boot:run"]
