# Selectt Cars — Meta Catalog Setup & Configuration Guide 🚗📱

Iss guide me step-by-step bataya gaya hai ki **Selectt website ke vehicle inventory ko Meta (Facebook & Instagram) Catalog ke saath kaise configure aur connect karna hai**.

---

## 📌 Overview (Yeh Kaise Kaam Karta Hai)

Selectt system me 2 tareeqe diye gaye hain:

| Method | Description | Setup Time | Recommended |
|---|---|---|---|
| **Option A: Scheduled Data Feed** | Meta har ghante / roz website ke Live Feed URL (CSV/XML) se cars fetch karega. | 2 Minutes | ⭐ Yes (Best & Stable) |
| **Option B: Real-Time Graph API** | Admin portal me car add/edit hote hi usi second Meta API me push ho jayegi. | 5 Minutes | Optional / Advanced |

---

## 🔗 Live Data Feed URLs (Aapke Feed Links)

Aapki website live feed generate karti hai:

* **CSV Data Feed (Recommended)**: 
  ```text
  https://selectt.in/api/feeds/meta-catalog.csv
  ```
  *(Localhost test URL: `http://localhost:5000/api/feeds/meta-catalog.csv`)*

* **XML / RSS 2.0 Feed**: 
  ```text
  https://selectt.in/api/feeds/meta-catalog.xml
  ```

* **JSON Feed**: 
  ```text
  https://selectt.in/api/feeds/meta-catalog.json
  ```

---

## 🚀 Option A: Scheduled Data Feed Setup (2 Minutes Step-by-Step)

Yeh sabse asaan aur reliable tareeqa hai jisme aapko koi API token ki zaroorat nahi padti:

