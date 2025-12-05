"use client";

import { useEffect } from "react";
import {
    registerShortcut,
    unregisterScope,
    attachGlobalShortcutHandler
} from "@/utils/keyboardShortcuts";

export function useShortcuts(scope, shortcuts = {}, active = true) {
    useEffect(() => {
        if (!active) return;

        attachGlobalShortcutHandler();

        // Register shortcuts for this scope
        Object.entries(shortcuts).forEach(([key, handler]) => {
            registerShortcut(key, handler, scope);
        });

        return () => {
            unregisterScope(scope);
        };
    }, [scope, active]);
}
