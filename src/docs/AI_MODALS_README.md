# AI Modal System Documentation

This document explains the AI modal system that manages different states of AI features in the application.

## Overview

The system consists of three modals that display based on environment variables:

1. **AiSubscriptionModal** - Shows when user doesn't have AI subscription
2. **AiTrainingModal** - Shows when AI is training/indexing data
3. **AiMaintenanceModal** - Shows when AI is under maintenance

## Environment Variables

Add these to your `.env` file:

```env
# AI Subscription Status - 0 for no subscription, 1 for active subscription
NEXT_PUBLIC_AI_ENABLE = 1

# AI Training Status - 0 for training pending/in progress, 1 for ready
NEXT_PUBLIC_AI_READY = 1

# AI Maintenance Mode - Set to true to show maintenance message
NEXT_PUBLIC_AI_MAINTENANCE_MODE = false
```

## Configuration Guide

### Scenario 1: User Has No Subscription
```env
NEXT_PUBLIC_AI_ENABLE = 0
NEXT_PUBLIC_AI_READY = 1
NEXT_PUBLIC_AI_MAINTENANCE_MODE = false
```
**Result:** Shows `AiSubscriptionModal` with upgrade message

### Scenario 2: AI Training in Progress
```env
NEXT_PUBLIC_AI_ENABLE = 1
NEXT_PUBLIC_AI_READY = 0
NEXT_PUBLIC_AI_MAINTENANCE_MODE = false
```
**Result:** Shows `AiTrainingModal` with progress indicator

### Scenario 3: AI Under Maintenance
```env
NEXT_PUBLIC_AI_ENABLE = 1
NEXT_PUBLIC_AI_READY = 1
NEXT_PUBLIC_AI_MAINTENANCE_MODE = true
```
**Result:** Shows `AiMaintenanceModal` with maintenance message

### Scenario 4: AI Ready (No Modal)
```env
NEXT_PUBLIC_AI_ENABLE = 1
NEXT_PUBLIC_AI_READY = 1
NEXT_PUBLIC_AI_MAINTENANCE_MODE = false
```
**Result:** No modal shown, AI features are available

## Usage Examples

### Method 1: Using AiModalManager (Recommended)

The `AiModalManager` automatically selects the correct modal based on environment variables:

```jsx
import { useState } from 'react';
import AiModalManager from '@/components/Common/modals/AiModalManager';
import { shouldBlockAiFeatures } from '@/utils/aiModalHelper';

function MyComponent() {
    const [showModal, setShowModal] = useState(false);

    const handleAiFeatureClick = () => {
        if (shouldBlockAiFeatures()) {
            setShowModal(true);
            return;
        }
        // Proceed with AI feature
        console.log('AI feature activated');
    };

    return (
        <>
            <button onClick={handleAiFeatureClick}>
                Use AI Search
            </button>

            <AiModalManager
                open={showModal}
                onClose={() => setShowModal(false)}
                onSwitchToDesign={() => {
                    console.log('Switch to design mode');
                    setShowModal(false);
                }}
            />
        </>
    );
}
```

### Method 2: Using Individual Modals

If you need more control, use individual modals:

```jsx
import { useState } from 'react';
import AiSubscriptionModal from '@/components/Common/AiSubscriptionModal';
import AiTrainingModal from '@/components/Common/AiTrainingModal';
import AiMaintenanceModal from '@/components/Common/AiMaintenanceModal';

function MyComponent() {
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [showTrainingModal, setShowTrainingModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

    return (
        <>
            {/* Subscription Modal */}
            <AiSubscriptionModal
                open={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
            />

            {/* Training Modal */}
            <AiTrainingModal
                open={showTrainingModal}
                onClose={() => setShowTrainingModal(false)}
            />

            {/* Maintenance Modal */}
            <AiMaintenanceModal
                open={showMaintenanceModal}
                onClose={() => setShowMaintenanceModal(false)}
                onSwitchToDesign={() => {
                    console.log('Switch to design mode');
                    setShowMaintenanceModal(false);
                }}
            />
        </>
    );
}
```

### Method 3: Using Helper Functions

```jsx
import { getAiModalType, shouldBlockAiFeatures } from '@/utils/aiModalHelper';

// Check if AI features should be blocked
if (shouldBlockAiFeatures()) {
    console.log('AI features are not available');
}

// Get the modal type to show
const modalType = getAiModalType();
console.log(modalType); // 'subscription', 'training', 'maintenance', or null
```

## Modal Features

### AiSubscriptionModal
- **Purpose:** Inform users about premium AI features
- **Content:**
  - Premium badge
  - Feature list (AI-Powered Order, Smart Catalog Search, Automated Quoting)
  - Contact information for admin
- **Actions:** Close modal

### AiTrainingModal
- **Purpose:** Show AI training progress
- **Content:**
  - Training status badge
  - Animated progress bar
  - Feature benefits list
  - Estimated completion time (24 hours)
  - Contact support information
- **Actions:** Close modal
- **Special:** Animated brain icon with orbiting dots

### AiMaintenanceModal
- **Purpose:** Notify about AI maintenance
- **Content:**
  - Maintenance message
  - Recommendation to use Design Mode
  - Illustration
- **Actions:** 
  - Close modal
  - Switch to Design Mode (optional)

## Styling

All modals use:
- Material-UI components
- Framer Motion animations
- Consistent color scheme (primary: #7367f0)
- Responsive design (mobile & desktop)
- Backdrop blur effect
- Smooth transitions

## Contact Information

Both subscription and training modals display:
- **Phone:** +91 90998 87762
- **Email:** Support@orail.in

## Priority Order

When multiple conditions are true, modals are shown in this priority:

1. **Maintenance** (highest priority)
2. **Subscription**
3. **Training**
4. **None** (AI ready)

## Testing

To test different scenarios, update your `.env` file and restart the development server:

```bash
# Stop the server
Ctrl + C

# Start the server
npm run dev
```

## Notes

- All environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
- Changes to `.env` require a server restart
- Modals are fully responsive and work on mobile devices
- All modals support keyboard navigation (ESC to close)
- Animations are optimized for performance

## File Structure

```
src/
├── components/
│   └── Common/
│       └── modals/
│           ├── index.js                    # Centralized exports
│           ├── AiModalManager.jsx          # Main manager component
│           ├── AiSubscriptionModal.jsx     # No subscription modal
│           ├── AiTrainingModal.jsx         # Training in progress modal
│           ├── AiMaintenanceModal.jsx      # Maintenance modal
│           ├── AiModalExample.jsx          # Demo component
│           ├── ImageEditorModal.jsx        # Image editor modal
│           ├── ImageViewerModal.jsx        # Image viewer modal
│           └── ReusableConfirmModal.jsx    # Confirm modal
├── docs/
│   ├── AI_MODALS_README.md                 # This file
│   └── AI_MODAL_SYSTEM_SUMMARY.md          # Quick reference
└── utils/
    └── aiModalHelper.js                    # Helper functions
```
