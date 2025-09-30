import React, { useState, useEffect } from 'react';
import { useMCP } from '../hooks/useMCP.js';

/**
 * Enhanced SOP Generator component
 *
 * This component extends a basic SOP generator by adding built-in
 * templates for several regulatory bodies (CDSCO, BIS, FDA and CE).
 * Users can select their license type and choose a tailored SOP
 * template. The component fills placeholders with the current
 * project, device, version, market and license selections, and
 * provides options to preview, save or download the resulting
 * document. Styling is kept inline and consistent with the rest
 * of the application to ensure seamless integration.
 */

// Template definitions keyed by regulatory body. Each entry
// contains a list of available templates with a name,
// description and the template text. Placeholders enclosed in
// square brackets will be replaced at runtime with project-
// specific details.
const templatesByLicense = {
  CDSCO: [
    {
      name: 'CDSCO Device Master File (DMF) & Plant Master File (PMF) SOP',
      description:
        'Comprehensive template for preparing Device Master File and Plant Master File for CDSCO submissions under Medical Device Rules 2017.',
      content: `CDSCO Device Master File (DMF) & Plant Master File (PMF) Template and SOP
=======================================================================

This document provides a structured template and standard operating procedure (SOP) for preparing the **Device Master File (DMF)** and **Plant Master File (PMF)** required by the Central Drugs Standard Control Organisation (CDSCO) under India's Medical Device Rules, 2017.

## 1. Introduction

**Purpose:** To define the structure and content of the DMF and PMF and provide a step-by-step procedure for their preparation for the medical device project [PROJECT_NAME], version [VERSION_NUMBER] of [DEVICE_NAME] intended for the [MARKET_NAME] market.

**Scope:** Applies to all regulatory, quality and technical personnel involved in preparing documentation for CDSCO submissions. It reflects the requirements of Schedule IV, V and VI of the Medical Device Rules, 2017 and relevant international standards (ISO 13485, ISO 14971, ISO 10993, IS 15354).

## 2. Device Master File (DMF) Template

The DMF should be compiled as a single document with the following sections:

### 2.1 Device Description
• Generic name, GMDN or UMDNS code, intended purpose, classification (Class A/B/C/D)
• Brief description of design and function

### 2.2 Design & Materials
• Design drawings and specifications; dimensions (length, width, wall thickness)
• Bill of materials; material specifications (latex, nitrile, neoprene, accelerators, pigments)
• Biocompatibility summary (ISO 10993 tests performed)

### 2.3 Manufacturing Process
• Flow chart from raw material sourcing → compounding → dipping → vulcanisation → leaching → beading → surface treatment (powdering/chlorination) → stripping → drying → packaging → sterilisation
• Include in-process controls and critical parameters

### 2.4 Essential Principles of Safety & Performance
• List applicable principles and explain how compliance is achieved
• Mechanical integrity, barrier properties, freedom from holes, sterility assurance level, powder residue limits
• Summary of risk management (ISO 14971)

### 2.5 Product Verification & Validation
• Test reports for physical properties (tensile strength, elongation at break)
• Chemical properties (residual accelerators, proteins, powder content)
• Sterility validation (ISO 11737), shelf-life studies (accelerated and real-time stability)
• Packaging validation

### 2.6 Labeling & Packaging
• Samples or drafts of primary and secondary packaging
• Product name, size, batch/lot number, manufacture and expiry dates, sterilisation method
• Instructions for use, warnings, and symbols per ISO 15223-1

### 2.7 Clinical Evaluation & Market History
• Literature review demonstrating clinical performance and safety
• List of markets where device is already approved
• Copies of CE certificates/510(k) clearance if applicable

### 2.8 Annexures
• Full test reports, certificates (ISO 13485, CE, FDA clearances)
• Copies of labels, instructions for use, and other supporting documents

## 3. Plant Master File (PMF) Template

The PMF (or Site Master File) provides a comprehensive description of the manufacturing facility:

### 3.1 General Information
• Name and address of manufacturer; contact details; manufacturing licences
• Organisation chart showing key departments (QA, RA, production, engineering)

### 3.2 Quality Management System
• Copy of ISO 13485 certificate
• Summary of document control, management review, CAPA, change control and training procedures
• Index of SOPs relevant to glove manufacturing

### 3.3 Manufacturing Facility
• Description of premises and layout; clean-room classifications (if any)
• Environmental controls (temperature, humidity, particulate monitoring)
• Utilities (water, steam, compressed air) and maintenance schedules

### 3.4 Equipment & Processes
• List of major equipment (dipping lines, dryers, steriliser)
• Calibration and validation status
• In-process testing equipment (thickness gauge, tensile tester, leak tester) and procedures

### 3.5 Personnel
• Staffing levels and qualifications; training and hygiene programmes
• Medical examinations for operators handling latex

### 3.6 Documentation & Records
• Batch Manufacturing Records (BMR), Device History Records (DHR)
• Calibration and maintenance logs, product release procedures
• Record retention policy and electronic systems used

### 3.7 Outsourced Activities
• Details of outsourced processes (e.g., sterilisation) and supplier qualification
• Copies of contracts or quality agreements; validation of outsourced services

### 3.8 Complaint Handling & Vigilance
• Procedures for receiving, investigating and responding to complaints
• Adverse event reporting and field safety corrective action (FSCA)

### 3.9 Warehouse & Distribution
• Storage conditions (temperature, humidity controls), stock rotation (FIFO/FEFO)
• Traceability system and distribution records

### 3.10 Annexures
• Copies of facility layout, ISO certificates, validation reports, organograms and photographs

## 4. SOP for Preparing the DMF & PMF

### Step 1: Collect Regulatory References
• Obtain current versions of Medical Device Rules, 2017 and applicable standards
• Create checklist for required sections based on Schedule IV (site master file) and Schedule V/VI (device master file)

### Step 2: Establish Roles & Responsibilities
• Assign Regulatory Affairs team to compile DMF and PMF
• Engage R&D and production teams for technical content, QA for quality system documentation

### Step 3: Draft the DMF
• Use template above to gather information on device description, design, manufacturing process and test data
• Insert drawings, tables and flow charts as necessary
• Ensure all data reflects specific version [VERSION_NUMBER] of the device

### Step 4: Draft the PMF
• Gather facility information (layout, utilities, equipment) and quality system documentation
• Ensure PMF reflects current facility and any outsourced processes

### Step 5: Review & Gap Analysis
• Cross-check DMF and PMF against CDSCO guidelines
• Verify that all required annexures (test reports, certificates, labels) are present
• Identify and address any gaps

### Step 6: Approval & Sign-off
• Circulate drafts for review by QA and RA heads
• Obtain final approvals and signatures from authorised signatories

### Step 7: Document Control & Submission
• Assign controlled document numbers, issue revision history
• Maintain copies in quality management system
• Submit electronic and hard copies to CDSCO as part of licence application

## 5. Key Considerations

• **Completeness:** Ensure DMF and PMF contain sufficient detail for regulatory assessment
• **Consistency:** Information must be consistent across all submission documents
• **Confidentiality:** Proprietary information may be marked as confidential but must provide adequate detail
• **Updates:** Both DMF and PMF are living documents requiring revision for any changes

---

This template and SOP are intended as a starting point for preparing your CDSCO documentation. Always consult the latest regulations and guidance documents issued by CDSCO for specific requirements.`,
    },
  ],

  BIS: [
    {
      name: 'BIS Compliance Template and SOP for Surgical Gloves',
      description:
        'Comprehensive documentation for Bureau of Indian Standards (BIS) certification including ISI mark licensing and CRS registration.',
      content: `BIS Compliance Template and SOP for Surgical Gloves
==================================================

This document provides a structured template and standard operating procedure (SOP) to support compliance with the Bureau of Indian Standards (BIS) for medical gloves. It includes the documentation needed for the Compulsory Registration Scheme (CRS) or ISI mark certification.

## 1. Introduction

**Purpose:** To describe the technical and quality documentation required by BIS for [DEVICE_NAME] surgical gloves under project [PROJECT_NAME], version [VERSION_NUMBER], destined for the [MARKET_NAME] market and to provide a step-wise SOP for BIS certification.

**Scope:** Applies to regulatory affairs, quality assurance and production teams responsible for achieving and sustaining BIS certification. It addresses both ISI mark licensing and CRS registration, as applicable.

## 2. Product Technical Documentation Template

### 2.1 Device Description & Classification
• Identify the product (e.g., sterile powdered latex surgical gloves)
• Indian Standard reference (e.g., IS 15354), and classification
• Provide drawings, dimensions (length, width, thickness) and functional description

### 2.2 Bill of Materials
• List raw materials and additives with CAS numbers, supplier names and certificates of analysis
• Include specifications for latex/nitrile, accelerators, pigments, powders and packaging materials

### 2.3 Test Reports
• Include accredited laboratory reports showing compliance with all parameters of the relevant standard
• Tensile strength, elongation, water leak test, freedom from holes, powder content, protein content, sterility
• Test reports should be issued by BIS-recognised or NABL-accredited labs

### 2.4 Process Flow & Controls
• Describe manufacturing steps and process controls
• Include compounding, dipping, curing, leaching, finishing, sterilisation and packing
• Provide in-process acceptance criteria

### 2.5 Labelling & Marking
• Provide artwork for product labels and packaging that meet BIS marking requirements
• Include Standard Mark (ISI), licence number, manufacturing licence number, batch number
• Mfg/Exp dates and regulatory symbols

### 2.6 Conformance with Standards
• Supply evidence of conformity to applicable Indian Standards and related IEC/ISO standards
• Include cross-reference tables if necessary (e.g., ISO 11193, ISO 10993, ISO 11737)

### 2.7 Quality Management System Documents
• Provide QMS certificates (ISO 13485), internal audit reports, calibration records
• SOP index and key procedures

### 2.8 Annexures
• Attach copies of test certificates, calibration certificates, purchase orders for raw materials
• Previous BIS licences, if any

## 3. Factory and Quality Documentation Template

### 3.1 Organisation & Infrastructure
• Organisation chart; responsibilities of management representative and quality team
• Facility layout diagrams; list of production equipment and their calibration status

### 3.2 Quality Control Procedures
• SOPs for raw material inspection, in-process inspection, final inspection and release
• Include sampling plans and Acceptable Quality Level (AQL)

### 3.3 Calibration & Maintenance Records
• Equipment calibration certificates, maintenance schedules and logs

### 3.4 Internal Audits & CAPA
• Recent internal audit reports, non-conformance reports and corrective/preventive actions

### 3.5 Training Records
• Training matrix and records of operator training on glove manufacturing, quality control and hygiene

### 3.6 Traceability & Batch Records
• Format of Batch Manufacturing Record (BMR) and Device History Record (DHR)
• System for assigning batch/lot numbers; traceability of raw materials and finished goods

### 3.7 Warehouse & Distribution Records
• Storage conditions (temperature, humidity), pest control, stock rotation (FIFO/FEFO), dispatch logs

## 4. SOP for BIS Certification

### Step 1: Determine Standard & Certification Type
• Identify the applicable Indian Standard (e.g., IS 15354)
• Determine whether the product falls under Compulsory Registration Scheme (CRS) or requires ISI mark licence

### Step 2: Collect and Compile Technical Documents
• Gather product drawings, Bill of Materials, process flow charts
• In-house test reports and externally certified test reports as per the standard

### Step 3: Assess QMS Compliance
• Ensure manufacturing facility has valid ISO 13485 certificate
• Conduct internal audits and close any non-conformities
• Prepare SOPs for all manufacturing and quality activities

### Step 4: Prepare Application Package
• Complete BIS application form and accompanying documents
• Authorisation letter, legal manufacturing licence, company registration
• Attach technical documents and test reports

### Step 5: Submit to BIS
• Submit application via BIS portal or appropriate regional office along with applicable fees
• Respond promptly to any queries from BIS

### Step 6: Factory Audit
• Facilitate BIS inspectors during factory audit
• Provide access to production lines, quality control areas and documentation
• Address any observations raised during audit

### Step 7: Certification Decision
• Upon satisfactory review and audit, receive BIS licence or CRS registration
• Ensure Standard Mark (ISI) and licence number are incorporated into product labelling and packaging

### Step 8: Surveillance and Renewal
• Maintain records of routine factory inspections and surveillance audits
• Renew licence as required and update documents when standards or manufacturing processes change

## 5. Key Considerations

• **Testing:** Only use test reports from BIS-recognised laboratories. Repeat testing whenever product design or materials change
• **Labelling:** ISI mark and licence number must be displayed prominently on product and packaging. Any misuse of the mark can result in penalties
• **Quality System:** BIS inspectors place significant emphasis on quality management system; keep SOPs, calibration and training records up to date
• **Ongoing Compliance:** BIS licences are subject to surveillance; maintain readiness for unannounced audits. Keep a log of non-conformities and corrective actions

---

Use this template and SOP to prepare your BIS documentation. Always check the latest BIS guidelines and relevant Indian Standards to ensure complete compliance.`,
    },
  ],

  FDA: [
    {
      name: 'US FDA 510(k) Submission Template and SOP for Surgical Gloves',
      description:
        'Comprehensive framework for preparing 510(k) Premarket Notification submission to US Food & Drug Administration with detailed SOP for managing the process.',
      content: `US FDA 510(k) Submission Template and SOP for Surgical Gloves
=============================================================

This document provides a framework for preparing a **510(k) Premarket Notification** submission to the US Food & Drug Administration (FDA) for medical gloves. It also includes a standard operating procedure (SOP) for managing the 510(k) process.

## 1. Introduction

**Purpose:** To outline the structure and content of a 510(k) submission for [DEVICE_NAME] under project [PROJECT_NAME], version [VERSION_NUMBER], intended for marketing in the United States and to describe the activities required to demonstrate substantial equivalence to a predicate device.

**Scope:** Applicable to the regulatory affairs and product development teams responsible for compiling the 510(k) submission for surgical gloves. The template is consistent with FDA guidance for Traditional and Abbreviated 510(k)s and the requirements of 21 CFR 807 Subpart E.

## 2. 510(k) Submission Template

### 2.1 Cover Letter & Administrative Information
• Address the review branch (Office of Product Evaluation & Quality)
• Provide contact information for the submitter and correspondence
• Include 510(k) number (if assigned), acceptance of FDA email communication
• Summary of the submission type

### 2.2 FDA Form 3514 & Summary Cover Sheet
• Complete the FDA form with device listing, classification, product code, regulation number
• Indications for use

### 2.3 Table of Contents
• Outline each section with page numbers for easy reference

### 2.4 Device Description
• Trade name, common name, classification, class (I or II), product code, regulation number
• Description of design and function, sizes, materials, manufacturing process, sterilisation method
• Include any colorants or additives and cross-reference to material safety data

### 2.5 Indications for Use & Intended Use
• State the intended patient population, environments, and procedures for which the glove is designed
• Provide the Indications for Use statement (FDA Form 3881) and ensure it matches labeling

### 2.6 Predicate Device Comparison
• Identify a legally marketed predicate device
• Provide side-by-side comparison table covering indications for use, design features, materials, performance specifications, and sterilisation
• Justify substantial equivalence

### 2.7 Summary of Non-Clinical Tests
• Biocompatibility testing (ISO 10993 series)
• Physical and mechanical testing (ASTM D3577 for surgical gloves or ASTM D6319 for nitrile)
• Barrier integrity testing (water leak test, viral penetration)
• Sterilisation validation (ISO 11135 for EtO or ISO 11137 for gamma)
• Shelf-life testing and packaging validation

### 2.8 Risk Management & Design Control
• Summarise risk analysis (ISO 14971), design history file elements and design outputs
• Describe how design controls were applied

### 2.9 Labeling
• Provide draft labels, packaging artwork, and Instructions for Use
• Ensure labels include product name, size, lot number, sterility method, expiration date
• Caution statements required by FDA guidance on latex/glove labeling

### 2.10 Standards & Guidance Documents
• List all consensus standards and FDA guidances followed
• ASTM standards for glove performance, ISO 10993-1, ISO 14971, FDA guidance on 510(k) submissions for gloves
• Provide declarations of conformity where applicable

### 2.11 Summary & Conclusions
• Summarise how the testing demonstrates that the subject device is as safe and effective as the predicate
• Conclude that the device is substantially equivalent

### 2.12 Appendices
• Attach raw test reports, certificates of analysis, design drawings
• Any additional supporting documentation

## 3. SOP for Preparing and Submitting a 510(k)

### Step 1: Determine Submission Strategy
• Decide whether a Traditional, Special or Abbreviated 510(k) is appropriate
• Confirm the product code and classification regulation
• Assign responsibilities within the regulatory team

### Step 2: Identify Predicate Device
• Research legally marketed gloves (e.g., KXXXXXX numbers) with similar indications and materials
• Obtain their public summary from FDA's database

### Step 3: Compile Device Information
• Coordinate with engineering and manufacturing teams to gather design drawings, materials specifications
• Manufacturing processes, sterilisation validation and labeling drafts

### Step 4: Conduct Performance & Biocompatibility Testing
• Plan and execute testing according to ASTM and ISO standards
• Use ISO 10993 for biocompatibility (cytotoxicity, sensitisation, irritation, systemic toxicity)
• ASTM for physical properties. Document results and compare them with predicate performance

### Step 5: Prepare Submission Documents
• Draft each section of the submission template
• Ensure consistency between the Indications for Use statement, labeling and predicate comparison
• Include a table of contents

### Step 6: Internal Review
• Have the submission reviewed by quality assurance and senior regulatory staff
• Ensure completeness, accuracy and readability

### Step 7: eSubmitter Packaging
• Use the FDA eSubmitter tool or other accepted electronic format to assemble the submission
• Include PDFs with bookmarks and hyperlink cross-references

### Step 8: Submit to FDA
• Send the submission electronically via the FDA's CDRH Customer Collaboration Portal or Document Control Center
• Pay the 510(k) user fee if applicable

### Step 9: Respond to FDA Inquiries
• Monitor the submission tracking and respond promptly to Additional Information (AI) requests
• Provide clarifications, additional testing data or revised labeling as requested

### Step 10: Clearance & Post-Market Responsibilities
• Once the 510(k) is cleared, maintain design control records, complaint handling procedures and post-market surveillance
• Update the submission and labeling if significant changes occur

## 4. Key Considerations

• **Substantial Equivalence:** Demonstrating that your glove is "substantially equivalent" to a predicate device is central to the 510(k) process. Performance differences must not raise new questions of safety or effectiveness
• **Testing Standards:** Use the current versions of ASTM standards (e.g., ASTM D3577 for latex gloves) and ISO 10993 series. Deviations require justification
• **Labeling Compliance:** Ensure labeling meets FDA requirements, including caution statements for latex proteins and powder content. Mislabeling can result in refusal to accept the submission
• **Electronic Submission:** FDA no longer accepts paper submissions. Ensure that all files are in PDF format, properly bookmarked and text-searchable

---

This template and SOP serve as a starting point for your 510(k) submission. Always consult the most recent FDA guidance documents and relevant standards for up-to-date requirements.`,
    },
  ],

  CE: [
    {
      name: 'EU CE Technical Documentation Template and SOP for Surgical Gloves',
      description:
        'Comprehensive technical documentation structure for CE marking under EU Medical Device Regulation (MDR) 2017/745 with detailed conformity assessment procedure.',
      content: `EU CE Technical Documentation Template and SOP for Surgical Gloves
================================================================

This document outlines the structure of the technical documentation required for CE marking of medical gloves under the European Union Medical Device Regulation (MDR) 2017/745. It also provides a standard operating procedure (SOP) for preparing and maintaining conformity assessment documentation.

## 1. Introduction

**Purpose:** To provide a template and SOP for compiling the technical documentation and carrying out the conformity assessment procedure for [DEVICE_NAME] surgical gloves, project [PROJECT_NAME], version [VERSION_NUMBER], intended for the [MARKET_NAME] market, in compliance with EU MDR 2017/745.

**Scope:** Applicable to regulatory, quality and design teams responsible for CE marking. It encompasses both self-certification for Class I devices and notified body involvement for higher risk classes (IIa, IIb, III).

## 2. Technical Documentation Template

### 2.1 Device Description & Specification
• Trade name and model, device category (e.g., sterile/non-sterile surgical glove)
• Classification (I sterile, IIa, IIb, III), Unique Device Identifier (UDI) information, and intended purpose
• Include drawings and dimensions

### 2.2 Design & Manufacturing Information
• Complete design dossier covering design inputs/outputs, design reviews, verifications, validations and changes
• Describe the manufacturing process flow with critical steps and controls
• Provide supplier and material qualification data

### 2.3 General Safety and Performance Requirements (GSPR) Checklist
• Systematic review of each GSPR in Annex I of the MDR
• Identify applicable requirements and the evidence demonstrating compliance
• Include a matrix linking each requirement to specific documents (e.g., standards, test reports, risk analysis references)

### 2.4 Risk Management File
• Comprehensive risk analysis in accordance with ISO 14971
• Include hazard identification, risk estimation, risk control measures, residual risk evaluation and risk-benefit analysis
• Provide traceability to design inputs and GSPR

### 2.5 Verification & Validation
• Test reports demonstrating mechanical strength, barrier integrity (water leak/air inflation)
• Biocompatibility (ISO 10993), sterility validation (ISO 11135/11137)
• Packaging validation, shelf-life studies and usability evaluations (IEC 62366 if applicable)

### 2.6 Clinical Evaluation Report (CER)
• Literature review or clinical investigation showing clinical performance and safety
• Reference MEDDEV 2.7/1 and MDCG guidance
• For established glove types, a well-designed literature review may suffice

### 2.7 Post-Market Surveillance (PMS) Plan
• Describe methods and frequency of post-market clinical follow-up (if required)
• Complaint handling, vigilance reporting and periodic safety update reports (PSURs)

### 2.8 Declaration of Conformity
• Draft EU Declaration of Conformity referencing the relevant regulations (MDR)
• Device classification rule, standards applied (EN ISO 13485, EN ISO 14971, EN 455 series for gloves)
• Notified body identification (if applicable)

### 2.9 Labels & Instructions for Use
• Provide samples of all labels and instructions in official EU languages
• Ensure they meet requirements of Annex I section 23 (information supplied with the device)

### 2.10 Certificates & Reports
• Include QMS certificates (EN ISO 13485), sterilisation validation certificates
• Notified body audit reports (if applicable) and previous CE certificates (if any)

## 3. SOP for CE Conformity Assessment

### Step 1: Classify the Device
• Determine classification according to MDR Annex VIII
• Surgical gloves are typically Class IIa (sterile measuring devices) or Class I sterile (depending on design)
• Select the appropriate conformity assessment route (Annex IX, Annex XI, etc.)

### Step 2: Establish Project Team
• Assign roles for Regulatory Affairs, Quality Assurance, Design & Development and Clinical Evaluation
• Define timelines and deliverables

### Step 3: Compile Technical Documentation
• Use the template above to collect design files, risk management documents, test reports and clinical evidence
• Ensure traceability between GSPR checklist, risk management and test results

### Step 4: Implement & Maintain QMS
• Ensure an ISO 13485:2016 compliant QMS is in place
• Prepare for notified body audits if the device is above Class I
• Document management reviews, internal audits, CAPA and training

### Step 5: Engage Notified Body (if required)
• For Class IIa/IIb/III devices, select and contract a notified body
• Submit the technical documentation and QMS documents for review
• Respond to technical queries and schedule onsite audits if necessary

### Step 6: Draft and Sign Declaration of Conformity
• Once the technical documentation has been accepted (and QMS certified where applicable)
• Draft the Declaration of Conformity. Ensure it is signed by an authorised representative

### Step 7: Affix CE Marking
• After receiving notified body certificate (if applicable), affix the CE mark and notified body number on the product and packaging
• Update labeling and Instructions for Use accordingly

### Step 8: Post-Market Surveillance & Vigilance
• Implement the PMS plan. Collect and analyse feedback, complaints and field safety data
• Report incidents via the National Competent Authority (NCA)
• Update the clinical evaluation and risk management files regularly

### Step 9: Maintain and Update Documentation
• Review technical documentation periodically and update it when design changes, new standards or new clinical data arise
• Re-certify devices at the end of certificate validity (typically every five years)

## 4. Key Considerations

• **GSPR Compliance:** The heart of the CE submission is demonstrating compliance with the GSPRs. Provide clear, cross-referenced evidence for each requirement
• **Notified Body Selection:** Choose a notified body with scope for your product type. Early engagement can identify documentation gaps and streamline the review process
• **Language Requirements:** Labels and instructions must be translated into the official languages of all member states where the device will be marketed
• **Ongoing Monitoring:** CE marking is not a one-time event; post-market data must feed back into risk management and clinical evaluation. Keep documentation current

---

This template and SOP offer a foundation for preparing CE technical documentation. Always consult the EU MDR, harmonised standards and current MDCG guidance for specific requirements.`,
    },
  ],
};

