package com.museum.ticketbooking.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class QRCodeGenerator {

    @Value("${app.base-url:http://localhost:9090}")
    private String baseUrl;
    
    @Value("${app.qr.storage-path:uploads/qr}")
    private String qrStoragePath;

    public String generateQRCode(String text, Long museumId) {
        try {
            Path uploadPath = Paths.get(qrStoragePath).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String fileName = "museum_" + museumId + ".png";
            Path filePath = uploadPath.resolve(fileName);

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 300, 300);

            MatrixToImageWriter.writeToPath(bitMatrix, "PNG", filePath);

            // Return API URL instead of file path
            return baseUrl + "/api/museums/" + museumId + "/qr-image";
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage());
        }
    }
}
