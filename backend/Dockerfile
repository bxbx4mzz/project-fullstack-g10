# "build" stage matches `target: build` in docker-compose.yml.
# The compose service bind-mounts the repo over /app and runs `./mvnw spring-boot:run`,
# so this stage just needs a JDK + the maven wrapper cache primed for fast startup.
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

COPY src/ src/

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]

# ---- Optional production image (not used by docker-compose.yml, kept for real deploys) ----
FROM build AS package
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre AS production
WORKDIR /app
COPY --from=package /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
