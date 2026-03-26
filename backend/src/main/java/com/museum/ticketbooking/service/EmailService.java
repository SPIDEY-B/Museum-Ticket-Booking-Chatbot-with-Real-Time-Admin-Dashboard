package com.museum.ticketbooking.service;

import com.museum.ticketbooking.model.Ticket;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendTicketConfirmation(Ticket ticket) {
        if (ticket == null) {
            log.error("Cannot send email: ticket is null");
            return;
        }

        if (ticket.getUserEmail() == null || ticket.getUserEmail().isBlank()) {
            log.error("Cannot send email: user email is missing for ticket {}", ticket.getId());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(ticket.getUserEmail());
            helper.setSubject("Museum Ticket Confirmation - " + ticket.getTicketNumber());
            helper.setText(buildTicketEmailHtml(ticket), true);

            mailSender.send(message);
            log.info("Ticket confirmation email sent successfully to {} for ticket {}", ticket.getUserEmail(), ticket.getTicketNumber());
        } catch (MessagingException | MailException e) {
            log.error("Failed to send confirmation email to {} for ticket {}: {}", ticket.getUserEmail(), ticket.getTicketNumber(), e.getMessage());
            // Don't throw exception - email failure shouldn't break the booking flow
        }
    }

    @Async
    public void sendOtpEmail(String email, String otp) {
        if (email == null || email.isBlank() || otp == null || otp.isBlank()) {
            log.error("Cannot send OTP email: invalid parameters");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Your OTP for Museum Ticket Booking");
            helper.setText(buildOtpEmailHtml(otp), true);

            mailSender.send(message);
            log.info("OTP email sent successfully to {}", email);
        } catch (MessagingException | MailException e) {
            log.error("Failed to send OTP email to {}: {}", email, e.getMessage());
            // Don't throw exception - email failure shouldn't break the flow
        }
    }

    private String buildTicketEmailHtml(Ticket ticket) {
        String museumName = ticket.getMuseum() != null ? ticket.getMuseum().getMuseumName() : "Museum";
        String location = ticket.getMuseum() != null ? ticket.getMuseum().getLocation() : "-";
        String phone = ticket.getPhone() != null ? ticket.getPhone() : "-";
        String adults = ticket.getAdults() != null ? String.valueOf(ticket.getAdults()) : "0";
        String children = ticket.getChildren() != null ? String.valueOf(ticket.getChildren()) : "0";
        String totalPrice = ticket.getTotalPrice() != null ? String.valueOf(ticket.getTotalPrice()) : "0";
        String secretCode = ticket.getSecretCode() != null ? ticket.getSecretCode() : "----";
        String paymentId = ticket.getPaymentId() != null ? ticket.getPaymentId() : "-";
        String orderId = ticket.getOrderId() != null ? ticket.getOrderId() : "-";
        String createdAt = ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : "-";

        return "<html><body style='font-family: Arial, sans-serif; background:#f8fafc; padding:20px;'>" +
                "<div style='max-width:700px; margin:auto; background:white; border-radius:16px; padding:24px; border:1px solid #e5e7eb;'>" +
                "<h2 style='margin-top:0; color:#111827;'>Your Museum Ticket is Confirmed</h2>" +
                "<p style='color:#374151;'>Thank you for your booking. Your payment was successful and your ticket is now active.</p>" +
                "<table style='width:100%; border-collapse:collapse; margin-top:20px;'>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Museum</td><td style='padding:8px;'>" + museumName + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Location</td><td style='padding:8px;'>" + location + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Ticket Number</td><td style='padding:8px;'>" + ticket.getTicketNumber() + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Ticket ID</td><td style='padding:8px;'>" + ticket.getId() + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Email</td><td style='padding:8px;'>" + ticket.getUserEmail() + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Phone</td><td style='padding:8px;'>" + phone + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Adults</td><td style='padding:8px;'>" + adults + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Children</td><td style='padding:8px;'>" + children + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Total Price</td><td style='padding:8px;'>₹" + totalPrice + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Status</td><td style='padding:8px;'>" + ticket.getStatus() + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Payment ID</td><td style='padding:8px;'>" + paymentId + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Order ID</td><td style='padding:8px;'>" + orderId + "</td></tr>" +
                "<tr><td style='padding:8px; font-weight:bold;'>Booked At</td><td style='padding:8px;'>" + createdAt + "</td></tr>" +
                "</table>" +
                "<div style='margin-top:24px; padding:16px; background:#eff6ff; border-radius:12px;'>" +
                "<p style='margin:0; font-size:18px; font-weight:bold; color:#1d4ed8;'>Secret Verification Code: " + secretCode + "</p>" +
                "<p style='margin-top:8px; color:#374151;'>" +
                "Keep this 4-digit code safe. Museum staff will ask for this code during entry verification." +
                "</p></div>" +
                "<p style='margin-top:24px; color:#6b7280; font-size:14px;'>" +
                "Please do not share this ticket screenshot or code with others. Entry will be marked used after verification." +
                "</p>" +
                "</div></body></html>";
    }

    private String buildOtpEmailHtml(String otp) {
        return "<html><body style='font-family: Arial, sans-serif; background:#f8fafc; padding:20px;'>" +
                "<div style='max-width:600px; margin:auto; background:white; border-radius:16px; padding:24px; border:1px solid #e5e7eb;'>" +
                "<h2 style='margin-top:0; color:#111827;'>Your OTP for Museum Ticket Booking</h2>" +
                "<p style='color:#374151;'>Please use the following OTP to verify your email address:</p>" +
                "<div style='text-align:center; margin:30px 0;'>" +
                "<div style='display:inline-block; background:#1d4ed8; color:white; font-size:32px; font-weight:bold; padding:20px 40px; border-radius:12px; letter-spacing:4px;'>" +
                otp +
                "</div></div>" +
                "<p style='color:#6b7280; font-size:14px; text-align:center;'>" +
                "This OTP is valid for 10 minutes. Do not share it with anyone." +
                "</p>" +
                "</div></body></html>";
    }
}
