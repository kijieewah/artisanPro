-- CreateTable
CREATE TABLE `states` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `state_map` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `states_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `local_governments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `state_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `local_governments_state_id_idx`(`state_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `industries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `industries_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `industry_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `image` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `services_industry_id_idx`(`industry_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requirements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `service_id` INTEGER NOT NULL,
    `name` VARCHAR(500) NOT NULL,
    `type` ENUM('MANDATORY', 'OPTIONAL') NOT NULL DEFAULT 'MANDATORY',
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `requirements_service_id_idx`(`service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `profilePicture` TEXT NULL,
    `role` ENUM('ARTISAN', 'PARTNER', 'ADMIN', 'SUPER_ADMIN') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `isPhoneVerified` BOOLEAN NOT NULL DEFAULT false,
    `lastLoginAt` DATETIME(3) NULL,
    `current_session_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_phone_idx`(`phone`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `session_token` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    `revokedAt` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_session_token_key`(`session_token`),
    INDEX `sessions_session_token_idx`(`session_token`),
    INDEX `sessions_user_id_idx`(`user_id`),
    INDEX `sessions_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_resets_token_key`(`token`),
    INDEX `password_resets_token_idx`(`token`),
    INDEX `password_resets_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `oauth_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_id` VARCHAR(191) NOT NULL,
    `access_token` VARCHAR(191) NULL,
    `refresh_token` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `oauth_accounts_user_id_idx`(`user_id`),
    INDEX `oauth_accounts_provider_provider_id_idx`(`provider`, `provider_id`),
    UNIQUE INDEX `oauth_accounts_provider_provider_id_key`(`provider`, `provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_history` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `failureReason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `login_history_user_id_idx`(`user_id`),
    INDEX `login_history_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `device_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `device_type` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `device_tokens_token_key`(`token`),
    INDEX `device_tokens_user_id_idx`(`user_id`),
    INDEX `device_tokens_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artisan_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `date_of_birth` DATETIME(3) NULL,
    `address` TEXT NULL,
    `state_id` INTEGER NULL,
    `local_gvt_id` INTEGER NULL,
    `working_address` TEXT NULL,
    `years_of_experience` INTEGER NULL DEFAULT 0,
    `bio` TEXT NULL,
    `skills` JSON NULL,
    `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `permit_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `approval_status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `completion_score` INTEGER NULL DEFAULT 0,
    `is_profile_complete` BOOLEAN NOT NULL DEFAULT false,
    `sanaa_id` INTEGER NULL,
    `on_duty` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `artisan_profiles_user_id_key`(`user_id`),
    UNIQUE INDEX `artisan_profiles_sanaa_id_key`(`sanaa_id`),
    INDEX `artisan_profiles_user_id_idx`(`user_id`),
    INDEX `artisan_profiles_state_id_idx`(`state_id`),
    INDEX `artisan_profiles_local_gvt_id_idx`(`local_gvt_id`),
    INDEX `artisan_profiles_verification_status_idx`(`verification_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artisan_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `artisan_id` VARCHAR(191) NOT NULL,
    `service_id` INTEGER NOT NULL,
    `experience` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `artisan_services_artisan_id_idx`(`artisan_id`),
    INDEX `artisan_services_service_id_idx`(`service_id`),
    UNIQUE INDEX `artisan_services_artisan_id_service_id_key`(`artisan_id`, `service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `business_name` VARCHAR(191) NOT NULL,
    `registration_number` VARCHAR(191) NOT NULL,
    `tax_id` VARCHAR(191) NULL,
    `business_email` VARCHAR(191) NOT NULL,
    `business_phone` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NULL,
    `address` TEXT NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'Nigeria',
    `description` TEXT NULL,
    `logo_url` VARCHAR(191) NULL,
    `accreditation_doc_url` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'REJECTED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    `rejection_reason` VARCHAR(191) NULL,
    `approved_at` DATETIME(3) NULL,
    `approved_by` VARCHAR(191) NULL,
    `commission_rate` DECIMAL(65, 30) NULL DEFAULT 10.0,
    `total_revenue` DECIMAL(65, 30) NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `partner_profiles_user_id_key`(`user_id`),
    UNIQUE INDEX `partner_profiles_registration_number_key`(`registration_number`),
    UNIQUE INDEX `partner_profiles_tax_id_key`(`tax_id`),
    INDEX `partner_profiles_user_id_idx`(`user_id`),
    INDEX `partner_profiles_business_name_idx`(`business_name`),
    INDEX `partner_profiles_status_idx`(`status`),
    INDEX `partner_profiles_registration_number_idx`(`registration_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partner_id` VARCHAR(191) NOT NULL,
    `service_id` INTEGER NOT NULL,
    `status` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `partner_services_partner_id_idx`(`partner_id`),
    INDEX `partner_services_service_id_idx`(`service_id`),
    UNIQUE INDEX `partner_services_partner_id_service_id_key`(`partner_id`, `service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partner_industries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `partner_id` VARCHAR(191) NOT NULL,
    `industry_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `partner_industries_partner_id_idx`(`partner_id`),
    INDEX `partner_industries_industry_id_idx`(`industry_id`),
    UNIQUE INDEX `partner_industries_partner_id_industry_id_key`(`partner_id`, `industry_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `employee_id` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `permissions` JSON NULL,
    `last_action_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_profiles_user_id_key`(`user_id`),
    UNIQUE INDEX `admin_profiles_employee_id_key`(`employee_id`),
    INDEX `admin_profiles_user_id_idx`(`user_id`),
    INDEX `admin_profiles_employee_id_idx`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requirement_uploads` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `artisan_id` VARCHAR(191) NOT NULL,
    `service_id` INTEGER NOT NULL,
    `requirement_id` INTEGER NOT NULL,
    `document_url` VARCHAR(1000) NOT NULL,
    `public_id` VARCHAR(500) NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `verified_by` VARCHAR(191) NULL,
    `verified_at` DATETIME(3) NULL,
    `rejection_reason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `requirement_uploads_artisan_id_idx`(`artisan_id`),
    INDEX `requirement_uploads_service_id_idx`(`service_id`),
    INDEX `requirement_uploads_requirement_id_idx`(`requirement_id`),
    INDEX `requirement_uploads_status_idx`(`status`),
    UNIQUE INDEX `requirement_uploads_artisan_id_service_id_requirement_id_key`(`artisan_id`, `service_id`, `requirement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` VARCHAR(191) NOT NULL,
    `partner_id` VARCHAR(191) NOT NULL,
    `primary_service_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `syllabus` TEXT NULL,
    `duration_hours` INTEGER NOT NULL,
    `duration_days` INTEGER NULL,
    `cost` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `delivery_mode` ENUM('ONLINE', 'OFFLINE', 'HYBRID') NOT NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `enrollment_deadline` DATETIME(3) NULL,
    `max_students` INTEGER NULL,
    `current_enrollment` INTEGER NOT NULL DEFAULT 0,
    `thumbnail_url` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SUSPENDED') NOT NULL DEFAULT 'DRAFT',
    `rating` DECIMAL(3, 2) NULL DEFAULT 0,
    `review_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `courses_code_key`(`code`),
    INDEX `courses_partner_id_idx`(`partner_id`),
    INDEX `courses_primary_service_id_idx`(`primary_service_id`),
    INDEX `courses_status_idx`(`status`),
    INDEX `courses_delivery_mode_idx`(`delivery_mode`),
    INDEX `courses_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_services` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` VARCHAR(191) NOT NULL,
    `service_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `course_services_course_id_idx`(`course_id`),
    INDEX `course_services_service_id_idx`(`service_id`),
    UNIQUE INDEX `course_services_course_id_service_id_key`(`course_id`, `service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` VARCHAR(191) NOT NULL,
    `artisan_id` VARCHAR(191) NOT NULL,
    `service_id` INTEGER NOT NULL,
    `application_number` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PENDING_INFORMATION', 'APPROVED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
    `completion_score` INTEGER NOT NULL DEFAULT 0,
    `payment_status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `payment_id` VARCHAR(191) NULL,
    `payment_amount` DECIMAL(10, 2) NULL,
    `payment_date` DATETIME(3) NULL,
    `reviewed_by` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `rejection_reason` VARCHAR(191) NULL,
    `submitted_at` DATETIME(3) NULL,
    `approved_at` DATETIME(3) NULL,
    `expiry_date` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `applications_application_number_key`(`application_number`),
    UNIQUE INDEX `applications_payment_id_key`(`payment_id`),
    INDEX `applications_artisan_id_idx`(`artisan_id`),
    INDEX `applications_service_id_idx`(`service_id`),
    INDEX `applications_status_idx`(`status`),
    INDEX `applications_application_number_idx`(`application_number`),
    INDEX `applications_payment_status_idx`(`payment_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_requirements` (
    `id` VARCHAR(191) NOT NULL,
    `application_id` VARCHAR(191) NOT NULL,
    `requirement_id` INTEGER NOT NULL,
    `is_met` BOOLEAN NOT NULL DEFAULT false,
    `upload_id` INTEGER NULL,
    `verified_by` VARCHAR(191) NULL,
    `verified_at` DATETIME(3) NULL,
    `rejection_reason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `application_requirements_application_id_idx`(`application_id`),
    INDEX `application_requirements_requirement_id_idx`(`requirement_id`),
    INDEX `application_requirements_upload_id_idx`(`upload_id`),
    UNIQUE INDEX `application_requirements_application_id_requirement_id_key`(`application_id`, `requirement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `application_requirement_id` VARCHAR(191) NULL,
    `application_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `original_name` VARCHAR(191) NOT NULL,
    `file_url` VARCHAR(191) NOT NULL,
    `public_id` VARCHAR(191) NULL,
    `file_hash` VARCHAR(191) NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `verified_by` VARCHAR(191) NULL,
    `verified_at` DATETIME(3) NULL,
    `rejection_reason` VARCHAR(191) NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `documents_file_hash_key`(`file_hash`),
    INDEX `documents_application_requirement_id_idx`(`application_requirement_id`),
    INDEX `documents_application_id_idx`(`application_id`),
    INDEX `documents_user_id_idx`(`user_id`),
    INDEX `documents_status_idx`(`status`),
    INDEX `documents_file_hash_idx`(`file_hash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificates` (
    `id` VARCHAR(191) NOT NULL,
    `application_id` VARCHAR(191) NOT NULL,
    `artisan_id` VARCHAR(191) NOT NULL,
    `issued_by` VARCHAR(191) NOT NULL,
    `certificate_number` VARCHAR(191) NOT NULL,
    `unique_code` VARCHAR(191) NOT NULL,
    `qr_hash` VARCHAR(191) NOT NULL,
    `qr_code_url` VARCHAR(191) NOT NULL,
    `blockchain_hash` VARCHAR(191) NULL,
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT false,
    `revoked_at` DATETIME(3) NULL,
    `revoked_by` VARCHAR(191) NULL,
    `revocation_reason` VARCHAR(191) NULL,
    `download_count` INTEGER NOT NULL DEFAULT 0,
    `verify_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `certificates_application_id_key`(`application_id`),
    UNIQUE INDEX `certificates_certificate_number_key`(`certificate_number`),
    UNIQUE INDEX `certificates_unique_code_key`(`unique_code`),
    UNIQUE INDEX `certificates_qr_hash_key`(`qr_hash`),
    INDEX `certificates_artisan_id_idx`(`artisan_id`),
    INDEX `certificates_certificate_number_idx`(`certificate_number`),
    INDEX `certificates_unique_code_idx`(`unique_code`),
    INDEX `certificates_qr_hash_idx`(`qr_hash`),
    INDEX `certificates_is_revoked_idx`(`is_revoked`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificate_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `certificate_id` VARCHAR(191) NOT NULL,
    `verified_by` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `verified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `certificate_verifications_certificate_id_idx`(`certificate_id`),
    INDEX `certificate_verifications_verified_at_idx`(`verified_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referrals` (
    `id` VARCHAR(191) NOT NULL,
    `application_id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `partner_id` VARCHAR(191) NOT NULL,
    `artisan_id` VARCHAR(191) NOT NULL,
    `referral_code` VARCHAR(191) NOT NULL,
    `clicked_at` DATETIME(3) NULL,
    `enrolled_at` DATETIME(3) NULL,
    `completed_at` DATETIME(3) NULL,
    `commission_amount` DECIMAL(10, 2) NULL,
    `commission_paid` BOOLEAN NOT NULL DEFAULT false,
    `commission_paid_at` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `expires_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `referrals_referral_code_key`(`referral_code`),
    INDEX `referrals_application_id_idx`(`application_id`),
    INDEX `referrals_course_id_idx`(`course_id`),
    INDEX `referrals_partner_id_idx`(`partner_id`),
    INDEX `referrals_artisan_id_idx`(`artisan_id`),
    INDEX `referrals_status_idx`(`status`),
    INDEX `referrals_referral_code_idx`(`referral_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commissions` (
    `id` VARCHAR(191) NOT NULL,
    `referral_id` VARCHAR(191) NOT NULL,
    `partner_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `rate` DECIMAL(5, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `paid_at` DATETIME(3) NULL,
    `transaction_id` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `commissions_referral_id_key`(`referral_id`),
    INDEX `commissions_partner_id_idx`(`partner_id`),
    INDEX `commissions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enrollments` (
    `id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `artisan_id` VARCHAR(191) NOT NULL,
    `enrollment_code` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `completed_at` DATETIME(3) NULL,
    `certificate_issued` BOOLEAN NOT NULL DEFAULT false,
    `payment_id` VARCHAR(191) NULL,
    `amount_paid` DECIMAL(10, 2) NULL,
    `enrolled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `enrollments_enrollment_code_key`(`enrollment_code`),
    INDEX `enrollments_course_id_idx`(`course_id`),
    INDEX `enrollments_artisan_id_idx`(`artisan_id`),
    INDEX `enrollments_status_idx`(`status`),
    INDEX `enrollments_enrollment_code_idx`(`enrollment_code`),
    UNIQUE INDEX `enrollments_course_id_artisan_id_key`(`course_id`, `artisan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `artisan_id` VARCHAR(191) NOT NULL,
    `enrollment_id` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `comment` TEXT NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT true,
    `helpful_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `course_reviews_enrollment_id_key`(`enrollment_id`),
    INDEX `course_reviews_course_id_idx`(`course_id`),
    INDEX `course_reviews_artisan_id_idx`(`artisan_id`),
    INDEX `course_reviews_rating_idx`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carts` (
    `id` VARCHAR(191) NOT NULL,
    `artisan_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `carts_artisan_id_key`(`artisan_id`),
    INDEX `carts_artisan_id_idx`(`artisan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_items` (
    `id` VARCHAR(191) NOT NULL,
    `cart_id` VARCHAR(191) NOT NULL,
    `item_type` ENUM('CERTIFICATION_APPLICATION', 'COURSE_ENROLLMENT', 'CERTIFICATION_SERVICE') NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('ACTIVE', 'REMOVED', 'PURCHASED') NOT NULL DEFAULT 'ACTIVE',
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cart_items_cart_id_idx`(`cart_id`),
    INDEX `cart_items_item_type_item_id_idx`(`item_type`, `item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `order_number` VARCHAR(191) NOT NULL,
    `artisan_id` VARCHAR(191) NOT NULL,
    `cart_id` VARCHAR(191) NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `status` ENUM('PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_PAYMENT',
    `paymentMethod` ENUM('CARD', 'BANK_TRANSFER', 'USSD', 'WALLET') NULL,
    `payment_reference` VARCHAR(191) NULL,
    `payment_id` VARCHAR(191) NULL,
    `paid_at` DATETIME(3) NULL,
    `invoice_number` VARCHAR(191) NULL,
    `invoice_url` VARCHAR(191) NULL,
    `receipt_url` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_order_number_key`(`order_number`),
    UNIQUE INDEX `orders_payment_reference_key`(`payment_reference`),
    UNIQUE INDEX `orders_invoice_number_key`(`invoice_number`),
    INDEX `orders_artisan_id_idx`(`artisan_id`),
    INDEX `orders_order_number_idx`(`order_number`),
    INDEX `orders_status_idx`(`status`),
    INDEX `orders_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `item_type` ENUM('CERTIFICATION_APPLICATION', 'COURSE_ENROLLMENT', 'CERTIFICATION_SERVICE') NOT NULL,
    `item_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `metadata` JSON NULL,

    INDEX `order_items_order_id_idx`(`order_id`),
    INDEX `order_items_item_type_item_id_idx`(`item_type`, `item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `invoice_number` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `artisan_id` VARCHAR(191) NOT NULL,
    `artisan_name` VARCHAR(191) NOT NULL,
    `artisan_email` VARCHAR(191) NOT NULL,
    `artisan_phone` VARCHAR(191) NULL,
    `artisan_address` TEXT NULL,
    `invoice_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `due_date` DATETIME(3) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'UNPAID',
    `payment_date` DATETIME(3) NULL,
    `pdf_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    UNIQUE INDEX `invoices_order_id_key`(`order_id`),
    INDEX `invoices_invoice_number_idx`(`invoice_number`),
    INDEX `invoices_order_id_idx`(`order_id`),
    INDEX `invoices_artisan_id_idx`(`artisan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receipts` (
    `id` VARCHAR(191) NOT NULL,
    `receipt_number` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `invoice_id` VARCHAR(191) NULL,
    `artisan_id` VARCHAR(191) NOT NULL,
    `artisan_name` VARCHAR(191) NOT NULL,
    `artisan_email` VARCHAR(191) NOT NULL,
    `receipt_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `payment_method` VARCHAR(191) NOT NULL,
    `payment_reference` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `pdf_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `receipts_receipt_number_key`(`receipt_number`),
    UNIQUE INDEX `receipts_order_id_key`(`order_id`),
    UNIQUE INDEX `receipts_invoice_id_key`(`invoice_id`),
    INDEX `receipts_receipt_number_idx`(`receipt_number`),
    INDEX `receipts_order_id_idx`(`order_id`),
    INDEX `receipts_artisan_id_idx`(`artisan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `application_id` VARCHAR(191) NULL,
    `order_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `transaction_ref` VARCHAR(191) NOT NULL,
    `payment_gateway` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `gateway_response` JSON NULL,
    `metadata` JSON NULL,
    `paid_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(191) NULL,
    `webhook_received_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_transactions_application_id_key`(`application_id`),
    UNIQUE INDEX `payment_transactions_order_id_key`(`order_id`),
    UNIQUE INDEX `payment_transactions_transaction_ref_key`(`transaction_ref`),
    INDEX `payment_transactions_application_id_idx`(`application_id`),
    INDEX `payment_transactions_order_id_idx`(`order_id`),
    INDEX `payment_transactions_user_id_idx`(`user_id`),
    INDEX `payment_transactions_transaction_ref_idx`(`transaction_ref`),
    INDEX `payment_transactions_status_idx`(`status`),
    INDEX `payment_transactions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NOT NULL,
    `refund_reference` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `gateway_response` JSON NULL,
    `processed_by` VARCHAR(191) NOT NULL,
    `processed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refunds_refund_reference_key`(`refund_reference`),
    INDEX `refunds_transaction_id_idx`(`transaction_id`),
    INDEX `refunds_refund_reference_idx`(`refund_reference`),
    INDEX `refunds_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'NORMAL',
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `read_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `failed_at` DATETIME(3) NULL,
    `failure_reason` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_status_idx`(`status`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_templates` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `variables` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_templates_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT', 'SUSPEND', 'ACTIVATE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE') NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `session_id` VARCHAR(191) NULL,
    `request_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_user_id_idx`(`user_id`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_logs_created_at_idx`(`created_at`),
    INDEX `audit_logs_request_id_idx`(`request_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'general',
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_settings_key_key`(`key`),
    INDEX `system_settings_key_idx`(`key`),
    INDEX `system_settings_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_keys` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `hashed_key` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `permissions` JSON NOT NULL,
    `expires_at` DATETIME(3) NULL,
    `last_used_at` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `api_keys_key_key`(`key`),
    UNIQUE INDEX `api_keys_hashed_key_key`(`hashed_key`),
    INDEX `api_keys_key_idx`(`key`),
    INDEX `api_keys_user_id_idx`(`user_id`),
    INDEX `api_keys_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `local_governments` ADD CONSTRAINT `local_governments_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_industry_id_fkey` FOREIGN KEY (`industry_id`) REFERENCES `industries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requirements` ADD CONSTRAINT `requirements_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `oauth_accounts` ADD CONSTRAINT `oauth_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_history` ADD CONSTRAINT `login_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device_tokens` ADD CONSTRAINT `device_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artisan_profiles` ADD CONSTRAINT `artisan_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artisan_profiles` ADD CONSTRAINT `artisan_profiles_state_id_fkey` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artisan_profiles` ADD CONSTRAINT `artisan_profiles_local_gvt_id_fkey` FOREIGN KEY (`local_gvt_id`) REFERENCES `local_governments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artisan_services` ADD CONSTRAINT `artisan_services_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `artisan_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artisan_services` ADD CONSTRAINT `artisan_services_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_profiles` ADD CONSTRAINT `partner_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_services` ADD CONSTRAINT `partner_services_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partner_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_services` ADD CONSTRAINT `partner_services_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_industries` ADD CONSTRAINT `partner_industries_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partner_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partner_industries` ADD CONSTRAINT `partner_industries_industry_id_fkey` FOREIGN KEY (`industry_id`) REFERENCES `industries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_profiles` ADD CONSTRAINT `admin_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requirement_uploads` ADD CONSTRAINT `requirement_uploads_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `artisan_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requirement_uploads` ADD CONSTRAINT `requirement_uploads_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requirement_uploads` ADD CONSTRAINT `requirement_uploads_requirement_id_fkey` FOREIGN KEY (`requirement_id`) REFERENCES `requirements`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requirement_uploads` ADD CONSTRAINT `requirement_uploads_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partner_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_primary_service_id_fkey` FOREIGN KEY (`primary_service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_services` ADD CONSTRAINT `course_services_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_services` ADD CONSTRAINT `course_services_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `artisan_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_reviewed_by_fkey` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_requirements` ADD CONSTRAINT `application_requirements_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_requirements` ADD CONSTRAINT `application_requirements_requirement_id_fkey` FOREIGN KEY (`requirement_id`) REFERENCES `requirements`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_requirements` ADD CONSTRAINT `application_requirements_upload_id_fkey` FOREIGN KEY (`upload_id`) REFERENCES `requirement_uploads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_requirements` ADD CONSTRAINT `application_requirements_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_application_requirement_id_fkey` FOREIGN KEY (`application_requirement_id`) REFERENCES `application_requirements`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_issued_by_fkey` FOREIGN KEY (`issued_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_revoked_by_fkey` FOREIGN KEY (`revoked_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificate_verifications` ADD CONSTRAINT `certificate_verifications_certificate_id_fkey` FOREIGN KEY (`certificate_id`) REFERENCES `certificates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partner_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referrals` ADD CONSTRAINT `referrals_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_referral_id_fkey` FOREIGN KEY (`referral_id`) REFERENCES `referrals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partner_profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_reviews` ADD CONSTRAINT `course_reviews_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_reviews` ADD CONSTRAINT `course_reviews_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_reviews` ADD CONSTRAINT `course_reviews_enrollment_id_fkey` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receipts` ADD CONSTRAINT `receipts_artisan_id_fkey` FOREIGN KEY (`artisan_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_application_id_fkey` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_processed_by_fkey` FOREIGN KEY (`processed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
