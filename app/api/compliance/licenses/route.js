import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const licenses = await prisma.complianceLicense.findMany({
      orderBy: { expiryDate: 'asc' },
    });

    const now = new Date();

    const processedLicenses = licenses.map((lic) => {
      const expiry = new Date(lic.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let calculatedStatus = lic.status;
      if (diffDays <= 0) {
        calculatedStatus = 'EXPIRED';
      } else if (diffDays <= (lic.reminderDays || 30)) {
        calculatedStatus = 'EXPIRING_SOON';
      } else {
        calculatedStatus = 'VALID';
      }

      return {
        ...lic,
        daysRemaining: diffDays,
        status: calculatedStatus,
      };
    });

    let filtered = processedLicenses;
    if (category && category !== 'ALL') {
      filtered = filtered.filter((l) => l.category === category);
    }
    if (status && status !== 'ALL') {
      filtered = filtered.filter((l) => l.status === status);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error fetching compliance licenses:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, category, licenseNumber, issuingAuthority, issueDate, expiryDate, reminderDays, renewalFee, notes } = body;

    if (!title || !expiryDate) {
      return NextResponse.json({ success: false, error: 'Title and Expiry Date are required' }, { status: 400 });
    }

    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status = 'VALID';
    if (diffDays <= 0) status = 'EXPIRED';
    else if (diffDays <= (parseInt(reminderDays) || 30)) status = 'EXPIRING_SOON';

    const license = await prisma.complianceLicense.create({
      data: {
        title,
        category: category || 'WEIGHT_MACHINE',
        licenseNumber: licenseNumber || null,
        issuingAuthority: issuingAuthority || null,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiry,
        reminderDays: parseInt(reminderDays) || 30,
        renewalFee: parseFloat(renewalFee || 0),
        status,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, data: license });
  } catch (error) {
    console.error('Error creating compliance license:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, action, newExpiryDate, renewalFee } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'License ID is required' }, { status: 400 });
    }

    let updated;
    if (action === 'RENEW') {
      const nextExpiry = newExpiryDate ? new Date(newExpiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      updated = await prisma.complianceLicense.update({
        where: { id },
        data: {
          expiryDate: nextExpiry,
          status: 'VALID',
          issueDate: new Date(),
          renewalFee: renewalFee !== undefined ? parseFloat(renewalFee) : undefined,
        },
      });
    } else {
      updated = await prisma.complianceLicense.update({
        where: { id },
        data: body,
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating compliance license:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
