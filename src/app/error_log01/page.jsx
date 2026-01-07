"use client";
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack,
    Button,
    Alert,
    CircularProgress,
    Divider,
} from "@mui/material";

import {
    ChevronDown,
    Trash2,
    RefreshCw,
    AlertTriangle,
    Copy,
} from "lucide-react";

/**
 * Renders a formatted block for JSON or Code
 */
const PrettyBlock = ({ value }) => (
    <Box
        component="pre"
        sx={{
            background: "#1e1e1e",
            color: "#d4d4d4",
            p: 2,
            borderRadius: 3,
            fontSize: "0.8rem",
            overflow: "auto",
            maxHeight: 400,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            border: "1px solid rgba(255,255,255,0.1)",
        }}
    >
        {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
    </Box>
);

export default function ErrorLogPage() {
    const [logs, setLogs] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    /* ================= FETCH LOGS ================= */
    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch("/logs/error_logs.json", {
                cache: "no-store",
            });
            if (!response.ok) throw new Error("Failed to fetch logs");
            const data = await response.json();
            setLogs(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching logs:", err);
            setError("Could not load error logs.");
        } finally {
            setLoading(false);
        }
    };

    /* ================= CLEAR LOGS ================= */
    const clearLogs = async () => {
        if (!window.confirm("Are you sure you want to clear all logs? This action cannot be undone.")) return;
        setLoading(true);
        try {
            const response = await fetch("/api/logger", { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to clear logs");
            setLogs({});
            setError(null);
        } catch (err) {
            console.error("Error clearing logs:", err);
            setError("Could not clear logs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', pb: 10 }}>
            {/* Glass Header */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 100,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                px: 3,
                py: 1,
            }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h5" fontWeight="500">
                            Error Logs Management
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshCw size={16} />}
                            onClick={fetchLogs}
                            disabled={loading}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                borderColor: 'rgba(0,0,0,0.1)',
                                color: '#2c3e50',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.2)' }
                            }}
                        >
                            Refresh
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Trash2 size={16} />}
                            onClick={clearLogs}
                            disabled={loading}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                bgcolor: '#ea5455',
                                boxShadow: '0 4px 14px 0 rgba(234, 84, 85, 0.39)',
                                '&:hover': { bgcolor: '#d94445', boxShadow: 'none' }
                            }}
                        >
                            Clear Archive
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Box sx={{ maxWidth: '1440px', mx: 'auto', p: 3 }}>
                {/* Loading State */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress size={32} thickness={5} sx={{ color: '#7367f0' }} />
                    </Box>
                )}

                {/* Error State */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '16px', border: '1px solid rgba(234, 84, 85, 0.2)' }}>
                        {error}
                    </Alert>
                )}

                {/* Empty State */}
                {!loading && Object.keys(logs || {}).length === 0 && (
                    <Box sx={{
                        textAlign: 'center', py: 12,
                        bgcolor: '#fff', borderRadius: '24px',
                        border: '1px dashed rgba(0,0,0,0.1)'
                    }}>
                        <Typography variant="h6" fontWeight="800" color="text.secondary">All systems clear</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6 }}>No error logs recorded in the current archive.</Typography>
                    </Box>
                )}

                {/* Logs List */}
                {!loading && Object.entries(logs || {}).map(([role, entries]) => (
                    <Box key={role} sx={{ mb: 6 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="900" sx={{
                                color: '#7367f0',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}>
                                SOURCE: {role}
                            </Typography>
                            <Divider sx={{ flexGrow: 1, opacity: 0.5 }} />
                        </Stack>

                        <Stack spacing={2}>
                            {entries.map((log, index) => {
                                let detail = null;
                                try { detail = JSON.parse(log.detailedReason); } catch { }
                                const panelId = `${role}-${index}`;

                                return (
                                    <Accordion
                                        key={index}
                                        expanded={expanded === panelId}
                                        onChange={handleAccordionChange(panelId)}
                                        elevation={0}
                                        sx={{
                                            borderRadius: '16px !important',
                                            border: '1px solid rgba(0,0,0,0.06)',
                                            bgcolor: '#fff',
                                            overflow: 'hidden',
                                            transition: 'all 0.2s',
                                            '&:before': { display: 'none' },
                                            '&:hover': {
                                                boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
                                                transform: 'translateY(-2px)',
                                                borderColor: 'rgba(115, 103, 240, 0.3)'
                                            }
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                                            <Stack direction="row" spacing={2.5} alignItems="flex-start" sx={{ py: 0.5 }}>
                                                <Box sx={{
                                                    p: 1.2, borderRadius: '12px',
                                                    bgcolor: 'rgba(234, 84, 85, 0.1)',
                                                    color: '#ea5455',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <AlertTriangle size={20} />
                                                </Box>

                                                <Box>
                                                    <Typography fontWeight="800" sx={{ color: '#2c3e50', fontSize: '0.95rem', lineBreak: 'anywhere' }}>
                                                        {log.shortReason}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                                                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ opacity: 0.6 }}>
                                                            {log.userId}
                                                        </Typography>
                                                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.1)' }} />
                                                        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ opacity: 0.6 }}>
                                                            {new Date(log.timestamp).toLocaleString()}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </AccordionSummary>

                                        <AccordionDetails sx={{ p: 4, pt: 0, bgcolor: 'rgba(0,0,0,0.01)' }}>
                                            <Divider sx={{ mb: 3 }} />
                                            <Stack spacing={3}>
                                                {detail?.source && (
                                                    <Box>
                                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ mb: 1, display: 'block', letterSpacing: '0.5px' }}>ERROR SOURCE</Typography>
                                                        <Typography variant="body2" sx={{
                                                            p: 2, bgcolor: 'rgba(0,0,0,0.03)',
                                                            borderRadius: '12px', color: '#2c3e50',
                                                            fontFamily: 'monospace', fontSize: '0.85rem'
                                                        }}>
                                                            {detail.source} [Line {detail.lineno}]
                                                        </Typography>
                                                    </Box>
                                                )}

                                                <Box>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: '0.5px' }}>DIAGNOSTIC DATA</Typography>
                                                        <Button
                                                            size="small"
                                                            startIcon={<Copy size={12} />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopy(log.detailedReason);
                                                            }}
                                                            sx={{ textTransform: 'none', color: '#7367f0', fontWeight: 700 }}
                                                        >
                                                            Copy JSON
                                                        </Button>
                                                    </Stack>
                                                    <PrettyBlock value={detail || log.detailedReason} />
                                                </Box>

                                                {detail?.stack && (
                                                    <Box>
                                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ mb: 1, display: 'block', letterSpacing: '0.5px' }}>CALL STACK</Typography>
                                                        <PrettyBlock value={detail.stack} />
                                                    </Box>
                                                )}
                                            </Stack>
                                        </AccordionDetails>
                                    </Accordion>
                                );
                            })}
                        </Stack>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
