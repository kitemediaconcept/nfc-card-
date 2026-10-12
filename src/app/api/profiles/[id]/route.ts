import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const profile = await DataStore.getProfileById(id, user.id);

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { updates, isPublish } = body;

    const updated = await DataStore.updateProfile(id, user.id, updates, !!isPublish);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating profile';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await DataStore.deleteProfile(id, user.id);

  if (!deleted) {
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
