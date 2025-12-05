const shortcutRegistry = new Map();

export function registerShortcut(key, callback, scope) {
    if (!shortcutRegistry.has(scope)) {
        shortcutRegistry.set(scope, new Map());
    }
    shortcutRegistry.get(scope).set(key, callback);
}

export function unregisterScope(scope) {
    shortcutRegistry.delete(scope);
}

export function attachGlobalShortcutHandler() {
    if (typeof window === "undefined") return;

    if (window.__shortcutHandlerAttached) return;
    window.__shortcutHandlerAttached = true;

    window.addEventListener("keydown", (e) => {
        for (const [, shortcuts] of shortcutRegistry) {
            const handler = shortcuts.get(e.key);
            if (handler) {
                e.preventDefault();
                handler();
                break;
            }
        }
    });
}
