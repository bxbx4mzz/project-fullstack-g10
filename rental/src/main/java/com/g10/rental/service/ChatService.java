package com.g10.rental.service;

import com.g10.rental.entity.Product;
import com.g10.rental.entity.ProductVariant;
import com.g10.rental.repository.ProductRepository;
import com.g10.rental.repository.ProductVariantRepository;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    public ChatService(
        ChatClient.Builder chatClientBuilder,
        ProductRepository productRepository,
        ProductVariantRepository productVariantRepository
    ) {
        this.chatClient = chatClientBuilder.build();
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
    }

    public String chat(String message) {
        List<Product> products = productRepository.findAll();
        String productContext = buildProductContext(products);
        String systemPrompt = """
            คุณเป็นผู้ช่วยของร้านเช่าชุด

            ให้ตอบคำถามของลูกค้าโดยอ้างอิงข้อมูลสินค้าจาก Database
            ที่ได้รับด้านล่างเท่านั้น

            กฎ:
            - ห้ามแต่งชื่อสินค้า ราคา สี ไซซ์ หรือ stock ขึ้นมาเอง
            - ถ้าไม่มีข้อมูลที่ตรงกับคำถาม ให้บอกว่าไม่พบข้อมูล
            - ถ้าถามเรื่องราคา ให้ใช้ราคาจาก Database
            - ถ้าถามเรื่องสีหรือไซซ์ ให้ดูจาก Product Variant
            - ตอบเป็นภาษาไทย กระชับและเข้าใจง่าย
            - ใช้ข้อมูลสินค้าใน Database เป็นแหล่งข้อมูลหลัก
            - สามารถแนะนำหรือจัดอันดับสินค้าให้เหมาะกับความต้องการของผู้ใช้ได้
            - ห้ามสร้างชื่อสินค้า ราคา สี ไซซ์ stock หรือคุณสมบัติของสินค้าที่ไม่มีใน Database
            - หากผู้ใช้ไม่ได้ระบุสี ไซซ์ หรือคุณสมบัติเฉพาะ ห้ามสมมติว่าผู้ใช้ต้องการสิ่งนั้น
            - หากมีหลายสินค้าที่เหมาะสม สามารถแนะนำได้หลายตัว
            - ถ้าข้อมูลใน Database ไม่เพียงพอ ให้บอกผู้ใช้ตรง ๆ

            ข้อมูลสินค้าจาก Database:
            %s
            """.formatted(productContext);

        return chatClient
            .prompt()
            .system(systemPrompt)
            .user(message)
            .call()
            .content();
    }

    private String buildProductContext(List<Product> products) {

        if (products.isEmpty()) {
            return "ไม่มีสินค้าในระบบ";
        }

        StringBuilder context = new StringBuilder();

        for (Product product : products) {

            context.append("สินค้า:\n");
            context.append("- ID: ")
                    .append(product.getId())
                    .append("\n");

            context.append("- ชื่อ: ")
                    .append(product.getName())
                    .append("\n");

            context.append("- รายละเอียด: ")
                    .append(product.getDescription())
                    .append("\n");

            context.append("- หมวดหมู่: ")
                    .append(product.getCategory())
                    .append("\n");

            context.append("- ราคาเริ่มต้น: ")
                    .append(product.getPrice())
                    .append("\n");

            context.append("- Stock รวม: ")
                    .append(product.getStock())
                    .append("\n");

            List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());

            if (variants.isEmpty()) {
                context.append("- Variant: ไม่มี\n");
            } else {
                context.append("- Variants:\n");

                for (ProductVariant variant : variants) {

                    context.append("  - SKU: ")
                            .append(variant.getSku())
                            .append("\n");

                    context.append("    Size: ")
                            .append(variant.getSize())
                            .append("\n");

                    context.append("    Color: ")
                            .append(variant.getColor())
                            .append("\n");

                    context.append("    Stock: ")
                            .append(variant.getStockQty())
                            .append("\n");

                    context.append("    ราคา 3 วัน: ")
                            .append(variant.getPrice3Day())
                            .append("\n");

                    context.append("    ราคา 5 วัน: ")
                            .append(variant.getPrice5Day())
                            .append("\n");

                    context.append("    ราคา 7 วัน: ")
                            .append(variant.getPrice7Day())
                            .append("\n");

                    context.append("    ราคาเพิ่มต่อวัน: ")
                            .append(variant.getExtraDayPrice())
                            .append("\n");
                }
            }

            context.append("\n-------------------------\n\n");
        }

        return context.toString();
    }
}