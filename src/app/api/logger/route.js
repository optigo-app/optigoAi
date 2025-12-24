import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const errorData = await request.json();
        const { tokenNo, timestamp, shortReason, detailedReason } = errorData;

        const logEntry = {
            tokenNo: tokenNo || 'Guest',
            timestamp: timestamp || new Date().toISOString(),
            shortReason: shortReason || 'Unknown Error',
            detailedReason: detailedReason || 'No details provided',
        };

        const logFilePath = path.join(process.cwd(), 'public', 'logs', 'error_logs.json');

        let logs = [];
        try {
            const fileContent = await fs.readFile(logFilePath, 'utf8');
            logs = JSON.parse(fileContent);
            if (!Array.isArray(logs)) logs = [];
        } catch (err) {
            // File doesn't exist or is empty
            logs = [];
        }

        logs.push(logEntry);

        await fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), 'utf8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logging API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