### Step 1: Meta Commerce Manager Open Karein
1. Browser me open karein: [https://business.facebook.com/commerce_manager](https://business.facebook.com/commerce_manager)
2. Apna **Business Account** aur **Vehicle / Product Catalog** select karein.
   *(Agar catalog nahi bana hai, to **Add Catalog** > **Vehicles / Automotive** select karein)*.

### Step 2: Data Source Add Karein
1. Left sidebar me **Catalog** > **Data Sources** par click karein.
2. **Add Items** (ya *Add Vehicles*) button par click karein.
3. Select karein: **Data Feed** (Spreadsheet or file) aur **Next** dabayein.

### Step 3: Scheduled Feed URL Paste Karein
1. Select karein: **Set a Schedule**.
2. **Feed URL** box me paste karein:
   ```text
   https://selectt.in/api/feeds/meta-catalog.csv
   ```
3. **Schedule Frequency**: 
   * **Hourly** (har ghante auto-update) ya **Daily** (roz auto-update) select karein.
4. **Default Currency**: `INR` (Indian Rupee) select karein.
5. Click **Save Feed and Upload**.

### Step 4: Verification
Meta 10-30 seconds me aapki saari cars import kar lega. Aap **Catalog > Items** tab me jaakar apni saari cars live dekh sakte hain!

---

## ⚡ Option B: Real-Time Graph API Sync Setup (Instant Sync)

Agar aap chahte hain ki Admin Panel me car create/edit hote hi instant sync ho:

### Step 1: Meta Access Token & Catalog ID Nikalein
1. [Meta Business Settings](https://business.facebook.com/settings) me jaayein.
2. **Accounts > System Users** me jaayein (ya naya system user banayein with Admin role).
3. **Generate New Token** par click karein aur ye permissions check karein:
   * `catalog_management`
   * `ads_management`
   * `business_management`
4. Generated Token ko copy karein.
5. [Meta Commerce Manager](https://business.facebook.com/commerce_manager) me **Catalog Settings** se apna **Catalog ID** (numbers) copy karein.

### Step 2: Selectt Admin Panel me Configure Karein
1. Admin Panel me login karein: `https://admin.selectt.in` (ya `http://localhost:5174`).
2. Left Menu me jaayein: **Site Settings** > **Meta Catalog Setup** (`/settings/meta-catalog`).
3. Form me fields fill karein:
   * **Meta Catalog ID**: Apna Catalog ID paste karein.
   * **Meta System User Access Token**: Apna Token paste karein.
   * **Meta Pixel ID** *(Optional)*: Apna Facebook Pixel ID dalein.
   * **Real-Time Auto-Sync**: Toggle switch ko **ON** karein.
4. Click karein: **Save Meta Catalog Configuration**.

### Step 3: Test & Force Sync
1. **Test Connection** button dabayein — Green tick aane par aapka connection verified ho jayega.
2. **Force Sync All** button dabayein — Website ki saari active cars ek click me Meta Catalog me push ho jayengi.

---

## 📊 Meta Catalog Fields Mapping (Website se Meta tak)

Website har car ke liye Meta Automotive standard fields bhejti hai:

| Meta Catalog Field | Selectt Database Column | Example Value |
|---|---|---|
| `id` / `retailer_id` | `SELECTT-CAR-{id}` | `SELECTT-CAR-102` |
| `title` | `{year} {make} {model} {variant}` | `2022 Hyundai Creta SX(O)` |
| `description` | Specs + Features + Inspection Summary | `Driven 34,000 KM, Petrol, Manual...` |
| `availability` | `in stock` / `out of stock` | `in stock` (status active/in_stock) |
| `condition` | Fixed | `used` |
| `price` | `price` + currency | `850000 INR` |
| `sale_price` | `offer_price` + currency | `820000 INR` |
| `link` | Canonical Car URL | `https://selectt.in/cars/102` |
| `image_link` | Main Car Photo URL | `https://selectt.in/uploads/car-102.webp` |
| `additional_image_link` | Gallery Images | Comma-separated full image URLs |
| `make` / `brand` | `make` | `Hyundai` |
| `model` | `model` | `Creta` |
| `year` | `year` | `2022` |
| `mileage.value` | `km` | `34000` |
| `mileage.unit` | Fixed | `KM` |
| `transmission` | `transmission` | `Manual` |
| `fuel_type` | `fuel_type` | `Petrol` |
| `body_style` | `body_type` | `SUV` |
| `color` | `color` | `Polar White` |
| `custom_label_0` | Quality Badge | `Selectt Assured` |
| `custom_label_1` | Ownership | `1st Owner` |
| `custom_label_2` | Location | `Raipur Hub` |

---

## 🛠️ Admin Panel Controls Overview

Aap **Admin Portal > Site Settings > Meta Catalog Setup** page se ye sab kar sakte hain:
* **Live Feed URL Copy & Preview**: 1-click CSV/XML copy and browser preview.
* **Force Sync All**: Ek click me sabhi active cars Meta me sync karna.
* **Catalog Health Auditor**: Check karna ki kisi car me photo ya price missing to nahi hai.
* **Auto-Sync Toggle**: Instant background push ko chalu ya band karna.

---

## ❓ Frequently Asked Questions (FAQ)

#### Q1: Nayi car website pe upload karne ke baad Meta pe kab dikhegi?
* **Option A (Scheduled Feed)**: Meta ke schedule ke hisaab se (Hourly ya Daily). Aap Commerce Manager me jaakar "Upload Now" bhi daba sakte hain.
* **Option B (Real-time Sync ON)**: Instant 1-2 seconds ke andar!

#### Q2: Agar koi car "Sold Out" ya Delete ho gayi to?
* Feed me us car ki availability automatically `out of stock` ho jayegi ya delete request chali jayegi, jisse ads me sold-out gaadi nahi dikhegi.

#### Q3: Kya Dynamic Facebook Ads chala sakte hain?
* Haan! Meta Ads Manager me campaign create karte waqt **Catalog Sales** ya **Advantage+ catalog ads** select karein aur ye catalog choose karein.

---

*Generated for Selectt Cars Platform.*
