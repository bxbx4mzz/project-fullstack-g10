package com.g10.rental.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.g10.rental.entity.Product;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.repository.ProductRepository;
import com.g10.rental.repository.ProductVariantRepository;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ChatService {

    private static final String SYSTEM_PROMPT = """
            คุณเป็นผู้ช่วยของร้านเช่าชุด

            ให้ตอบคำถามของลูกค้าโดยอ้างอิงข้อมูลสินค้าจาก Database
            ที่ได้รับด้านล่างเท่านั้น

            กฎ:
            - ห้ามแต่งชื่อสินค้า ราคา สี ไซซ์ หรือ stock ขึ้นมาเอง
            - ถ้าไม่มีข้อมูลที่ตรงกับคำถาม ให้บอกว่าไม่พบข้อมูล
            - ถ้าถามเรื่องราคา ให้ใช้ราคาจาก Database
            - ถ้าถามเรื่องสีหรือไซซ์ ให้ดูจาก Product Variant
            - ตอบเป็นภาษาไทย กระชับและเข้าใจง่าย
            - สามารถแนะนำหรือจัดอันดับสินค้าให้เหมาะกับความต้องการของผู้ใช้ได้
            - หากผู้ใช้ไม่ได้ระบุสี ไซซ์ หรือคุณสมบัติเฉพาะ ห้ามสมมติว่าผู้ใช้ต้องการสิ่งนั้น
            - หากมีหลายสินค้าที่เหมาะสม สามารถแนะนำได้หลายตัว
            - ถ้าข้อมูลใน Database ไม่เพียงพอ ให้บอกผู้ใช้ตรง ๆ

            ข้อมูลสินค้าจาก Database:
            %s
            """;

    private final RestClient restClient;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final String apiKey;
    private final String model;

    public ChatService(RestClient.Builder restClientBuilder,
                       ProductRepository productRepository,
                       ProductVariantRepository productVariantRepository,
                       @Value("${app.gemini.base-url}") String baseUrl,
                       @Value("${app.gemini.api-key}") String apiKey,
                       @Value("${app.gemini.model}") String model) {
        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.apiKey = apiKey;
        this.model = model;
    }

    @Transactional(readOnly = true)
    public String chat(String message) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ยังไม่ได้ตั้งค่า GEMINI_API_KEY ที่ backend");
        }

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", SYSTEM_PROMPT.formatted(buildProductContext())))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", message))))
        );

        JsonNode response;
        try {
            response = restClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientException ex) {
            log.warn("Gemini request failed: {}", ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "ไม่สามารถติดต่อผู้ช่วย AI ได้ในขณะนี้");
        }

        StringBuilder reply = new StringBuilder();
        if (response != null) {
            for (JsonNode part : response.path("candidates").path(0).path("content").path("parts")) {
                reply.append(part.path("text").asText(""));
            }
        }
        if (reply.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "ผู้ช่วย AI ไม่ได้ส่งคำตอบกลับมา");
        }
        return reply.toString().trim();
    }

    private String buildProductContext() {
        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            return "ไม่มีสินค้าในระบบ";
        }

        StringBuilder context = new StringBuilder();
        for (Product product : products) {
            context.append("สินค้า:\n")
                    .append("- ID: ").append(product.getId()).append('\n')
                    .append("- ชื่อ: ").append(product.getName()).append('\n')
                    .append("- รายละเอียด: ").append(product.getDescription()).append('\n')
                    .append("- หมวดหมู่: ").append(product.getCategory()).append('\n')
                    .append("- ราคาเริ่มต้น: ").append(product.getPrice()).append('\n')
                    .append("- Stock รวม: ").append(product.getStock()).append('\n');

            List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());
            if (variants.isEmpty()) {
                context.append("- Variant: ไม่มี\n");
            } else {
                context.append("- Variants:\n");
                for (ProductVariant v : variants) {
                    context.append("  - SKU: ").append(v.getSku())
                            .append(", Size: ").append(v.getSize())
                            .append(", Color: ").append(v.getColor())
                            .append(", Stock: ").append(v.getStockQty())
                            .append(", ราคา 3 วัน: ").append(v.getPrice3Day())
                            .append(", ราคา 5 วัน: ").append(v.getPrice5Day())
                            .append(", ราคา 7 วัน: ").append(v.getPrice7Day())
                            .append(", ราคาเพิ่มต่อวัน: ").append(v.getExtraDayPrice())
                            .append('\n');
                }
            }
            context.append("-------------------------\n");
        }
        return context.toString();
    }
}
