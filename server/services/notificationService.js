import { prisma } from '@/lib/db/prisma';

/**
 * Creates a role-based persistent notification in the database
 */
export async function createNotification({ userId = null, targetRole = null, title, message, type = 'SYSTEM', link = null }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        targetRole,
        title,
        message,
        type,
        link,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Fetch dynamic role-based notifications for a user/role from database
 * Enforces strict Role-Based Access Control (RBAC)
 * 
 * @param {object} session { userId, role, partyId, employeeId }
 */
export async function getUserNotifications(session = null) {
  if (!session) {
    return [];
  }

  const { userId, role, partyId } = session;

  // Build Role-Based Where Filter
  let whereCondition = {};

  if (role === 'FARMER') {
    // FARMER: Only see notifications targeted specifically to their userId or generic FARMER role (with no specific userId)
    whereCondition = {
      OR: [
        { userId: userId || 'none' },
        { targetRole: 'FARMER', userId: null },
      ],
    };

    // Auto-generate Farmer-specific purchase notifications if partyId exists
    if (partyId) {
      const farmerPurchases = await prisma.purchase.findMany({
        where: { partyId },
        orderBy: { date: 'desc' },
        take: 5,
        include: { items: { include: { commodity: true } } },
      });

      for (const pur of farmerPurchases) {
        const item = pur.items?.[0];
        const cmdName = item?.commodity?.localName || item?.commodity?.name || 'धान / गेहूँ';
        const exists = await prisma.notification.findFirst({
          where: { userId, type: 'PURCHASE', link: '/portal/farmer' },
        });

        if (!exists) {
          await createNotification({
            userId,
            targetRole: 'FARMER',
            title: 'फसल खरीद पर्ची (Crop Purchase)',
            message: `आपकी ${item?.displayQuantity || 0} क्विंटल ${cmdName} की पर्ची (${pur.purchaseNo}) दर्ज हुई। देय राशि: ₹${pur.netAmount}`,
            type: 'PURCHASE',
            link: '/portal/farmer',
          });
        }
      }
    }
  } else if (['EMPLOYEE', 'DRIVER'].includes(role)) {
    // STAFF: Only staff-relevant alerts or user-specific alerts
    whereCondition = {
      OR: [
        { userId: userId || 'none' },
        { targetRole: role, userId: null },
        { targetRole: 'EMPLOYEE', userId: null },
      ],
    };
  } else if (role === 'ACCOUNTANT') {
    // ACCOUNTANT: Financial, dues, and payment alerts (not private farmer notifications)
    whereCondition = {
      OR: [
        { userId: userId || 'none' },
        { targetRole: 'ACCOUNTANT', userId: null },
        { targetRole: 'ADMIN', userId: null },
        { targetRole: null, userId: null },
      ],
    };
  } else if (role === 'MANAGER') {
    // MANAGER: Godown stock & logistics alerts
    whereCondition = {
      OR: [
        { userId: userId || 'none' },
        { targetRole: 'MANAGER', userId: null },
        { targetRole: 'ADMIN', userId: null },
        { targetRole: null, userId: null },
      ],
    };
  } else {
    // ADMIN / OWNER / CO_OWNER: All management and system-wide notifications, excluding private farmer-specific notifications
    whereCondition = {
      OR: [
        { userId: userId || 'none' },
        { targetRole: { in: ['ADMIN', 'OWNER', 'CO_OWNER', 'ACCOUNTANT', 'MANAGER'] }, userId: null },
        { targetRole: null, userId: null },
      ],
    };
  }

  // 2. Fetch persistent role-filtered notifications
  let notifications = await prisma.notification.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  // 3. Dynamic check for today's promised payment dues for management roles
  if (['ADMIN', 'OWNER', 'CO_OWNER', 'ACCOUNTANT'].includes(role) && notifications.length < 5) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const duePurchases = await prisma.purchase.findMany({
      where: {
        promisedDate: { gte: todayStart, lte: todayEnd },
        dueAmount: { gt: 0 },
        status: 'POSTED',
      },
      include: { party: { select: { name: true } } },
      take: 5,
    });

    for (const pur of duePurchases) {
      const exists = notifications.some((n) => n.link === `/purchases/${pur.id}`);
      if (!exists) {
        await createNotification({
          userId: null,
          targetRole: 'ACCOUNTANT',
          title: 'Promised Payment Due Today',
          message: `Voucher ${pur.purchaseNo} for ${pur.party?.name || 'Farmer'} has ₹${pur.dueAmount} due today.`,
          type: 'DUE_DATE',
          link: `/purchases/${pur.id}`,
        });
      }
    }

    // Refetch list after check
    notifications = await prisma.notification.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  return notifications;
}

/**
 * Mark notification(s) as read
 */
export async function markNotificationsAsRead(notificationIds = [], userId = null) {
  if (!notificationIds || notificationIds.length === 0) {
    await prisma.notification.updateMany({
      where: userId ? { OR: [{ userId }, { userId: null }] } : {},
      data: { read: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { id: { in: notificationIds } },
      data: { read: true },
    });
  }

  return { success: true };
}

/**
 * Clear/Delete all notifications for a user or session
 */
export async function clearUserNotifications(session = null) {
  if (!session) return { success: false };

  const { userId, role } = session;

  if (userId) {
    // Delete notifications specific to this user or user's role
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { userId },
          { targetRole: role },
          ...(role === 'FARMER' ? [] : [{ targetRole: null }]),
        ],
      },
    });
  } else {
    await prisma.notification.deleteMany({});
  }

  return { success: true };
}
