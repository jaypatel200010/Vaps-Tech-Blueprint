/* app.js - ERPNext Integration Blueprint Script Core */

// Mock Database Schema Definition for Interactive Modals
const doctypeSchemas = {
  Item: {
    title: "Item (Core Doctype)",
    desc: "Represents products synced from Shopify, Amazon, or Flipkart. Serves as the central repository for stock and sales pricing.",
    fields: [
      { name: "item_code", type: "Data (Primary Key)", desc: "Unique item identifier, mapped to SKU on E-commerce channel." },
      { name: "item_name", type: "Data", desc: "Display name of the product." },
      { name: "item_group", type: "Link (Item Group)", desc: "Product classification (e.g., Electronics, Apparel)." },
      { name: "stock_uom", type: "Link (UOM)", desc: "Unit of measure (e.g., Nos, Box)." },
      { name: "standard_rate", type: "Currency", desc: "Default sales price." },
      { name: "valuation_method", type: "Select", desc: "FIFO or Moving Average valuation." },
      { name: "disabled", type: "Check", desc: "Status indicating if item is active." }
    ]
  },
  Sales_Order: {
    title: "Sales Order (Core Doctype)",
    desc: "A draft/confirmed sales document created in ERPNext automatically when an order is paid and synced from Shopify, Amazon, or Flipkart.",
    fields: [
      { name: "name", type: "Data (Primary Key)", desc: "Auto-generated sequence number (e.g., SO-2026-00001)." },
      { name: "customer", type: "Link (Customer)", desc: "The customer placing the order." },
      { name: "transaction_date", type: "Date", desc: "Date the order was placed." },
      { name: "ecommerce_order_id", type: "Data", desc: "External ID from Shopify/Amazon/Flipkart." },
      { name: "items", type: "Table (Sales Order Item)", desc: "Child table listing SKU codes, quantities, and order rates." },
      { name: "grand_total", type: "Currency", desc: "Net order value after tax/discounts." },
      { name: "delivery_status", type: "Select", desc: "Tracking field (To Deliver, Fully Delivered)." }
    ]
  },
  Stock_Ledger_Entry: {
    title: "Stock Ledger Entry (Core Doctype)",
    desc: "System-generated transaction record tracking inventory addition or deduction. Updated automatically upon item delivery or restocking.",
    fields: [
      { name: "item_code", type: "Link (Item)", desc: "Item whose stock levels changed." },
      { name: "warehouse", type: "Link (Warehouse)", desc: "The specific warehouse stock is being moved from/to." },
      { name: "posting_date", type: "Date", desc: "Date of stock movement." },
      { name: "actual_qty", type: "Float", desc: "Quantity change (negative for sales deduction, positive for purchase/returns)." },
      { name: "voucher_type", type: "Select", desc: "Voucher link (Delivery Note, Stock Entry)." },
      { name: "valuation_rate", type: "Currency", desc: "Item cost rate at this ledger entry instance." }
    ]
  },
  Job_Opening: {
    title: "Job Opening (Core Doctype)",
    desc: "Job vacancy listed in the ERPNext HR module, which is natively published to the built-in portal.",
    fields: [
      { name: "job_title", type: "Data", desc: "Role name (e.g., Senior Python Engineer)." },
      { name: "department", type: "Link (Department)", desc: "Department offering the role." },
      { name: "designation", type: "Link (Designation)", desc: "Official job role designation." },
      { name: "staffing_plan", type: "Link (Staffing Plan)", desc: "Budgeted staffing plan linked for resource validation." },
      { name: "publish_on_website", type: "Check", desc: "Toggle to display this vacancy on the built-in jobs page." },
      { name: "description", type: "Text Editor", desc: "Detailed requirements and responsibilities list." }
    ]
  },
  Job_Applicant: {
    title: "Job Applicant (Core Doctype)",
    desc: "Candidate application data recorded directly from applicant submittals on the ERPNext web portal.",
    fields: [
      { name: "applicant_name", type: "Data", desc: "Full name of applicant." },
      { name: "email_id", type: "Data", desc: "Applicant primary contact email." },
      { name: "phone_number", type: "Data", desc: "Applicant contact phone number." },
      { name: "job_title", type: "Link (Job Opening)", desc: "The job opening the applicant applied for." },
      { name: "status", type: "Select", desc: "Application stage (Applied, Shortlisted, Interview, Rejected, Hired)." },
      { name: "resume_attachment", type: "Attach", desc: "Uploaded file link of the resume." }
    ]
  },
  Employee: {
    title: "Employee (Core Doctype)",
    desc: "Primary staff database node in ERPNext HR. Created automatically once a candidate's Job Applicant card moves to 'Hired'.",
    fields: [
      { name: "employee_id", type: "Data (Primary)", desc: "Unique company employee ID (e.g., EMP-0291)." },
      { name: "first_name", type: "Data", desc: "Given first name." },
      { name: "personal_email", type: "Data", desc: "Personal email address." },
      { name: "date_of_joining", type: "Date", desc: "Official employment start date." },
      { name: "user_id", type: "Link (User)", desc: "System login record link mapping to user accounts." },
      { name: "reports_to", type: "Link (Employee)", desc: "Direct manager assignment." }
    ]
  },
  Social_Profile: {
    title: "Social Profile (Custom Doctype)",
    desc: "User handle record representing a social profile inside the social media platform. Maps standard system User accounts to handles.",
    fields: [
      { name: "name", type: "Data (Primary Key)", desc: "Unique social media handle (e.g., @matiyas_joy)." },
      { name: "user", type: "Link (User)", desc: "Associated user profile login details." },
      { name: "bio", type: "Small Text", desc: "Biography/profile summary visible on search." },
      { name: "avatar", type: "Attach Image", desc: "Profile image upload attachment path." },
      { name: "followers_count", type: "Int", desc: "Read-only summary of followers count." },
      { name: "following_count", type: "Int", desc: "Read-only summary of profiles followed." }
    ]
  },
  DM_Room: {
    title: "DM Room (Custom Doctype)",
    desc: "Tracks the direct messaging channel connection linking two Social Profiles in a private 1-to-1 environment.",
    fields: [
      { name: "room_id", type: "Data (PK)", desc: "Unique room tracking key string." },
      { name: "profile_1", type: "Link (Social Profile)", desc: "Initiator profile." },
      { name: "profile_2", type: "Link (Social Profile)", desc: "Recipient profile." },
      { name: "created_on", type: "Datetime", desc: "Exact moment the conversation was initialized." },
      { name: "is_active", type: "Check", desc: "Indicates whether the channel is visible/active." }
    ]
  },
  Direct_Message: {
    title: "Direct Message (Custom Doctype)",
    desc: "Database node tracking individual message log transactions sent in private DM Rooms.",
    fields: [
      { name: "room_id", type: "Link (DM Room)", desc: "Associated DM channel." },
      { name: "sender", type: "Link (Social Profile)", desc: "Author profile handle." },
      { name: "message_content", type: "Text", desc: "Content text string of the message." },
      { name: "sent_at", type: "Datetime", desc: "Timestamp detailing message event." },
      { name: "attachment", type: "Attach", desc: "Optional media file reference link." }
    ]
  },
  Subscription_Plan: {
    title: "Subscription Plan (Core Doctype)",
    desc: "Defines subscription configuration parameters: cost, billing cycle intervals, and trial durations.",
    fields: [
      { name: "plan_name", type: "Data", desc: "Name of subscription (e.g., Live Stream Monthly Base)." },
      { name: "cost", type: "Currency", desc: "Recurring cost billed each cycle." },
      { name: "billing_interval", type: "Select", desc: "Billing frequency (Month, Year, Day)." },
      { name: "interval_count", type: "Int", desc: "Number of intervals per billing cycle." }
    ]
  },
  Subscription: {
    title: "Subscription (Core Doctype)",
    desc: "Stores active/expired subscription nodes tracking customer authorization status for the streaming server validation API.",
    fields: [
      { name: "customer", type: "Link (Customer)", desc: "Paying customer subscriber." },
      { name: "plans", type: "Table (Subscription Plan Detail)", desc: "Subscription plans linked to this subscription." },
      { name: "status", type: "Select", desc: "Subscription status (Trialling, Active, Past Due, Cancelled, Unpaid)." },
      { name: "current_start", type: "Date", desc: "Start date of the current active cycle." },
      { name: "current_end", type: "Date", desc: "Expiration date of the current cycle. If current date exceeds this, streaming auth drops." },
      { name: "sales_invoice_series", type: "Link (Naming Series)", desc: "Naming configuration for monthly invoices automatically generated." }
    ]
  }
};

