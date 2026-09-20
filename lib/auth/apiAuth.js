import { NextResponse } from 'next/server';
import { verifySessionToken } from './session';

/**
 * Validates API request session token and optional role permissions.
 * @param {Request} request 
 * @param {string[]} [allowedRoles] Optional array of allowed roles e.g. ['OWNER', 'ADMIN']
 * @returns {Promise<{ session: object|null, errorResponse: NextResponse|null }>}
 */
export async function requireApiAuth(request, allowedRoles = []) {
  const token = 
    request.cookies.get('auth_token')?.value || 
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      ),
    };
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Invalid or expired session. Please log in again.' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      session,
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges for this action.' },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}
