# שלב ראשון: בניית האפליקציה
FROM maven:3.8.4-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# שלב שני: הרצת האפליקציה באמצעות Amazon Corretto (תחליף רשמי ויציב)
FROM amazoncorretto:17-alpine
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]