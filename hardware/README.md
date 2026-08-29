# Gram Panchayat Hardware Kiosk Station - Physical-Digital Bridge

This hardware module bridges the digital divide for rural beneficiaries without smartphones or internet literacy. Located at the Gram Panchayat office, beneficiaries tap an RFID smart card / Aadhaar token to instantly compute their MoSJE concessional credit eligibility, void feasibility, and receive a thermal printed physical EMI roadmap and DPR receipt.

## Hardware Architecture & Pinout Map

```
                +-------------------------+
                |       Arduino Uno       |
                +-------------------------+
                     |       |       |
      SPI Bus        |       |       |   Software Serial
  (Pins 9,10,11,12,13)       |       |     (Pins 5, 6)
       +-------------+       |       +---------------+
       | MFRC522 RFID|       |       | Thermal Printer|
       | Card Reader |       |       | (QR-73 ESC/POS)|
       +-------------+       |       +---------------+
                             |
                      I2C Bus (A4 SDA, A5 SCL)
                             |
                     +---------------+
                     | 16x2 LCD with |
                     | PCF8574 I2C   |
                     +---------------+
```

## Bill of Materials (BOM)

| Component | Specification | Function |
|---|---|---|
| **Microcontroller** | Arduino Uno R3 / ESP32 DevKit | Main processing unit |
| **RFID Reader** | MFRC522 / PN532 (13.56 MHz) | Contactless beneficiary card login |
| **Thermal Printer** | Adafruit Mini Thermal / QR-73 TTL | Prints hardcopy EMI roadmap & receipt |
| **Display** | 1602 LCD with I2C Backpack (0x27) | Step-by-step visual guidance |
| **Feedback** | 5V Active Buzzer & Bi-color LEDs | Acoustic & visual state indication |
| **Power Supply** | 9V-12V 2A DC Adapter | Powers printer thermal head and Arduino |

## Deployment & Demonstration Steps for Hackathon Jury

1. Connect Arduino via USB to host laptop.
2. Open `hardware/kiosk_firmware.ino` in Arduino IDE.
3. Install dependencies: `MFRC522`, `LiquidCrystal_I2C`.
4. Upload sketch to Arduino Uno.
5. Tap an RFID card to witness real-time 10% equity sizing and instant receipt printing.
6. Alternatively, interact with the **Gram Panchayat Kiosk Virtual Simulator** built directly into the web application.
