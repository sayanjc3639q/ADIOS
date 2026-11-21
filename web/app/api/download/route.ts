import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  // Check for the generated Inno Setup installer
  const setupPath = path.join(process.cwd(), '..', 'dist', 'ADIOS_Setup.exe');

  if (fs.existsSync(setupPath)) {
    const fileBuffer = fs.readFileSync(setupPath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="ADIOS_Setup.exe"',
        'Content-Type': 'application/octet-stream',
      },
    });
  }

  // Fallback to raw binary if setup is not compiled yet
  const exePath = path.join(process.cwd(), '..', 'dist', 'ADIOS.exe');
  if (fs.existsSync(exePath)) {
    const fileBuffer = fs.readFileSync(exePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="ADIOS.exe"',
        'Content-Type': 'application/octet-stream',
      },
    });
  }

  return NextResponse.json(
    { error: 'Installer binary is currently compiling. Please try again in a moment.' },
    { status: 404 }
  );
}
