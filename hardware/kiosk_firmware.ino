/*
  SIH26091 - Gram Panchayat Hardware Kiosk Station
  Beneficiary RFID Smart Card Reader & Thermal Printer Subsystem
  
  Target Platform: Arduino Uno / Nano / ESP32
  Peripherals:
    - MFRC522 RFID Reader (SPI: Pins 9, 10, 11, 12, 13)
    - Adafruit Thermal Printer / QR-73 ESC/POS (SoftwareSerial: Pins 5 RX, 6 TX)
    - LiquidCrystal_I2C 16x2 Display (I2C: A4 SDA, A5 SCL)
    - Status LEDs: Pin 7 (Green - Approved), Pin 8 (Red - Risk/Veto)
    - Buzzer: Pin 4
    
  Ministry of Social Justice & Empowerment (MoSJE) - Concessional Credit Kiosk
*/

#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SoftwareSerial.h>

// Pin Definitions
#define RST_PIN         9
#define SS_PIN          10
#define PRINTER_RX      5
#define PRINTER_TX      6
#define BUZZER_PIN      4
#define LED_GREEN       7
#define LED_RED         8

// Peripherals initialization
MFRC522 mfrc522(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2);
SoftwareSerial printerSerial(PRINTER_RX, PRINTER_TX);

// Beneficiary Profile Data Structure
struct BeneficiaryCard {
  String uid;
  String name;
  String category;
  float marginCash;
  String sector;
};

// Registered Demonstration Cards
const int NUM_CARDS = 3;
BeneficiaryCard registeredCards[NUM_CARDS] = {
  {"A3 4B 89 2C", "Sunita Devi", "Women / SC", 14000.0, "Handloom Khadi"},
  {"F1 22 9E 4D", "Rameshwar Prasad", "SC", 25000.0, "Spice Milling"},
  {"B4 7C 33 1A", "Kavitha Murugan", "Women / OBC", 12000.0, "Tailoring Unit"}
};

void setup() {
  Serial.begin(9600);
  printerSerial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("MoSJE KIOSK v1.0");
  lcd.setCursor(0, 1);
  lcd.print("TAP BENEFICIARY");
  
  tone(BUZZER_PIN, 1200, 150);
  delay(200);
  tone(BUZZER_PIN, 1800, 150);
  Serial.println(F("[SYSTEM ONLINE] Gram Panchayat Advisory Kiosk Ready."));
}

void loop() {
  // Look for new RFID card
  if (!mfrc522.PICC_IsNewCardPresent()) {
    return;
  }
  if (!mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // Read Card UID
  String cardUID = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    cardUID += String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    cardUID += String(mfrc522.uid.uidByte[i], HEX);
  }
  cardUID.trim();
  cardUID.toUpperCase();
  
  Serial.print(F("Card Detected UID: "));
  Serial.println(cardUID);

  // Audio & Visual Feedback
  tone(BUZZER_PIN, 2000, 200);
  digitalWrite(LED_GREEN, HIGH);
  
  // Lookup Beneficiary
  BeneficiaryCard beneficiary = {"UNKNOWN", "Rural Beneficiary", "SC / ST", 15000.0, "Agro Service"};
  bool cardFound = false;
  for (int i = 0; i < NUM_CARDS; i++) {
    if (registeredCards[i].uid == cardUID) {
      beneficiary = registeredCards[i];
      cardFound = true;
      break;
    }
  }

  // Execute MoSJE 10% Equity Rule & Scheme Routing
  float projectCost = beneficiary.marginCash * 10.0;
  float loanEligible = projectCost * 0.90;
  String schemeTier = (projectCost <= 140000.0) ? "MICRO FINANCE" : "TERM LOAN";
  float interestRate = (projectCost <= 140000.0) ? 5.5 : 7.0; // Subvented rate

  // Display on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(beneficiary.name.substring(0, 16));
  lcd.setCursor(0, 1);
  lcd.print("Loan: Rs." + String((long)loanEligible));

  // Print Thermal Paper Receipt
  printThermalReceipt(beneficiary, projectCost, loanEligible, schemeTier, interestRate);

  delay(3000);
  digitalWrite(LED_GREEN, LOW);
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("MoSJE KIOSK v1.0");
  lcd.setCursor(0, 1);
  lcd.print("TAP BENEFICIARY");

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}

void printThermalReceipt(BeneficiaryCard ben, float projectCost, float loan, String tier, float rate) {
  printerSerial.println(F("================================"));
  printerSerial.println(F("  GRAM PANCHAYAT SMART KIOSK   "));
  printerSerial.println(F("  MoSJE ADVISORY & DPR RECEIPT "));
  printerSerial.println(F("================================"));
  printerSerial.println("NAME     : " + ben.name);
  printerSerial.println("CATEGORY : " + ben.category);
  printerSerial.println("SECTOR   : " + ben.sector);
  printerSerial.println(F("--------------------------------"));
  printerSerial.println("MARGIN (10%): Rs. " + String((long)ben.marginCash));
  printerSerial.println("PROJECT COST: Rs. " + String((long)projectCost));
  printerSerial.println("LOAN (90%)  : Rs. " + String((long)loan));
  printerSerial.println("SCHEME TIER : " + tier);
  printerSerial.println("INT. RATE   : " + String(rate, 1) + "% p.a. (Subvented)");
  printerSerial.println("MORATORIUM  : 3-6 Months Grace");
  printerSerial.println(F("--------------------------------"));
  printerSerial.println(F("STATUS   : PRE-APPROVED (100%)"));
  printerSerial.println(F("SCA REF  : SCA-MOSJE-2026-IND"));
  printerSerial.println(F("================================"));
  printerSerial.println(F("Take this receipt to District SCA"));
  printerSerial.println(F("or Block Development Officer (BDO)\n\n\n"));
}
