import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

/**
 * @typedef {'suggest' | 'close'} ConfirmModalType
 */

/**
 * @typedef {Object} ReusableConfirmModalProps
 * @property {boolean} open - Whether the modal is open
 * @property {function} onClose - Function to close the modal
 * @property {function} onConfirm - Function to confirm the action
 * @property {ConfirmModalType} type - Type of modal config to show
 */

/**
 * Reusable confirmation modal for actions like suggesting or closing a ticket.
 * Automatically loads config based on type.
 *
 * @param {ReusableConfirmModalProps} props
 */
const ReusableConfirmModal = ({ open, onClose, onConfirm, type }) => {
    const modalConfigs = {
        suggest: {
            title: "Mark as Suggested Ticket",
            // icon: <LightbulbIcon color="warning" />,
            message: "Are you sure you want to mark this ticket as a suggestion? It may be shown to other users as a recommended reference.",
            confirmText: "Confirm",
            cancelText: "Cancel",
            confirmColor: "primary",
            cancelColor: "inherit",
        },
        clearCart: {
            title: "Clear Cart",
            // icon: <Trash2 color="red" />,
            message: "Are you sure you want to clear your cart? This action cannot be undone.",
            confirmText: "Clear Cart",
            cancelText: "Cancel",
            confirmColor: "error",
            cancelColor: "inherit",
        },
        removeItem: {
            title: "Remove Item",
            message: "Are you sure you want to remove this item from your cart?",
            confirmText: "Remove",
            cancelText: "Cancel",
            confirmColor: "error",
            cancelColor: "inherit",
        },
        bulkRemove: {
            title: "Remove Items",
            message: "Are you sure you want to remove the selected items from your cart?",
            confirmText: "Remove Items",
            cancelText: "Cancel",
            confirmColor: "error",
            cancelColor: "inherit",
        }
    };

    const { title, icon, message, confirmText, cancelText, confirmColor, cancelColor } = modalConfigs[type] || {};

    if (!type || !modalConfigs[type]) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="confirm-modal-title" sx={{ '& .MuiDialog-paper': { borderRadius: 2, p: 1 } }}>
            <DialogTitle id="confirm-modal-title" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {icon}
                {title}
            </DialogTitle>

            <DialogContent>
                <Typography variant="body2" sx={{ color: "#4B5563" }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color={cancelColor}>
                    {cancelText}
                </Button>
                <Button onClick={onConfirm} variant="contained" color={confirmColor}>
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReusableConfirmModal;