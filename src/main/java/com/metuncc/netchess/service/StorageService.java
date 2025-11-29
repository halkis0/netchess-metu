package com.metuncc.netchess.service;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.UUID;

@Service
public class StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    private final S3Client s3Client;
    private final String bucketName;
    private final boolean useS3;

    public StorageService(
            @Value("${aws.s3.bucket-name}") String bucketName,
            @Value("${aws.s3.region}") String region,
            @Value("${aws.s3.access-key:}") String accessKey,
            @Value("${aws.s3.secret-key:}") String secretKey) {

        this.bucketName = bucketName;
        this.useS3 = !accessKey.isEmpty() && !secretKey.isEmpty();

        if (useS3) {
            AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
            this.s3Client = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                    .build();
            log.info("S3 Storage initialized with bucket: {}", bucketName);
        } else {
            this.s3Client = null;
            log.warn("S3 credentials not provided, using local storage");
        }
    }

    public String uploadFile(MultipartFile file) {
        if (!useS3) {
            return uploadToLocal(file);
        }

        try {
            String key = "pgn/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File uploaded to S3: {}", key);
            return key;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    public byte[] downloadFile(String key) {
        if (!useS3) {
            return downloadFromLocal(key);
        }

        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            return s3Client.getObject(getObjectRequest).readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file from S3", e);
        }
    }

    public void deleteFile(String key) {
        if (!useS3) {
            deleteFromLocal(key);
            return;
        }

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted from S3: {}", key);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file from S3", e);
        }
    }

    private String uploadToLocal(MultipartFile file) {
        log.warn("Using local storage fallback");
        return "local_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
    }

    private byte[] downloadFromLocal(String key) {
        log.warn("Local storage download not implemented");
        return new byte[0];
    }

    private void deleteFromLocal(String key) {
        log.warn("Local storage delete not implemented");
    }
}