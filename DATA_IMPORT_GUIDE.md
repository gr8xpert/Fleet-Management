# Bus Fleet Manager - Data Import Guide

This guide maps your Excel sheets from "BUSES GARAGE SHEET.xlsx" to the web application modules.

---

## Quick Reference Table

| App Module | Excel Sheets to Import |
|------------|----------------------|
| **Vehicles** | MULKIYA, NUM PLATE SHEET, COMPANY MULKIYA EXPIRY SHEET, BUS NAME & MOB |
| **Maintenance** | OIL CHANGE SHEET, AC CLEANING, BATTERY SHEET, COMPRESSOR, PREMIER AUTO |
| **Spare Parts** | SPARE PARTS, SPARE PARTS JAN 2025, MAAN ORDER SHEET |
| **Employees** | DRIVERS CONTACT #, SALARY CARD PINS, CARDS DETAIL |
| **Salaries** | SALARIES, SALARY SHEET, ADVANCE SALARY SHEET, WITHDRAWAL SALARY RECORD |
| **Visas** | VISA STATUS, VISA EXPIRY SHEET, VISA SUBMITTED SHEET, VISA CHARGES |
| **Fines** | DRIVER FINE SHEET, EVERY MONTH FINE, MAAN FINE, DUBAI # PLATE FINE |
| **Expenses** | SALIK, FUEL SHEET, INDIA TYRE |
| **Income** | BUS SALE INSTALLMENT PLAN, NEW CUSTOMER SHEET |
| **Cheques** | BUSES CHQ DETAIL, R60 CHQ, PLOT CHQ DETAILS |
| **Customers** | NEW CUSTOMER SHEET |

---

## Detailed Module Mapping

### 1. VEHICLES MODULE

**Primary Sheets:**

#### MULKIYA (Main Vehicle Registry)
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| BUS # | Bus Number | e.g., R24, R25 |
| PLATE # | Plate Number | e.g., 4/84331 |
| EXPIRY DATE | Mulkiya Expiry | Document expiry tracking |
| INSURANCE DATE | Insurance Expiry | Insurance tracking |
| PASSING | Passing Date | - |
| MULKIYA | Mulkiya Amount/Status | - |

#### Also Import:
- **NUM PLATE SHEET** - Number plate details
- **NUM PLATE MULKIYA EXPIRY DATES** - Expiry tracking
- **COMPANY MULKIYA EXPIRY SHEET** - Company vehicles
- **PLATE NUM MULKIYA SHEET** - Plate-Mulkiya mapping
- **BUS NAME & MOB** - Bus details with contacts
- **PARKING PERMIT** - Parking permits per vehicle
- **TOYOTA YARIS CAR** - Non-bus vehicles

**How to Enter in App:**
1. Go to **Vehicles** → Click **Add Vehicle**
2. Enter: Bus Number, Plate Number, Type, Owner
3. Add document expiry dates (Mulkiya, Insurance)

---

### 2. MAINTENANCE MODULE

**Primary Sheets:**

#### OIL CHANGE SHEET
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| DATE | Service Date | When service was done |
| BUS NO | Vehicle | Link to vehicle |
| DESCRIPTION | Type | "Oil Change" |
| AMOUNT | Cost | AED amount |
| STATUS | Status | Paid/Pending |

#### AC CLEANING
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| DATE | Service Date | - |
| BUS NO | Vehicle | - |
| DESCRIPTION | Type | "AC Cleaning" |
| AMOUNT | Cost | - |

#### Also Import:
- **BATTERY SHEET** - Battery replacements
- **COMPRESSOR** - AC compressor repairs
- **PREMIER AUTO** - Vendor service records
- **PENDING WORK** - Scheduled maintenance

**How to Enter in App:**
1. Go to **Maintenance** → Click **Log Maintenance**
2. Select Vehicle, Type (oil_change, ac_service, etc.)
3. Enter date, cost, vendor, notes

---

### 3. SPARE PARTS MODULE

#### SPARE PARTS / SPARE PARTS JAN 2025
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| DATE | Purchase Date | - |
| BUS NO | Used For Vehicle | Optional |
| DESCRIPTION | Part Name | e.g., PATTI, FILTER |
| AMOUNT | Cost | AED amount |
| STATUS | Status | Paid/Pending |

#### MAAN ORDER SHEET
- Parts ordered from specific vendor

**How to Enter in App:**
1. Go to **Spare Parts** → Click **Add Part**
2. Enter part name, quantity, unit cost, vendor

---

### 4. EMPLOYEES MODULE

#### DRIVERS CONTACT #
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| DRIVER NAME | Name | Full name |
| MOB # | Phone | Primary contact |

#### SALARY CARD PINS / CARDS DETAIL
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| CARD NAME | Employee Name | - |
| Card details | Bank Account | Card/account info |
| PIN | - | Store securely |

#### Also Import:
- **VACATION SHEET** - Leave records

**How to Enter in App:**
1. Go to **Employees** → Click **Add Employee**
2. Enter: Name, Type (driver/mechanic/etc.), Phone
3. Add: Nationality, Emirates ID, License details
4. Add: Bank account, Salary info

---

### 5. SALARIES (Under Employees)

#### SALARIES / SALARY SHEET
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| CARD NAME | Employee | Link to employee |
| DEPOSIT AMOUNT | Amount | Monthly salary |
| WITHDRAWAL AMOUNT | Paid Amount | - |
| REMAINING AMOUNT | Balance | - |

#### ADVANCE SALARY SHEET
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| Employee | Employee | - |
| Amount | Advance Amount | - |
| Date | Date | When given |

