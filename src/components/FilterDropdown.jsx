import { useEffect, useState, useRef, useMemo } from "react";
import {
    Box,
    Popover,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    InputAdornment,
    Typography,
    CircularProgress
} from "@mui/material";
import { Search, Check } from "lucide-react";

export default function FilterDropdown({ title, items, anchorEl, onClose, onSelect, selectedItems, isLoading }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const listRef = useRef(null);

    // Reset state when items or search changes
    const filteredItems = useMemo(() => {
        if (!items) return [];
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    useEffect(() => {
        setSearchTerm("");
        setFocusedIndex(-1);
    }, [title, anchorEl]);

    useEffect(() => {
        setFocusedIndex(-1);
    }, [filteredItems.length, searchTerm]);


    // Keyboard Navigation
    const handleKeyDown = (event) => {
        const listLength = filteredItems.length;
        if (listLength === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setFocusedIndex((prev) => (prev < listLength - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                event.preventDefault();
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : listLength - 1));
                break;
            case 'Enter':
                event.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < listLength) {
                    onSelect(title, filteredItems[focusedIndex]);
                } else if (listLength > 0 && searchTerm) {
                    // Optional: Select first item if hitting enter with search term but no focus
                    onSelect(title, filteredItems[0]);
                }
                break;
            case 'Escape':
                event.preventDefault();
                onClose();
                break;
            default:
                break;
        }
    };

    // Auto-scroll to focused item
    useEffect(() => {
        if (focusedIndex !== -1 && listRef.current) {
            const focusedElement = listRef.current.querySelector(`[data-index="${focusedIndex}"]`);
            if (focusedElement) {
                focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [focusedIndex]);

    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            PaperProps={{
                sx: {
                    width: 280,
                    maxHeight: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    mb: 2.5, // Increasing margin to lift it up slightly more based on user feedback
                    boxShadow: 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px !important',
                    bgcolor: 'background.paper',
                    overflow: 'hidden'
                }
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <TextField
                    size="small"
                    placeholder={`Search ${title}...`}
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={16} style={{ color: '#94a3b8' }} />
                            </InputAdornment>
                        ),
                        sx: {
                            fontSize: 14,
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0,0,0,0.15)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0,0,0,0.3)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                                borderWidth: '1.5px',
                            }
                        }
                    }}
                />
            </Box>

            <List
                ref={listRef}
                sx={{
                    overflowY: 'auto',
                    flex: 1,
                    p: 0,
                    '&::-webkit-scrollbar': { width: 5 },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: 4 },
                    '&::-webkit-scrollbar-thumb:hover': { background: '#94a3b8' }
                }}
            >
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={24} thickness={4} />
                    </Box>
                ) : filteredItems.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No matching result found.
                        </Typography>
                    </Box>
                ) : (
                    filteredItems.map((item, index) => {
                        const isSelected = selectedItems.some(f => f.item.id === item.id && f.category === title);
                        const isFocused = index === focusedIndex;

                        return (
                            <ListItem key={item.id} disablePadding data-index={index}>
                                <ListItemButton
                                    onClick={() => onSelect(title, item)}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    dense
                                    sx={{
                                        py: 0.5,
                                        px: 2,
                                        gap: 1.5,
                                        bgcolor: isFocused
                                            ? 'rgba(115, 103, 240, 0.08)'
                                            : isSelected ? 'rgba(115, 103, 240, 0.04)' : 'transparent',
                                        '&:hover': {
                                            bgcolor: 'rgba(115, 103, 240, 0.08)'
                                        },
                                        transition: 'background-color 0.1s'
                                    }}
                                >
                                    <ListItemText
                                        primary={item.name}
                                        primaryTypographyProps={{
                                            fontSize: 14,
                                            fontWeight: isSelected ? 600 : 400,
                                            color: isSelected ? 'primary.main' : 'text.primary',
                                            textTransform: 'capitalize'
                                        }}
                                    />
                                    {isSelected && <Check size={16} color="#7367f0" strokeWidth={2.5} />}
                                </ListItemButton>
                            </ListItem>
                        );
                    })
                )}
            </List>
        </Popover>
    );
}
