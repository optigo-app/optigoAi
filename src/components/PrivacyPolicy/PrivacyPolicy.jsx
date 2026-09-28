"use client";

import React from "react";
import { Box, Typography, Container, Link } from "@mui/material";
import { motion } from "framer-motion";
import GridBackground from "@/components/Common/GridBackground";

const sections = [
    {
        title: "1. Introduction",
        body: 'OptigoAI ("we", "us", or "our") provides a private AI-powered search and browsing assistant that enhances your experience on our platform. This Privacy Policy explains how we handle your data when you use OptigoAI and our services. By using OptigoAI, you agree to the practices described in this policy. This policy applies to all users of OptigoAI, including both free and Premium subscribers. If you do not agree with the terms of this Privacy Policy, please discontinue use of the service.',
    },
    {
        title: "2. Overview of Our Privacy Approach",
        body: 'OptigoAI is designed with a privacy-first approach. Unlike many AI services that collect and retain user data, OptigoAI is built to minimize data collection and maximize user privacy. We do not collect identifiers such as your IP address that can be linked to you. We do not train our models based on your data. No personal data is stored on our servers or retained by OptigoAI beyond what is strictly necessary to process your current request.',
    },
    {
        title: "3. Information We Do Not Collect",
        body: 'OptigoAI does not collect or store the following personally identifiable information: your IP address, name, email address, phone number, physical address, date of birth, government-issued identification numbers, financial account numbers, or any other data that can be directly linked to your identity. We do not maintain user profiles or accounts that tie your activity to a persistent identity. Your interactions with OptigoAI are ephemeral and are not associated with a personal identifier.',
    },
    {
        title: "4. Information We Temporarily Process",
        body: 'When you use OptigoAI, the following data may be temporarily processed to generate responses: (a) Your search queries and text input submitted to the assistant. (b) Content from the webpage you are currently viewing, if you ask a question about it. (c) Text you highlight on a page. (d) Images you upload for visual search or editing. (e) Derived queries sent to search services to improve answer quality. This data is processed in real-time, used solely to generate your response, and is not permanently stored on our servers. All temporary processing occurs in encrypted memory and is discarded after your request is completed.',
    },
    {
        title: "5. How Your Data Is Used",
        body: 'Your data is used exclusively for the following purposes: (a) Generating AI responses to your queries and questions. (b) Processing image-based searches and visual similarity matching. (c) Improving the quality and relevance of search results through third-party search services. (d) Providing features such as image editing, background removal, and hybrid search. (e) Maintaining your session preferences (such as search mode and filter settings) in your browser local storage. Your data is never used for advertising, marketing, profiling, or any commercial purpose unrelated to providing the OptigoAI service.',
    },
    {
        title: "6. AI Model Training",
        body: 'We do not train our AI models based on your data. This includes your search queries, webpage content you submit, images you upload, OptigoAI responses, or any derived data from your interactions. Your conversations and interactions are not used to improve, fine-tune, or train any AI models. We believe your data belongs to you, and we are committed to ensuring it is never repurposed for model training without your explicit consent.',
    },
    {
        title: "7. Data Retention",
        body: 'OptigoAI does not retain your data beyond the time necessary to process your request. Specifically: (a) Search queries and AI processing data are discarded immediately after generating a response. (b) Uploaded images are processed in memory and are not stored on our servers. (c) Webpage content sent for analysis is not retained after the response is delivered. (d) Session preferences stored in your browser local storage persist until you clear your browser data. We do not maintain server-side logs that associate your activity with a personal identifier.',
    },
    {
        title: "8. Data Security",
        body: 'We employ industry-standard security measures to protect any data that is temporarily processed: (a) All data in transit is encrypted using TLS/SSL protocols. (b) Data processing occurs in isolated, encrypted memory environments. (c) Access to processing infrastructure is restricted to authorized personnel only. (d) We conduct regular security audits and vulnerability assessments. (e) We do not store personal data on our servers, eliminating the risk of data breaches involving personal information. Despite these measures, no system can be guaranteed to be 100% secure, and we encourage you to practice good security habits.',
    },
    {
        title: "9. AI Response Accuracy and Limitations",
        body: 'OptigoAI does not guarantee the accuracy, completeness, or reliability of responses. AI-generated responses may include inaccurate, misleading, or false information. Important guidelines: (a) Do not submit sensitive, confidential, or private information to OptigoAI. (b) Use caution with answers related to health, finance, legal matters, personal safety, or similar critical areas. (c) Always verify important information from authoritative sources. (d) OptigoAI responses should not be considered professional advice. (e) You are responsible for evaluating the accuracy and appropriateness of any response before acting on it.',
    },
    {
        title: "10. Free and Premium Services",
        body: 'OptigoAI is available in two tiers: (a) Free Tier: Available at no cost with limited usage. Includes access to standard AI models and basic search features. The default model may change from time to time. (b) Premium Tier: Offers access to additional AI models, higher usage limits, priority processing, and early access to new features. Subscription billing is handled by our payment processor. We do not share your payment information with OptigoAI AI services. Subscription data (such as email and billing details) is managed by the payment processor under their own privacy policy.',
    },
    {
        title: "11. Cookies and Local Storage",
        body: 'OptigoAI uses browser local storage and session storage to enhance your experience: (a) We store your privacy notice acceptance status so you are not shown the notice repeatedly. (b) We store your preferred search mode (e.g., AI mode or Design mode). (c) We store authentication tokens and session data required for API access. (d) We store user preferences such as filter settings and UI state. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. You can clear all locally stored data at any time through your browser settings.',
    },
    {
        title: "12. Third-Party Services",
        body: 'OptigoAI may interact with the following third-party services: (a) Search services: Used to improve answer quality by retrieving relevant information. These services may temporarily process your queries but do not store them permanently. (b) AI model providers: Cloud-based AI models that process your requests in real-time. These providers do not retain your data after processing. (c) Payment processors: Handle Premium subscription billing under their own privacy policies. We do not share your personal information, search queries, or AI interactions with third parties for any purpose other than processing your current request.',
    },
    {
        title: "13. Image and File Handling",
        body: 'When you upload images for visual search, editing, or background removal: (a) Images are processed in encrypted memory and are not permanently stored on our servers. (b) Images are used solely for the purpose you requested (e.g., search matching, editing). (c) Processed images are returned to you and then discarded from our processing memory. (d) We do not use your uploaded images for model training, profiling, or any purpose other than fulfilling your request. (e) You retain full ownership of all images you upload.',
    },
    {
        title: "14. Children's Privacy",
        body: 'OptigoAI is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can take appropriate action. Parents and guardians should monitor their children internet usage and ensure they do not provide information to online services without supervision.',
    },
    {
        title: "15. International Users",
        body: 'OptigoAI is available to users worldwide. Since we do not collect personally identifiable information or store personal data, cross-border data transfer concerns are minimized. However, your temporary data processing may occur in data centers located in different regions. All processing is subject to the same privacy standards described in this policy regardless of geographic location.',
    },
    {
        title: "16. Your Rights and Choices",
        body: 'Since OptigoAI does not collect or store personally identifiable information, traditional data access, correction, and deletion requests are not applicable. However, you have the following rights: (a) Right to clear local data: You can clear your browser local storage at any time to remove all OptigoAI preferences. (b) Right to decline: You can decline the privacy notice, though this will prevent access to the service. (c) Right to opt out: You can stop using OptigoAI at any time. (d) Right to information: You can review this Privacy Policy at any time to understand our data practices. (e) Right to contact us: You can reach out with any privacy concerns through our support channels.',
    },
    {
        title: "17. GDPR and CCPA Compliance",
        body: 'While OptigoAI does not collect personal data covered by the General Data Protection Regulation (GDPR) or the California Consumer Privacy Act (CCPA), we are committed to complying with applicable privacy laws. If you believe any data covered by these regulations has been inadvertently collected, please contact us and we will take immediate action to address your concerns. Our privacy-first design inherently supports the principles of data minimization, purpose limitation, and user control emphasized by these regulations.',
    },
    {
        title: "18. Changes to This Policy",
        body: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make changes: (a) We will update the "Last updated" date at the top of this page. (b) Material changes will be highlighted with a summary of what changed. (c) Continued use of OptigoAI after changes are posted constitutes acceptance of the updated policy. (d) We encourage you to review this policy periodically. (e) For significant changes, we may display a new privacy notice modal upon your next visit.',
    },
    {
        title: "19. Contact Us",
        body: 'If you have any questions, concerns, or requests regarding this Privacy Policy or OptigoAI data practices, we are here to help. You can reach us through: (a) Our in-app support and feedback channels. (b) Our official website contact form. (c) Our support email. We are committed to addressing your privacy concerns promptly and transparently. Our team will respond to your inquiry as quickly as possible.',
    },
];