#### Also Import:
- **WITHDRAWAL SALARY RECORD** - Payment history
- **SALARIES YEARLY PORTAL FEE** - Annual fees

---

### 6. VISAS MODULE

#### VISA STATUS
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| NAME | Employee | Link to employee |
| CANCELLATION DATE | Expiry Date | - |
| POOL INSU | - | Insurance status |
| LABOUR FEE | - | Fee paid |
| E VISA | Visa Number | - |
| MEDICAL | Medical Status | Done/Pending |
| EID | Emirates ID | - |

#### VISA EXPIRY SHEET
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| Name | Employee | - |
| Expiry Date | Visa Expiry | For alerts |

#### Also Import:
- **VISA SUBMITTED SHEET** - Applications in progress
- **VISA CHARGES** - Costs per visa
- **VISA AMOUNT PENDING** - Unpaid amounts
- **VISA FINE SEP DETAIL** - Visa-related fines

**How to Enter in App:**
1. Go to **Visas** → Click **Add Visa**
2. Select Employee, Enter Visa Number, Type, Expiry Date
3. Track costs and status

---

### 7. FINES MODULE

#### DRIVER FINE SHEET
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| DATE | Fine Date | When fine was issued |
| DRIVER NAME | Driver | Link to employee |
| DESCRIPTION | Description | Reason for fine |
| AMOUNT | Amount | AED |

#### EVERY MONTH FINE
- Monthly fine summary per driver

#### Also Import:
- **MAAN FINE** - Specific driver fines
- **DUBAI # PLATE FINE** - Dubai plate fines
- **JAVED FINE SHEET** - Specific driver fines

**How to Enter in App:**
1. Go to **Fines** → Click **Add Fine**
2. Select Vehicle and/or Driver
3. Enter: Fine Number, Date, Amount, Description
4. Mark as Paid/Unpaid

---

### 8. EXPENSES MODULE

#### SALIK (Toll)
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| Date | Date | - |
| Vehicle | Vehicle | - |
| Amount | Amount | Toll charge |

#### FUEL SHEET
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| Date | Date | - |
| Vehicle | Vehicle | - |
| Liters | Description | Fuel amount |
| Amount | Amount | Cost |

#### Also Import:
- **INDIA TYRE** - Tire expenses
- **HOLIDAY EXP** - Holiday bonuses

**How to Enter in App:**
1. Go to **Expenses** → Click **Add Expense**
2. Select Category (Fuel, Toll, Maintenance, etc.)
3. Enter: Date, Amount, Description
4. Link to Vehicle if applicable

---

### 9. INCOME MODULE

#### BUS SALE INSTALLMENT PLAN
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| Bus | Description | Bus being sold |
| Buyer | Customer | Link to customer |
| Amount | Amount | Total/installment |
| Date | Date | Payment date |

**How to Enter in App:**
1. Go to **Income** → Click **Add Income**
2. Select Category (Bus Sale, Rental, Service)
3. Enter: Date, Amount, Customer, Description

---

### 10. CHEQUES MODULE

#### BUSES CHQ DETAIL
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| Bus/Customer | Party Name | Who gave/received |
| Amount | Amount | Cheque amount |
| Details | Description | Notes |

**How to Enter in App:**
1. Go to **Cheques** → Click **Add Cheque**
2. Select Type (Received/Issued)
3. Enter: Cheque Number, Bank, Date, Amount
4. Mark status (Pending/Cleared/Bounced)

---

### 11. CUSTOMERS MODULE

#### NEW CUSTOMER SHEET
| Excel Column | App Field | Notes |
|--------------|-----------|-------|
| Bus | - | Vehicle assigned |
| Customer Name | Name | e.g., "Moly EFS" |
| MOB # | Phone | Contact number |
| Location | Address | Pickup point |
| Destination | - | Drop location |
| Timing | - | Schedule |
| Rate | - | Monthly rate |

**How to Enter in App:**
1. Go to **Customers** → Click **Add Customer**
2. Enter: Name, Company, Phone, Email, Address

---

## Sheets to SKIP (Not needed for import)

These are personal tracking sheets or duplicates:
- Sheet1 through Sheet26 (unnamed/temp sheets)
- ADNAN SHEET, MUJAHID, BABA, IRFAN SHEET (personal)
- REGISTER, REGISTER IRFAN (internal tracking)
- EVG sheets (specific project tracking)
- PLOT PAYMENT DETAIL, RAZIQ ROOM RENT (non-business)
- CCARD, eti close account (banking)
- HUSNAIN LAL SIMS, SIMS BILL HISTORY (SIM cards)

---

## Recommended Import Order

1. **Vehicles First** - Import all buses from MULKIYA
2. **Employees Second** - Import from DRIVERS CONTACT #
3. **Customers** - Import from NEW CUSTOMER SHEET
4. **Visas** - Link to employees
5. **Fines** - Link to vehicles/drivers
6. **Maintenance Records** - Historical data
7. **Expenses & Income** - Financial records
8. **Cheques** - Payment tracking

---

## Tips for Data Entry

1. **Start Fresh** - Enter current active data first, historical later
2. **Use Consistent Names** - "R24" not "R-24" or "R 24"
3. **Date Format** - Use DD/MM/YYYY consistently
4. **Link Records** - Always link fines to drivers, maintenance to vehicles
5. **Set Expiry Alerts** - The app will auto-alert 30 days before expiry

---

## Need Help?

If you have questions about specific sheets or need the app modified to match your Excel structure better, let me know!