// Determine which set of templates to display based on the license
// name. This helper normalises the string to lowercase and
// returns a matching key; if no match is found, an empty string is
// returned, resulting in no templates.
function deriveLicenseKey(name) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('cdsco')) return 'CDSCO';
  if (lower.includes('bis')) return 'BIS';
  if (lower.includes('fda')) return 'FDA';
  if (lower.includes('ce')) return 'CE';
  return '';
}

// FSM Flowchart Component for SOP Procedures
const SOPFlowchart = ({ licenseType, selectedTemplate }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showDetails, setShowDetails] = useState({});

  // Define flowchart steps based on license type
  const getFlowchartSteps = license => {
    const flowcharts = {
      CDSCO: [
        {
          id: 1,
          title: 'Collect Regulatory References',
          icon: '📚',
          color: '#3b82f6',
          description:
            'Obtain current versions of Medical Device Rules, 2017 and applicable standards',
        },
        {
          id: 2,
          title: 'Establish Roles & Responsibilities',
          icon: '👥',
          color: '#10b981',
          description: 'Assign Regulatory Affairs team to compile DMF and PMF',
        },
        {
          id: 3,
          title: 'Draft the DMF',
          icon: '📋',
          color: '#f59e0b',
          description: 'Use template to gather device information and technical content',
        },
        {
          id: 4,
          title: 'Draft the PMF',
          icon: '🏭',
          color: '#ef4444',
          description: 'Gather facility information and quality system documentation',
        },
        {
          id: 5,
          title: 'Review & Gap Analysis',
          icon: '🔍',
          color: '#8b5cf6',
          description: 'Cross-check DMF and PMF against CDSCO guidelines',
        },
        {
          id: 6,
          title: 'Approval & Sign-off',
          icon: '✅',
          color: '#06b6d4',
          description: 'Circulate drafts for review and obtain final approvals',
        },
        {
          id: 7,
          title: 'Document Control & Submission',
          icon: '📤',
          color: '#84cc16',
          description: 'Submit electronic and hard copies to CDSCO',
        },
      ],
      BIS: [
        {
          id: 1,
          title: 'Determine Standard & Certification',
          icon: '📊',
          color: '#3b82f6',
          description: 'Identify applicable Indian Standard and certification type',
        },
        {
          id: 2,
          title: 'Collect Technical Documents',
          icon: '📁',
          color: '#10b981',
          description: 'Gather product drawings, Bill of Materials, process flow charts',
        },
        {
          id: 3,
          title: 'Assess QMS Compliance',
          icon: '⚙️',
          color: '#f59e0b',
          description: 'Ensure ISO 13485 certificate and conduct internal audits',
        },
        {
          id: 4,
          title: 'Prepare Application Package',
          icon: '📝',
          color: '#ef4444',
          description: 'Complete BIS application form and accompanying documents',
        },
        {
          id: 5,
          title: 'Submit to BIS',
          icon: '📤',
          color: '#8b5cf6',
          description: 'Submit via BIS portal with applicable fees',
        },
        {
          id: 6,
          title: 'Factory Audit',
          icon: '🏭',
          color: '#06b6d4',
          description: 'Facilitate BIS inspectors during factory audit',
        },
        {
          id: 7,
          title: 'Certification Decision',
          icon: '🏆',
          color: '#84cc16',
          description: 'Receive BIS licence or CRS registration',
        },
        {
          id: 8,
          title: 'Surveillance & Renewal',
          icon: '🔄',
          color: '#f97316',
          description: 'Maintain records and renew licence as required',
        },
      ],
      FDA: [
        {
          id: 1,
          title: 'Determine Submission Strategy',
          icon: '🎯',
          color: '#3b82f6',
          description: 'Decide on Traditional, Special or Abbreviated 510(k)',
        },
        {
          id: 2,
          title: 'Identify Predicate Device',
          icon: '🔍',
          color: '#10b981',
          description: 'Research legally marketed gloves with similar indications',
        },
        {
          id: 3,
          title: 'Compile Device Information',
          icon: '📋',
          color: '#f59e0b',
          description: 'Gather design drawings, materials specifications',
        },
        {
          id: 4,
          title: 'Conduct Testing',
          icon: '🧪',
          color: '#ef4444',
          description: 'Execute performance and biocompatibility testing',
        },
        {
          id: 5,
          title: 'Prepare Submission Documents',
          icon: '📝',
          color: '#8b5cf6',
          description: 'Draft each section of the submission template',
        },
        {
          id: 6,
          title: 'Internal Review',
          icon: '👀',
          color: '#06b6d4',
          description: 'Review by quality assurance and senior regulatory staff',
        },
        {
          id: 7,
          title: 'eSubmitter Packaging',
          icon: '📦',
          color: '#84cc16',
          description: 'Use FDA eSubmitter tool for electronic format',
        },
        {
          id: 8,
          title: 'Submit to FDA',
          icon: '📤',
          color: '#f97316',
          description: 'Send electronically via CDRH Customer Portal',
        },
        {
          id: 9,
          title: 'Respond to FDA Inquiries',
          icon: '💬',
          color: '#ec4899',
          description: 'Monitor and respond to Additional Information requests',
        },
        {
          id: 10,
          title: 'Clearance & Post-Market',
          icon: '🎉',
          color: '#14b8a6',
          description: 'Maintain design controls and post-market surveillance',
        },
      ],
      CE: [
        {
          id: 1,
          title: 'Classify the Device',
          icon: '🏷️',
          color: '#3b82f6',
          description: 'Determine classification according to MDR Annex VIII',
        },
        {
          id: 2,
          title: 'Establish Project Team',
          icon: '👥',
          color: '#10b981',
          description: 'Assign roles and define timelines and deliverables',
        },
        {
          id: 3,
          title: 'Compile Technical Documentation',
          icon: '📚',
          color: '#f59e0b',
          description: 'Collect design files, risk management, test reports',
        },
        {
          id: 4,
          title: 'Implement QMS',
          icon: '⚙️',
          color: '#ef4444',
          description: 'Ensure ISO 13485:2016 compliant QMS is in place',
        },
        {
          id: 5,
          title: 'Engage Notified Body',
          icon: '🏢',
          color: '#8b5cf6',
          description: 'Select and contract notified body for review',
        },
        {
          id: 6,
          title: 'Draft Declaration of Conformity',
          icon: '📜',
          color: '#06b6d4',
          description: 'Prepare and sign Declaration of Conformity',
        },
        {
          id: 7,
          title: 'Affix CE Marking',
          icon: '🏷️',
          color: '#84cc16',
          description: 'Apply CE mark and notified body number',
        },
        {
          id: 8,
          title: 'Post-Market Surveillance',
          icon: '📊',
          color: '#f97316',
          description: 'Implement PMS plan and vigilance reporting',
        },
        {
          id: 9,
          title: 'Maintain Documentation',
          icon: '🔄',
          color: '#ec4899',
          description: 'Review and update technical documentation',
        },
      ],
    };
    return flowcharts[license] || [];
  };

  const steps = getFlowchartSteps(licenseType);

  const toggleDetails = stepId => {
    setShowDetails(prev => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  if (!selectedTemplate || steps.length === 0) {
    return null;
  }

  return (
    <div
      className="sop-flowchart-container"
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        marginBottom: '24px',
      }}
    >
      <h3
        style={{
          color: '#1f2937',
          fontWeight: '600',
          fontSize: '20px',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        🔄 SOP Process Flowchart - {licenseType}
        <span
          style={{
            fontSize: '12px',
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            padding: '4px 8px',
            borderRadius: '12px',
            fontWeight: '500',
          }}
        >
          {steps.length} Steps
        </span>
      </h3>

      {/* Progress Bar */}
      <div
        style={{
          marginBottom: '32px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>
            Progress: Step {activeStep + 1} of {steps.length}
          </span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
            {Math.round(((activeStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            className="flowchart-progress-bar"
            style={{
              width: `${((activeStep + 1) / steps.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '4px',
              transition: 'width 0.5s ease',
              '--progress-width': `${((activeStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Flowchart Steps */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isUpcoming = index > activeStep;

          return (
            <div
              key={step.id}
              className="flowchart-step"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                position: 'relative',
              }}
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div
                  className="flowchart-connection-line"
                  style={{
                    position: 'absolute',
                    left: '24px',
                    top: '48px',
                    width: '2px',
                    height: '32px',
                    background: isCompleted
                      ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%)',
                    zIndex: 1,
                    animationDelay: `${index * 0.1}s`,
                  }}
                />
              )}

              {/* Step Circle */}
              <div
                className="flowchart-step-circle"
                onClick={() => setActiveStep(index)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted ? '#10b981' : isActive ? step.color : '#f1f5f9',
                  border: `3px solid ${isCompleted ? '#10b981' : isActive ? step.color : '#e2e8f0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  zIndex: 2,
                  position: 'relative',
                  boxShadow: isActive ? `0 0 0 4px ${step.color}20` : 'none',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = `0 4px 12px ${step.color}30`;
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {isCompleted ? '✅' : step.icon}
              </div>

              {/* Step Content */}
              <div style={{ flex: 1 }}>
                <div
                  className="flowchart-step-content"
                  onClick={() => toggleDetails(step.id)}
                  style={{
                    padding: '16px 20px',
                    backgroundColor: isActive ? `${step.color}10` : '#ffffff',
                    border: `2px solid ${isActive ? step.color : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive
                      ? `0 4px 16px ${step.color}20`
                      : '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <h4
                      style={{
                        color: isActive ? step.color : '#1f2937',
                        fontWeight: '600',
                        fontSize: '16px',
                        margin: 0,
                      }}
                    >
                      Step {step.id}: {step.title}
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {isCompleted && (
                        <span
                          style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '8px',
                          }}
                        >
                          COMPLETED
                        </span>
                      )}
                      {isActive && (
                        <span
                          style={{
                            backgroundColor: step.color,
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '600',
                            padding: '2px 6px',
                            borderRadius: '8px',
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          transform: showDetails[step.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  <p
                    style={{
                      color: '#6b7280',
                      fontSize: '14px',
                      margin: 0,
                      lineHeight: '1.5',
                    }}
                  >
                    {step.description}
                  </p>

                  {/* Expanded Details */}
                  {showDetails[step.id] && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#475569',
                          fontWeight: '500',
                          marginBottom: '8px',
                        }}
                      >
                        📋 Key Activities:
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        {['Documentation', 'Review', 'Approval', 'Submission'].map(
                          (activity, i) => (
                            <span
                              key={i}
                              style={{
                                backgroundColor: step.color,
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: '500',
                                padding: '3px 8px',
                                borderRadius: '12px',
                              }}
                            >
                              {activity}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
        }}
      >
        <button
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: activeStep === 0 ? '#e5e7eb' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: activeStep === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          ← Previous
        </button>

        <button
          onClick={() => setActiveStep(0)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🔄 Reset
        </button>

        <button
          onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
          disabled={activeStep === steps.length - 1}
          style={{
            padding: '8px 16px',
            backgroundColor: activeStep === steps.length - 1 ? '#e5e7eb' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: activeStep === steps.length - 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

// Format template content with beautiful styling and colors
function formatTemplateContent(content) {
  if (!content) return '';

  let formatted = content
    // Main title (first line with ===)
    .replace(/^(.+)\n=+$/gm, '<div class="template-main-title">$1</div>')

    // Section headers with ##
    .replace(/^## (.+)$/gm, '<h2 class="template-section-header">📋 $1</h2>')

    // Subsection headers with ###
    .replace(/^### (.+)$/gm, '<h3 class="template-subsection-header">📌 $1</h3>')

    // Bold text with **
    .replace(/\*\*(.+?)\*\*/g, '<strong class="template-bold">$1</strong>')

    // Bullet points
    .replace(/^• (.+)$/gm, '<div class="template-bullet">🔸 $1</div>')

    // Step numbers
    .replace(/^### (Step \d+): (.+)$/gm, '<h3 class="template-step-header">🔢 $1: $2</h3>')

    // Horizontal rules
    .replace(/^---$/gm, '<hr class="template-divider">')

    // Purpose/Scope sections
    .replace(
      /^\*\*Purpose:\*\* (.+)$/gm,
      '<div class="template-purpose">🎯 <strong>Purpose:</strong> $1</div>'
    )
    .replace(
      /^\*\*Scope:\*\* (.+)$/gm,
      '<div class="template-scope">🎯 <strong>Scope:</strong> $1</div>'
    )

    // Key considerations
    .replace(
      /^• \*\*(.+?):\*\* (.+)$/gm,
      '<div class="template-key-point">⚠️ <strong>$1:</strong> $2</div>'
    )

    // Line breaks
    .replace(/\n/g, '<br>');

  return `
    <style>
      .template-main-title {
        font-size: 24px;
        font-weight: 700;
        color: #1e40af;
        text-align: center;
        margin: 0 0 24px 0;
        padding: 16px;
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        border-radius: 12px;
        border-left: 4px solid #2563eb;
      }
      
      .template-section-header {
        font-size: 20px;
        font-weight: 600;
        color: #059669;
        margin: 32px 0 16px 0;
        padding: 12px 16px;
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        border-radius: 8px;
        border-left: 4px solid #10b981;
      }
      
      .template-subsection-header {
        font-size: 16px;
        font-weight: 600;
        color: #7c2d12;
        margin: 24px 0 12px 0;
        padding: 8px 12px;
        background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
        border-radius: 6px;
        border-left: 3px solid #ea580c;
      }
      
      .template-step-header {
        font-size: 18px;
        font-weight: 600;
        color: #7c2d12;
        margin: 24px 0 12px 0;
        padding: 12px 16px;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-radius: 8px;
        border-left: 4px solid #f59e0b;
      }
      
      .template-bullet {
        margin: 8px 0 8px 16px;
        color: #374151;
        line-height: 1.6;
        padding: 4px 0;
      }
      
      .template-bold {
        color: #1f2937;
        font-weight: 600;
      }
      
      .template-purpose, .template-scope {
        margin: 16px 0;
        padding: 12px 16px;
        background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
        border-radius: 8px;
        border-left: 4px solid #0ea5e9;
        color: #0c4a6e;
        font-weight: 500;
      }
      
      .template-key-point {
        margin: 12px 0 12px 16px;
        padding: 8px 12px;
        background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
        border-radius: 6px;
        border-left: 3px solid #ef4444;
        color: #7f1d1d;
        line-height: 1.5;
      }
      
      .template-divider {
        margin: 24px 0;
        border: none;
        height: 2px;
        background: linear-gradient(90deg, #e5e7eb 0%, #9ca3af 50%, #e5e7eb 100%);
        border-radius: 1px;
      }
      
      .sop-template-content {
        line-height: 1.7;
      }
      
      .sop-template-content br + br {
        display: block;
        margin: 8px 0;
        content: "";
      }
    </style>
    ${formatted}
  `;
}

// Replace bracketed placeholders in a template string with the
// actual values provided. Missing values leave the placeholder
// unchanged. This function is case-sensitive on the placeholder
// names.
function autoFillContent(template, project, device, version, market, license) {
  return template
    .replace(/\[PROJECT_NAME\]/g, project || '[PROJECT_NAME]')
    .replace(/\[DEVICE_NAME\]/g, device || '[DEVICE_NAME]')
    .replace(/\[VERSION_NUMBER\]/g, version || '[VERSION_NUMBER]')
    .replace(/\[MARKET_NAME\]/g, market || '[MARKET_NAME]')
    .replace(/\[LICENSE\]/g, license || '[LICENSE]');
}

// Main functional component definition. Accepts the currently
// selected project, device, version, market and license, and a
// callback for navigating back to the previous screen. Uses
// state variables to track the selected template, the generated
// SOP content and whether the template list is visible.
const SOPGenerator = ({
  selectedProject,
  selectedDevice,
  selectedVersion,
  selectedMarket,
  selectedLicense,
  onBack,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sopContent, setSOPContent] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // MCP Integration
  const { initialized: mcpInitialized, callTool, getRecommendations, isServerHealthy } = useMCP();

  const [mcpGeneratedContent, setMcpGeneratedContent] = useState('');
  const [isGeneratingWithMCP, setIsGeneratingWithMCP] = useState(false);
  const [mcpRecommendations, setMcpRecommendations] = useState([]);
  const [showMCPOptions, setShowMCPOptions] = useState(false);

  // Normalise license name for display; if selectedLicense is an
  // object, derive from its fields, else use the string directly.
  const licenseName =
    typeof selectedLicense === 'string'
      ? selectedLicense
      : selectedLicense?.license_number || selectedLicense?.name || 'Unknown License';

  const licenseKey = deriveLicenseKey(licenseName);
  const availableTemplates = templatesByLicense[licenseKey] || [];

  // When the user chooses a template, generate the filled SOP
  // content and hide the template list. Store the template name
  // separately for display in the UI.
  const handleTemplateSelect = template => {
    setSelectedTemplate(template.name);
    const filled = autoFillContent(
      template.content,
      selectedProject?.name,
      selectedDevice?.name,
      selectedVersion?.version_number,
      selectedMarket?.name,
      licenseName
    );
    setSOPContent(filled.trim());
    setShowTemplates(false);
  };

  // Reset all selections and clear the editor.
  const handleReset = () => {
    setSelectedTemplate(null);
    setSOPContent('');
    setShowTemplates(false);
  };

  // Download the generated SOP as a plain text file using a
  // temporary Blob. If there is no content, do nothing.
  const handleDownload = () => {
    if (!sopContent) return;
    const blob = new Blob([sopContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${licenseName.replace(/\s+/g, '_')}_SOP.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  // Save the generated SOP into the user's database (if available).
  // This uses the preload API exposed through window.userDatabaseAPI.
  // If unavailable, a warning is logged to the console.
  const handleSave = async () => {
    if (!sopContent) return;
    try {
      const filename = `${licenseName.replace(/\s+/g, '_')}_SOP.txt`;
      const file = new File([sopContent], filename, { type: 'text/plain' });
      if (window?.userDatabaseAPI?.uploadFiles) {
        await window.userDatabaseAPI.uploadFiles('/', [file]);
        console.log('SOP saved to user database successfully');
      } else {
        console.warn('userDatabaseAPI is not available. Cannot save file.');
      }
    } catch (err) {
      console.error('Failed to save SOP to user database:', err);
    }
  };

  // MCP-Powered SOP Generation
  const generateWithMCP = async () => {
    if (!mcpInitialized || !isServerHealthy('document-genius')) {
      console.warn('MCP not available or document-genius server not healthy');
      return;
    }

    setIsGeneratingWithMCP(true);
    try {
      console.log('🤖 Generating SOP with MCP AI...');

      const projectData = {
        project: selectedProject,
        device: selectedDevice,
        version: selectedVersion,
        market: selectedMarket,
        license: selectedLicense,
        regulatoryBody: selectedMarket?.regulatory_body,
        deviceType: selectedDevice?.type,
      };

      const result = await callTool(
        'document-genius',
        'generate-sop-documents',
        {
          template_type: licenseKey,
          project_data: projectData,
          requirements: {
            include_compliance_checklist: true,
            include_risk_assessment: true,
            include_validation_procedures: true,
            format: 'comprehensive',
          },
        },
        { workflow: 'document-generation' }
      );

      if (result && result.document) {
        setMcpGeneratedContent(result.document.content);
        setSelectedTemplate(`AI-Generated ${licenseKey} SOP`);
        setSOPContent(result.document.content);
        console.log('✅ MCP SOP generation completed');
      }
    } catch (error) {
      console.error('❌ MCP SOP generation failed:', error);
      // Fallback to template-based generation
      if (availableTemplates.length > 0) {
        handleTemplateSelect(availableTemplates[0]);
      }
    } finally {
      setIsGeneratingWithMCP(false);
    }
  };

  // Get MCP-powered recommendations for SOP improvement
  const getMCPRecommendations = async () => {
    if (!mcpInitialized || !sopContent) return;

    try {
      const recommendations = await getRecommendations({
        currentPage: 'sop-generator',
        sopContent,
        regulatoryBody: selectedMarket?.regulatory_body,
        deviceType: selectedDevice?.type,
      });

      setMcpRecommendations(recommendations);
    } catch (error) {
      console.error('❌ Failed to get MCP recommendations:', error);
    }
  };

  // Validate SOP compliance using MCP
  const validateCompliance = async () => {
    if (!mcpInitialized || !sopContent || !isServerHealthy('document-genius')) {
      return;
    }

    try {
      const result = await callTool('document-genius', 'validate-document-compliance', {
        document_content: sopContent,
        regulatory_framework: licenseKey,
        market: selectedMarket?.name,
        device_type: selectedDevice?.type,
      });

      if (result) {
        console.log('📋 Compliance validation result:', result);
        // You could show this in a modal or notification
        return result;
      }
    } catch (error) {
      console.error('❌ Compliance validation failed:', error);
    }
  };

  // Load MCP recommendations when component mounts or context changes
  useEffect(() => {
    if (mcpInitialized && selectedMarket && selectedDevice) {
      getMCPRecommendations();
    }
  }, [mcpInitialized, selectedMarket, selectedDevice, sopContent]);

  return (
    <div
      style={{
        padding: '32px',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div>
          <h1
            style={{
              color: '#1f2937',
              fontWeight: '700',
              fontSize: '28px',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            📄 SOP Generator
          </h1>
          <p
            style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: 0,
            }}
          >
            Generate standard operating procedures from templates
          </p>
        </div>

        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = '#4b5563';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = '#6b7280';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Completion
        </button>
      </div>

      {/* License Information Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h2
          style={{
            color: '#1f2937',
            fontWeight: '600',
            fontSize: '20px',
            margin: '0 0 16px 0',
          }}
        >
          📋 {licenseName} – Standard Operating Procedure
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Project:</span>
            <div style={{ color: '#1f2937', fontWeight: '600' }}>
              {selectedProject?.name || 'N/A'}
            </div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Device:</span>
            <div style={{ color: '#1f2937', fontWeight: '600' }}>
              {selectedDevice?.name || 'N/A'}
            </div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Version:</span>
            <div style={{ color: '#1f2937', fontWeight: '600' }}>
              v{selectedVersion?.version_number || 'N/A'}
            </div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Market:</span>
            <div style={{ color: '#1f2937', fontWeight: '600' }}>
              {selectedMarket?.name || 'N/A'}
            </div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>License:</span>
            <div style={{ color: '#1f2937', fontWeight: '600' }}>{licenseName}</div>
          </div>
        </div>
      </div>

      {/* Template Selection Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h3
          style={{
            color: '#1f2937',
            fontWeight: '600',
            fontSize: '18px',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📁 Template Selection
        </h3>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = '#2563eb')}
            onMouseLeave={e => (e.target.style.backgroundColor = '#3b82f6')}
            onClick={() => {
              // Browse user database for templates – reserved for future use
              // This button currently has no implementation because
              // custom user templates are managed elsewhere.
            }}
          >
            📂 Browse User Database
          </button>

          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = '#059669')}
            onMouseLeave={e => (e.target.style.backgroundColor = '#10b981')}
            onClick={() => setShowTemplates(!showTemplates)}
          >
            📄 Default Templates
          </button>
        </div>

        {/* Template list displayed when showTemplates is true */}
        {showTemplates && (
          <div style={{ marginTop: '16px' }}>
            {availableTemplates.length === 0 ? (
              <p style={{ color: '#6b7280' }}>
                No built-in templates available for this license type.
              </p>
            ) : (
              availableTemplates.map((tpl, index) => {
                const isSelected = selectedTemplate === tpl.name;
                const colors = [
                  { bg: '#f0f9ff', border: '#0ea5e9', icon: '📋' },
                  { bg: '#f0fdf4', border: '#10b981', icon: '📊' },
                  { bg: '#fef3c7', border: '#f59e0b', icon: '📑' },
                  { bg: '#fdf2f8', border: '#ec4899', icon: '📝' },
                ];
                const colorScheme = colors[index % colors.length];

                return (
                  <div
                    key={tpl.name}
                    className="template-card"
                    onClick={() => handleTemplateSelect(tpl)}
                    style={{
                      border: `2px solid ${isSelected ? colorScheme.border : '#e5e7eb'}`,
                      borderRadius: '16px',
                      padding: '24px',
                      marginBottom: '16px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? colorScheme.bg : '#ffffff',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      boxShadow: isSelected
                        ? `0 8px 25px ${colorScheme.border}20`
                        : '0 2px 8px rgba(0, 0, 0, 0.08)',
                      transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.borderColor = colorScheme.border;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '32px',
                          flexShrink: 0,
                          marginTop: '4px',
                        }}
                      >
                        {colorScheme.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px',
                          }}
                        >
                          <strong
                            style={{
                              color: '#1f2937',
                              fontSize: '16px',
                              fontWeight: '600',
                            }}
                          >
                            {tpl.name}
                          </strong>
                          {isSelected && (
                            <span
                              style={{
                                backgroundColor: colorScheme.border,
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                textTransform: 'uppercase',
                              }}
                            >
                              Selected
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            color: '#6b7280',
                            fontSize: '14px',
                            margin: 0,
                            lineHeight: '1.5',
                          }}
                        >
                          {tpl.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Indicator for selected template when list is hidden */}
        {!showTemplates && selectedTemplate && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #0ea5e9',
              marginTop: '8px',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#0c4a6e',
                fontWeight: '500',
              }}
            >
              ✅ Selected: {selectedTemplate}
            </span>
          </div>
        )}

        {!showTemplates && !selectedTemplate && (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '2px dashed #d1d5db',
            }}
          >
            <p style={{ margin: 0, fontSize: '16px' }}>
              Select a template to begin generating your SOP
            </p>
          </div>
        )}
      </div>

      {/* SOP Process Flowchart */}
      <SOPFlowchart licenseType={licenseKey} selectedTemplate={selectedTemplate} />

      {/* Template Editor Section */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h3
          style={{
            color: '#1f2937',
            fontWeight: '600',
            fontSize: '18px',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ✏️ Template Editor
        </h3>

        <div
          className="sop-template-editor"
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            minHeight: '400px',
            padding: '24px',
            backgroundColor: '#ffffff',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#374151',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          {!selectedTemplate ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#9ca3af',
                fontSize: '16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                Select a template to start editing
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                Choose from{' '}
                {availableTemplates.length > 0
                  ? `${availableTemplates.length} available templates`
                  : 'default templates'}{' '}
                for {licenseName}
              </div>
            </div>
          ) : (
            <div
              className="sop-template-content"
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{ __html: formatTemplateContent(sopContent) }}
            />
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          {/* MCP-Powered AI Generation Button */}
          {mcpInitialized && isServerHealthy('document-genius') && (
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: isGeneratingWithMCP ? '#9ca3af' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isGeneratingWithMCP ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={e =>
                !isGeneratingWithMCP && (e.target.style.backgroundColor = '#7c3aed')
              }
              onMouseLeave={e =>
                !isGeneratingWithMCP && (e.target.style.backgroundColor = '#8b5cf6')
              }
              onClick={generateWithMCP}
              disabled={isGeneratingWithMCP}
            >
              {isGeneratingWithMCP ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  Generating...
                </>
              ) : (
                <>🤖 AI Generate SOP</>
              )}
            </button>
          )}

          {/* Compliance Validation Button */}
          {mcpInitialized && sopContent && isServerHealthy('document-genius') && (
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#ec4899',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => (e.target.style.backgroundColor = '#db2777')}
              onMouseLeave={e => (e.target.style.backgroundColor = '#ec4899')}
              onClick={validateCompliance}
            >
              📋 Validate Compliance
            </button>
          )}

          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = '#059669')}
            onMouseLeave={e => (e.target.style.backgroundColor = '#10b981')}
            onClick={handleSave}
          >
            💾 Save to User Database
          </button>

          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = '#2563eb')}
            onMouseLeave={e => (e.target.style.backgroundColor = '#3b82f6')}
            onClick={handleDownload}
          >
            📥 Download
          </button>

          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = '#d97706')}
            onMouseLeave={e => (e.target.style.backgroundColor = '#f59e0b')}
            onClick={handleReset}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* MCP Recommendations Panel */}
      {mcpInitialized && mcpRecommendations.length > 0 && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginTop: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}
        >
          <h3
            style={{
              color: '#1f2937',
              fontWeight: '600',
              fontSize: '20px',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🤖 AI Recommendations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mcpRecommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${
                    rec.priority === 'high'
                      ? '#ef4444'
                      : rec.priority === 'medium'
                        ? '#f59e0b'
                        : '#10b981'
                  }`,
                }}
              >
                <div
                  style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    marginBottom: '4px',
                  }}
                >
                  {rec.title}
                </div>
                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '8px',
                  }}
                >
                  {rec.description}
                </div>
                {rec.estimatedBenefit && (
                  <div
                    style={{
                      color: '#059669',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                  >
                    💡 {rec.estimatedBenefit}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MCP Status Indicator */}
      {mcpInitialized && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '12px 16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#374151',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isServerHealthy('document-genius') ? '#10b981' : '#ef4444',
            }}
          />
          MCP {isServerHealthy('document-genius') ? 'Connected' : 'Disconnected'}
        </div>
      )}

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SOPGenerator;
