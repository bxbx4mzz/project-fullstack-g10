package com.g10.rental.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.g10.rental.dto.admin.AvailabilityResponse;
import com.g10.rental.dto.admin.CheckAvailabilityRequest;
import com.g10.rental.dto.admin.CreateRentalRequest;
import com.g10.rental.dto.admin.RentalResponse;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.entity.Rental;
import com.g10.rental.entity.RentalItem;
import com.g10.rental.entity.RentalStatus;
import com.g10.rental.repository.ProductVariantRepository;
import com.g10.rental.repository.RentalRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RentalAdminService {

    private final RentalRepository rentalRepository;
    private final ProductVariantRepository variantRepository;

    @Transactional(readOnly = true)
    public AvailabilityResponse checkAvailability(CheckAvailabilityRequest req) {
        ProductVariant variant = variantRepository.findById(req.variantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบข้อมูล Variant สินค้า"));

        int bufferDays = req.deliveryMethod().getBufferDays();
        LocalDate bufferedStart = req.startDate().minusDays(bufferDays);
        LocalDate bufferedEnd = req.endDate().plusDays(bufferDays);

        List<Rental> overlappingRentals = rentalRepository.findActiveOverlappingRentals(
                bufferedStart, bufferedEnd, RentalStatus.CANCELLED
        );

        int bookedQty = 0;
        for (Rental rental : overlappingRentals) {
            for (RentalItem item : rental.getItems()) {
                if (item.getVariant().getId().equals(variant.getId())) {
                    bookedQty += item.getQuantity();
                }
            }
        }

        int availableQty = Math.max(0, variant.getStockQty() - bookedQty);
        return new AvailabilityResponse(
                variant.getId(),
                variant.getSku(),
                variant.getStockQty(),
                bookedQty,
                availableQty,
                availableQty > 0
        );
    }

    public BigDecimal calculateItemPrice(ProductVariant variant, int totalDays) {
        if (totalDays <= 3) {
            return variant.getPrice3Day();
        } else if (totalDays == 4) {
            return variant.getPrice3Day().add(variant.getExtraDayPrice());
        } else if (totalDays == 5) {
            return variant.getPrice5Day();
        } else if (totalDays == 6) {
            return variant.getPrice5Day().add(variant.getExtraDayPrice());
        } else if (totalDays == 7) {
            return variant.getPrice7Day();
        } else {
            int extraDays = totalDays - 7;
            return variant.getPrice7Day().add(variant.getExtraDayPrice().multiply(BigDecimal.valueOf(extraDays)));
        }
    }

    @Transactional
    public RentalResponse createRental(CreateRentalRequest req) {
        if (req.endDate().isBefore(req.startDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "วันคืนของต้องไม่เกิดขึ้นก่อนวันเริ่มเช่า");
        }

        int totalDays = (int) ChronoUnit.DAYS.between(req.startDate(), req.endDate()) + 1;
        int bufferDays = req.deliveryMethod().getBufferDays();

        LocalDate bufferedStart = req.startDate().minusDays(bufferDays);
        LocalDate bufferedEnd = req.endDate().plusDays(bufferDays);

        BigDecimal totalPrice = BigDecimal.ZERO;
        List<RentalItem> rentalItems = new ArrayList<>();

        Rental rental = Rental.builder()
                .bookingCode(generateBookingCode())
                .customerName(req.customerName())
                .customerPhone(req.customerPhone())
                .shippingAddress(req.shippingAddress())
                .deliveryMethod(req.deliveryMethod())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .totalDays(totalDays)
                .bufferedStartDate(bufferedStart)
                .bufferedEndDate(bufferedEnd)
                .discount(req.discount() != null ? req.discount() : BigDecimal.ZERO)
                .status(RentalStatus.CONFIRMED)
                .build();

        for (var itemReq : req.items()) {
            CheckAvailabilityRequest availReq = new CheckAvailabilityRequest(
                    itemReq.variantId(), req.startDate(), req.endDate(), req.deliveryMethod()
            );
            AvailabilityResponse avail = checkAvailability(availReq);
            if (avail.availableQuantity() < itemReq.quantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ชุดรหัส " + avail.sku() + " ว่างไม่เพียงพอในช่วงวันที่เลือก");
            }

            ProductVariant variant = variantRepository.findById(itemReq.variantId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบ Variant สินค้า"));

            BigDecimal unitPrice = calculateItemPrice(variant, totalDays);
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.quantity()));

            RentalItem item = RentalItem.builder()
                    .rental(rental)
                    .variant(variant)
                    .quantity(itemReq.quantity())
                    .subtotal(itemTotal)
                    .build();

            rentalItems.add(item);
            totalPrice = totalPrice.add(itemTotal);
        }

        rental.setItems(rentalItems);
        rental.setTotalPrice(totalPrice);
        rental.setNetPrice(totalPrice.subtract(rental.getDiscount()));

        Rental saved = rentalRepository.save(rental);
        return RentalResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public String generateChatSummary(Long rentalId) {
        Rental r = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ไม่พบข้อมูลการจองนี้"));

        StringBuilder sb = new StringBuilder();
        sb.append("สรุปรายการจองชุด [รหัส: ").append(r.getBookingCode()).append("] \n");
        sb.append("ชื่อลูกค้า: ").append(r.getCustomerName()).append("\n");
        sb.append("ที่อยู่จัดส่ง: ").append(r.getShippingAddress()).append("\n");
        sb.append("วันที่เช่า: ").append(r.getStartDate()).append(" ถึง ").append(r.getEndDate())
          .append(" (").append(r.getTotalDays()).append(" วัน)\n");
        sb.append("วิธีจัดส่ง: ").append(r.getDeliveryMethod()).append("\n");
        sb.append("---------------------------\n");
        sb.append("รายการชุด:\n");

        int index = 1;
        for (RentalItem item : r.getItems()) {
            sb.append("  ").append(index++).append(") ")
              .append(item.getVariant().getProduct().getName())
              .append(" (").append(item.getVariant().getColor())
              .append(", ไซส์ ").append(item.getVariant().getSize()).append(")")
              .append(" จำนวน ").append(item.getQuantity())
              .append(" = ").append(item.getSubtotal()).append(" บาท\n");
        }

        sb.append("---------------------------\n");
        sb.append("ยอดรวม: ").append(r.getTotalPrice()).append(" บาท\n");
        if (r.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append("ส่วนลด: ").append(r.getDiscount()).append(" บาท\n");
        }
        sb.append("ยอดสุทธิที่ต้องชำระ: ").append(r.getNetPrice()).append(" บาท\n");
        sb.append("สถานะ: ").append(r.getStatus()).append("\n");

        return sb.toString();
    }

    private String generateBookingCode() {
        long count = rentalRepository.count() + 1;
        return String.format("B%04d", count);
    }
}