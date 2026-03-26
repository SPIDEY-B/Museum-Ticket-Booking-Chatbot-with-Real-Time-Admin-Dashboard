package com.museum.ticketbooking.service;

import org.springframework.stereotype.Service;

@Service
public class PdfService {
    
    public byte[] generateTicket(Long bookingId, String museumName, String email, int count) {
        String ticketContent = "Ticket for " + museumName;
        return ticketContent.getBytes();
    }
}