const PrivacyPolicy = () => {
    return (
        <GridBackground>
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    minHeight: "100vh",
                    py: { xs: 6, sm: 8, md: 10 },
                }}
            >
                <Container maxWidth="md">
                    {/* Header */}
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        sx={{ mb: 6, textAlign: "center" }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
                                fontWeight: 800,
                                color: "#1a1a2e",
                                mb: 1.5,
                                lineHeight: 1.2,
                            }}
                        >
                            Privacy Policy
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: { xs: "0.85rem", sm: "0.95rem" },
                                color: "text.secondary",
                                maxWidth: 560,
                                mx: "auto",
                                lineHeight: 1.6,
                            }}
                        >
                            Your privacy matters to us. Learn how OptigoAI handles your data.
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "0.8rem",
                                color: "text.secondary",
                                mt: 1,
                                opacity: 0.7,
                            }}
                        >
                            Last updated: July 2025
                        </Typography>
                    </Box>

                    {/* Table of Contents */}
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        sx={{
                            mb: 5,
                            p: { xs: 3, sm: 4 },
                            borderRadius: "16px",
                            background: "rgba(255,255,255,0.5)",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(0,0,0,0.06)",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                                fontWeight: 700,
                                color: "#1a1a2e",
                                mb: 2,
                            }}
                        >
                            Table of Contents
                        </Typography>
                        <Box
                            component="ul"
                            sx={{
                                m: 0,
                                p: 0,
                                pl: { xs: 2, sm: 3 },
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                gap: 0.5,
                                listStyle: "none",
                            }}
                        >
                            {sections.map((section, index) => (
                                <Box
                                    key={index}
                                    component="li"
                                    sx={{
                                        fontSize: { xs: "0.8rem", sm: "0.85rem" },
                                        color: "#5f6368",
                                        lineHeight: 2,
                                        cursor: "pointer",
                                        "&:hover": { color: "#4F46E5" },
                                    }}
                                >
                                    {section.title}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Sections */}
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        {sections.map((section, index) => (
                            <Box
                                key={index}
                                component={motion.div}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (index + 1) }}
                                sx={{
                                    mb: 5,
                                    p: { xs: 3, sm: 4 },
                                    borderRadius: "16px",
                                    background: "rgba(255,255,255,0.6)",
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(0,0,0,0.06)",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: { xs: "1rem", sm: "1.1rem" },
                                        fontWeight: 700,
                                        color: "#1a1a2e",
                                        mb: 1.5,
                                    }}
                                >
                                    {section.title}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                        color: "#5f6368",
                                        lineHeight: 1.8,
                                    }}
                                >
                                    {section.body}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Back Link */}
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        sx={{ textAlign: "center", mt: 6 }}
                    >
                        <Link
                            href="/"
                            underline="hover"
                            sx={{
                                color: "#4F46E5",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                            }}
                        >
                            Back to Home
                        </Link>
                    </Box>
                </Container>
            </Box>
        </GridBackground>
    );
};

export default PrivacyPolicy;
