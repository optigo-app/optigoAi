"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    InputBase,
    InputAdornment,
    IconButton,
    Card,
    CardContent,
    Collapse,
    Button,
    Chip,
    Stack,
    Divider,
    Tooltip,
    Alert,
    CircularProgress,
    Avatar
} from '@mui/material';
import {
    Search,
    RefreshCw,
    AlertTriangle,
    Copy,
    ChevronDown,
    Download,
    User,
    Clock,
    ArrowLeft,
    CheckCircle,
    Info,
    Terminal,
    Bug,
    Layout,
    Calendar,
    Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GridBackground from "@/components/Common/GridBackground";
import { useRouter } from 'next/navigation';

const ErrorLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedIds, setExpandedIds] = useState(new Set());
    const router = useRouter();

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('/logs/error_logs.json');
            if (!response.ok) throw new Error('Failed to fetch logs');
            const data = await response.json();
            const flattened = (data.Guest || []).map((log, index) => ({
                ...log,
                id: `${log.timestamp}-${index}`
            }));
            setLogs(flattened.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            setError(null);
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError('Could not load error logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const toggleExpand = (id) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedIds(newExpanded);
    };

    const handleCopy = (content) => {
        navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    };

    const getErrorInfo = (log) => {
        const text = (log.shortReason + " " + (log.detailedReason || "")).toLowerCase();
        if (text.includes('hydration')) {
            return {
                type: 'Hydration',
                color: '#1e88e5',
                icon: <Layout size={16} />,
                bg: 'rgba(30, 136, 229, 0.1)',
                title: log.shortReason.split('\n')[0].replace('Global Error:', '').trim()
            };
        }
        if (text.includes('boundary') || text.includes('cannot read properties')) {
            return {
                type: 'Critical',
                color: '#e53935',
                icon: <Bug size={16} />,
                bg: 'rgba(229, 57, 53, 0.1)',
                title: log.shortReason.replace('React Error Boundary:', '').trim()
            };
        }
        return {
            type: 'Warning',
            color: '#ffb300',
            icon: <AlertTriangle size={16} />,
            bg: 'rgba(255, 179, 0, 0.1)',
            title: log.shortReason
        };
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log =>
            log.shortReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.detailedReason && log.detailedReason.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [logs, searchTerm]);

    const groupedLogs = useMemo(() => {
        const groups = {};
        filteredLogs.forEach(log => {
            const date = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            if (!groups[date]) groups[date] = [];
            groups[date].push(log);
        });
        return groups;
    }, [filteredLogs]);

    const stats = useMemo(() => {
        return {
            total: logs.length,
            critical: logs.filter(l => getErrorInfo(l).type === 'Critical').length,
            hydration: logs.filter(l => getErrorInfo(l).type === 'Hydration').length,
            users: new Set(logs.map(l => l.userId)).size
        };
    }, [logs]);

    const downloadLogs = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ Guest: logs }, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `error_report.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <Box sx={{ minHeight: '100vh', position: 'relative', bgcolor: '#fbfbfb', pb: 10 }}>
            <GridBackground opacity={0.3} />

            <Box sx={{
                position: 'sticky', top: 0, zIndex: 100,
                bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(15px)',
                borderBottom: '1px solid rgba(0,0,0,0.06)', mb: 4
            }}>
                <Container maxWidth={false}>
                    <Stack direction="row" height={80} alignItems="center" justifyContent="space-between" spacing={4}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton onClick={() => router.back()} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <ArrowLeft size={18} />
                            </IconButton>
                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                <Typography variant="subtitle2" fontWeight="900" sx={{ color: 'text.secondary', lineHeight: 1 }}>Log Explorer</Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ opacity: 0.6 }}>V1.0.4</Typography>
                            </Box>
                        </Stack>

                        <Paper elevation={0} sx={{
                            flexGrow: 1, maxWidth: 600, p: '4px 8px', display: 'flex', alignItems: 'center',
                            borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(0,0,0,0.02)'
                        }}>
                            <InputBase
                                sx={{ ml: 2, flex: 1, fontSize: '0.9rem', color: 'text.secondary', fontWeight: 500 }}
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={18} color="#7367f0" style={{ marginRight: 8 }} />
                        </Paper>

                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Export">
                                <IconButton onClick={downloadLogs} sx={{ border: '1px solid', borderColor: 'divider', p: 1 }}>
                                    <Download size={18} />
                                </IconButton>
                            </Tooltip>
                            <Button
                                variant="contained"
                                startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
                                onClick={fetchLogs}
                                disabled={loading}
                                sx={{ borderRadius: 2.5, bgcolor: '#7367f0', fontWeight: 700, boxShadow: 'none' }}
                            >
                                Refresh
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg">
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                    <Box sx={{ width: { xs: '100%', md: 240 }, flexShrink: 0 }}>
                        <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: 110 }}>
                            {[
                                { label: 'Total Logs', value: stats.total, color: 'text.secondary', icon: <Hash size={16} /> },
                                { label: 'Exceptions', value: stats.critical, color: '#f44336', icon: <Bug size={16} /> },
                                { label: 'Hydration', value: stats.hydration, color: '#2196f3', icon: <Layout size={16} /> },
                                { label: 'Users', value: stats.users, color: '#7367f0', icon: <User size={16} /> }
                            ].map((s, i) => (
                                <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'transparent' }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Box sx={{ color: s.color }}>{s.icon}</Box>
                                        <Box>
                                            <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1, color: 'text.secondary' }}>{s.value}</Typography>
                                            <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ opacity: 0.7 }}>{s.label}</Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                                <CircularProgress size={30} sx={{ color: '#7367f0' }} />
                            </Box>
                        ) : (
                            <Stack spacing={4}>
                                {Object.entries(groupedLogs).map(([date, group]) => (
                                    <Box key={date}>
                                        <Typography variant="caption" fontWeight="900" color="text.secondary" sx={{ letterSpacing: 1.5, mb: 2, display: 'block', textTransform: 'uppercase' }}>
                                            — {date}
                                        </Typography>
                                        <Stack spacing={2}>
                                            {group.map((log) => {
                                                const info = getErrorInfo(log);
                                                const isExpanded = expandedIds.has(log.id);
                                                return (
                                                    <Card key={log.id} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: isExpanded ? info.color : 'rgba(0,0,0,0.06)', bgcolor: isExpanded ? '#fff' : 'rgba(255,255,255,0.6)', overflow: 'hidden' }}>
                                                        <CardContent sx={{ p: 0 }}>
                                                            <Box onClick={() => toggleExpand(log.id)} sx={{ p: 2.5, cursor: 'pointer', display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                                                                <Avatar sx={{ bgcolor: info.bg, color: info.color, width: 40, height: 40, borderRadius: 2 }}>{info.icon}</Avatar>
                                                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                                    <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ fontSize: '0.65rem', mb: 0.5, display: 'block' }}>{info.type} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                                                                    <Typography variant="body1" fontWeight="700" sx={{ color: 'text.secondary', mb: 1, fontSize: '0.92rem', lineBreak: 'anywhere' }}>{info.title}</Typography>
                                                                    <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ opacity: 0.6 }}>@{log.userId.split('@')[0]}</Typography>
                                                                </Box>
                                                                <IconButton size="small" sx={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}><ChevronDown size={18} /></IconButton>
                                                            </Box>
                                                            <Collapse in={isExpanded}>
                                                                <Box sx={{ p: 3, bgcolor: '#f9f9f9', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                                                    <Stack spacing={2}>
                                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                                            <Typography variant="caption" fontWeight="900" color="text.secondary">STACK TRACE</Typography>
                                                                            <Button size="small" onClick={() => handleCopy(log.detailedReason)} sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem' }} startIcon={<Copy size={12} />}>Copy Detail</Button>
                                                                        </Stack>
                                                                        <Paper sx={{ p: 2, bgcolor: '#1e1e1e', borderRadius: 2, maxHeight: 400, overflow: 'auto' }}>
                                                                            <Typography component="pre" sx={{ color: '#ababab', fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap', lineHeight: 1.5, wordBreak: 'break-all' }}>
                                                                                {typeof log.detailedReason === 'string' && log.detailedReason.startsWith('{') ? JSON.stringify(JSON.parse(log.detailedReason), null, 2) : log.detailedReason || 'Nil.'}
                                                                            </Typography>
                                                                        </Paper>
                                                                    </Stack>
                                                                </Box>
                                                            </Collapse>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Container>
            <style jsx global>{` @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; } `}</style>
        </Box>
    );
};

export default ErrorLogPage;
