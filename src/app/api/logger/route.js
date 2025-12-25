import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const errorData = await request.json();
        const { userId, tokenNo, timestamp, shortReason, detailedReason } = errorData;

        const atkKey = tokenNo || 'Guest';
        const logEntry = {
            userId: userId || 'Guest',
            timestamp: timestamp || new Date().toISOString(),
            shortReason: shortReason || 'Unknown Error',
            detailedReason: detailedReason || 'No details provided',
        };

        const logFilePath = path.join(process.cwd(), 'public', 'logs', 'error_logs.json');

        let logs = {};
        try {
            const fileContent = await fs.readFile(logFilePath, 'utf8');
            const parsed = JSON.parse(fileContent);
            if (Array.isArray(parsed)) {
                logs = {};
            } else {
                logs = parsed || {};
            }
        } catch (err) {
            logs = {};
        }

        if (!logs[atkKey]) {
            logs[atkKey] = [];
        }
        logs[atkKey].push(logEntry);

        await fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), 'utf8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logging API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