// Application State Management
const appState = {
  dbCounts: {
    orders: 14,
    applicants: 8,
    messages: 45,
    subscriptions: 122
  }
};

// DOM Elements & Routing Setup
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initModals();
  updateDashboardCounts();
});

// Single Page Tab Navigation Logic
function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".page-section");

  navItems.forEach(item => {
    item.querySelector("button").addEventListener("click", () => {
      const targetSectionId = item.getAttribute("data-target");

      // Update Nav active indicator
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      // Show/Hide Page Sections
      sections.forEach(section => {
        if (section.id === targetSectionId) {
          section.classList.add("active");
        } else {
          section.classList.remove("active");
        }
      });
      
      // Auto-scroll main window back to top on switch
      document.querySelector(".main-content").scrollTop = 0;
    });
  });

  // Support clicking overview cards to navigate to respective detail pages
  document.querySelectorAll(".overview-card").forEach(card => {
    card.addEventListener("click", () => {
      const targetModule = card.getAttribute("data-module");
      const matchedNavItem = document.querySelector(`.nav-item[data-target="${targetModule}"]`);
      if (matchedNavItem) {
        matchedNavItem.querySelector("button").click();
      }
    });
  });
}

// Doctype Schema Modals Controller
function initModals() {
  const modal = document.getElementById("doctype-modal");
  const modalClose = modal.querySelector(".modal-close-btn");
  
  // Attach event listeners to all doctype buttons
  document.body.addEventListener("click", (e) => {
    const docItem = e.target.closest(".doctype-item");
    if (docItem) {
      const schemaName = docItem.getAttribute("data-doctype");
      const schemaData = doctypeSchemas[schemaName];
      if (schemaData) {
        openDoctypeModal(schemaData);
      }
    }
  });

  modalClose.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

function openDoctypeModal(schema) {
  const modal = document.getElementById("doctype-modal");
  const titleEl = modal.querySelector(".modal-title-text");
  const descEl = modal.querySelector(".modal-description-text");
  const tbody = modal.querySelector("#modal-fields-tbody");

  titleEl.textContent = schema.title;
  descEl.textContent = schema.desc;
  tbody.innerHTML = "";

  schema.fields.forEach(field => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="field-name">${field.name}</td>
      <td><span class="field-type-badge">${field.type}</span></td>
      <td style="color: var(--text-muted);">${field.desc}</td>
    `;
    tbody.appendChild(tr);
  });

  modal.style.display = "flex";
}

// Update Counters printed on the UI Dashboard
function updateDashboardCounts() {
  const ecommerceCount = document.getElementById("count-ecommerce");
  const jobsCount = document.getElementById("count-jobs");
  const messagingCount = document.getElementById("count-messaging");
  const streamingCount = document.getElementById("count-streaming");

  if (ecommerceCount) ecommerceCount.textContent = appState.dbCounts.orders;
  if (jobsCount) jobsCount.textContent = appState.dbCounts.applicants;
  if (messagingCount) messagingCount.textContent = appState.dbCounts.messages;
  if (streamingCount) streamingCount.textContent = appState.dbCounts.subscriptions;
}
