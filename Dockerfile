# FROM fedora:latest

# RUN dnf install -y java-25-openjdk-devel \
#     && dnf clean all \
#     && rm -rf /var/cache/dnf

# RUN mkdir -p /ssja

# WORKDIR /ssja

# # Copy the complete backend project
# COPY backend/ /ssja/

# WORKDIR /ssja/backend

# # Make Gradle wrapper executable
# RUN chmod 777 ./gradlew

# # Directory where the embedded H2 database will be stored
# RUN mkdir -p /h2

# WORKDIR ./h2

# RUN touch ssja.mv.db

# WORKDIR ..

# EXPOSE 9090

# # Run Spring Boot using Gradle
# CMD ["./gradlew", "bootRun"]
#-------------------------------------------------
# FROM fedora:latest

# # Install JDK 25
# RUN dnf install -y java-25-openjdk-devel \
#     && dnf clean all \
#     && rm -rf /var/cache/dnf

# # Application directory
# WORKDIR /ssja

# # Copy the complete backend project
# COPY backend/ /ssja/

# # Make Gradle wrapper executable
# RUN chmod +x /ssja/gradlew

# # H2 database directory
# RUN mkdir -p /ssja/h2

# EXPOSE 9090

# # Run Spring Boot using Gradle
# CMD ["./gradlew", "bootRun"]
#------------------------------------
FROM fedora:latest

RUN dnf install -y \
        java-25-openjdk-devel \
        wget \
        unzip \
    && dnf clean all \
    && rm -rf /var/cache/dnf

# Install Gradle 9.7.1
RUN wget -q https://services.gradle.org/distributions/gradle-9.7.1-bin.zip \
    -O /tmp/gradle.zip \
    && unzip -q /tmp/gradle.zip -d /opt \
    && rm /tmp/gradle.zip

ENV GRADLE_HOME=/opt/gradle-9.7.1
ENV PATH="${GRADLE_HOME}/bin:${PATH}"

WORKDIR /ssja

COPY backend/ /ssja/

RUN mkdir -p /ssja/h2

EXPOSE 9090

CMD ["gradle", "bootRun"]
