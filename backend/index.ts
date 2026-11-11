import { router, json, error, requireAuth, db, notifications, storage, invites, isInviteError } from '@appdeploy/sdk';
import { notifySubscribers, realtimeSubscriptionRoutes } from './realtime-subscribers';

type MessageRecord = {
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: number;
};

type CellRecord = {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  leaderId: string;
  leaderName: string;
  moderatorIds: string[];
  memberIds: string[];
  status: 'pending_approval' | 'approved' | 'rejected';
  meetingAt?: string;
  meetingTitle?: string;
  createdAt: number;
  updatedAt: number;
};

const clean = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

async function getCell(id: string) {
  const [cell] = await db.get<CellRecord>('cell_groups', [id]);
  return cell;
}

async function canManage(cell: CellRecord, userId: string) {
  return cell.creatorId === userId || cell.leaderId === userId || cell.moderatorIds.includes(userId);
}

async function logActivity(cellId: string, actorId: string, action: string, detail: string) {
  await db.add('cell_activity', [{
    cellId, actorId, action, detail, createdAt: Date.now(),
  }]);
}

async function publishCell(cell: CellRecord, event: string, actorId: string) {
  await notifySubscribers('cell_group', cell.id, { event, cell, actorId, at: Date.now() });
}

async function notifyUsers(userIds: string[], title: string, body: string, url = '/cells') {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (!unique.length) return;
  await notifications.send({
    userIds: unique,
    notification: { title, body, url },
    data: { kind: 'cell_group' },
  });
}

export const handler = router({
  'GET /api/_healthcheck': [async () => json({ message: 'Success' })],
  ...realtimeSubscriptionRoutes,
  'GET /api/messages': [
    requireAuth(),
    async ({ query }) => {
      const roomId = query.roomId;
      if (!roomId) return error('roomId is required', 400);
      const { items } = await db.list<MessageRecord>('messages', { limit: 100 });
      const messages = items.filter(m => m.roomId === roomId).sort((a, b) => a.createdAt - b.createdAt);
      return json({ messages });
    },
  ],
  'POST /api/messages': [
    requireAuth(),
    async ({ body, user }) => {
      const input = body as { roomId?: string; text?: string };
      const roomId = clean(input.roomId, 120);
      const text = clean(input.text, 4000);
      if (!roomId || !text) return error('roomId and text are required', 400);
      const [id] = await db.add('messages', [{
        roomId, senderId: user!.userId, senderName: user!.name || 'FNI Member',
        text, createdAt: Date.now(),
      }]);
      if (!id) return error('Could not save message', 500);
      const [message] = await db.get<MessageRecord>('messages', [id]);
      if (!message) return error('Could not read saved message', 500);
      const full = { ...message, id };
      await notifySubscribers('room_message', roomId, full);
      return json({ message: full }, 201);
    },
  ],

  'GET /api/cells': [
    requireAuth(),
    async ({ user }) => {
      const { items } = await db.list<CellRecord>('cell_groups', { limit: 100 });
      const cells = items.filter(c => c.status === 'approved' || c.creatorId === user!.userId || c.memberIds.includes(user!.userId));
      return json({ cells });
    },
  ],
  'POST /api/cells': [
    requireAuth(),
    async ({ body, user }) => {
      const input = body as { name?: string; description?: string };
      const name = clean(input.name, 90);
      const description = clean(input.description, 700);
      if (name.length < 3) return error('Group name must contain at least 3 characters.', 400);
      const now = Date.now();
      const [id] = await db.add('cell_groups', [{
        name, description, creatorId: user!.userId, creatorName: user!.name || 'FNI Member',
        leaderId: user!.userId, leaderName: user!.name || 'FNI Member',
        moderatorIds: [], memberIds: [user!.userId], status: 'pending_approval',
        createdAt: now, updatedAt: now,
      }]);
      if (!id) return error('Could not create cell group.', 500);
      const cell = await getCell(id);
      if (!cell) return error('Group was created but could not be loaded.', 500);
      await db.add('cell_members', [{ cellId: id, userId: user!.userId, displayName: user!.name || 'FNI Member', role: 'leader', joinedAt: now }]);
      await logActivity(id, user!.userId, 'group_created', 'Submitted a new cell group for approval');
      await publishCell(cell, 'created', user!.userId);
      return json({ cell, approval: 'pending_approval', message: 'Your group has been submitted. It will become visible to all members after approval.' }, 201);
    },
  ],
  'GET /api/cells/:id': [
    requireAuth(),
    async ({ params, user }) => {
      const cell = await getCell(params.id);
      if (!cell) return error('Cell group not found.', 404);
      if (cell.status !== 'approved' && !(await canManage(cell, user!.userId))) return error('You do not have access to this group.', 403);
      const [activities, attendance, growth, mentorship, media] = await Promise.all([
        db.list('cell_activity', { limit: 100 }),
        db.list('cell_attendance', { limit: 100 }),
        db.list('cell_growth', { limit: 100 }),
        db.list('cell_mentorship', { limit: 100 }),
        db.list('cell_media', { limit: 50 }),
      ]);
      const owns = (x: { cellId?: string }) => x.cellId === cell.id;
      return json({
        cell,
        activities: activities.items.filter(owns),
        attendance: attendance.items.filter(owns),
        growth: growth.items.filter(owns),
        mentorship: mentorship.items.filter(owns),
        media: media.items.filter(owns),
      });
    },
  ],
  'PUT /api/cells/:id': [
    requireAuth(),
    async ({ params, body, user }) => {
      const cell = await getCell(params.id);
      if (!cell) return error('Cell group not found.', 404);
      if (!(await canManage(cell, user!.userId))) return error('Only the group creator, leader or moderator can manage this group.', 403);
      const input = body as { name?: string; description?: string; moderatorIds?: string[] };
      const patch: Record<string, unknown> = { updatedAt: Date.now() };
      if (input.name !== undefined) {
        const name = clean(input.name, 90);
        if (name.length < 3) return error('Group name must contain at least 3 characters.', 400);
        patch.name = name;
      }
      if (input.description !== undefined) patch.description = clean(input.description, 700);
      if (input.moderatorIds !== undefined) {
        if (!Array.isArray(input.moderatorIds) || input.moderatorIds.length > 20 || input.moderatorIds.some(x => typeof x !== 'string' || x.length > 100)) return error('Invalid moderator list.', 400);
        patch.moderatorIds = Array.from(new Set(input.moderatorIds));
      }
      const [ok] = await db.tx.update('cell_groups', [{ id: cell.id, record: patch }], { patch: true });
      if (!ok) return error('Could not update group.', 409);
      await logActivity(cell.id, user!.userId, 'group_updated', 'Updated group details or moderators');
      const updated = await getCell(cell.id);
      if (updated) await publishCell(updated, 'updated', user!.userId);
      return json({ cell: updated });
    },
  ],
  'POST /api/cells/:id/schedule': [
    requireAuth(),
    async ({ params, body, user }) => {
      const cell = await getCell(params.id);
      if (!cell) return error('Cell group not found.', 404);
      if (!(await canManage(cell, user!.userId))) return error('You cannot schedule this group meeting.', 403);
      const input = body as { title?: string; meetingAt?: string };
      const title = clean(input.title, 100);
      const date = input.meetingAt ? new Date(input.meetingAt) : null;
      if (!title || !date || Number.isNaN(date.getTime()) || date.getTime() < Date.now() - 60000) return error('Provide a meeting title and a future date/time.', 400);
      const [ok] = await db.tx.update('cell_groups', [{ id: cell.id, record: { meetingTitle: title, meetingAt: date.toISOString(), updatedAt: Date.now() } }], { patch: true });
      if (!ok) return error('Could not save meeting schedule.', 500);
      await logActivity(cell.id, user!.userId, 'meeting_scheduled', title + ' • ' + date.toISOString());
      const updated = await getCell(cell.id);
      if (updated) await publishCell(updated, 'meeting_scheduled', user!.userId);
      const recipients = [...cell.memberIds, cell.leaderId, ...cell.moderatorIds].filter(id => id !== user!.userId);
      await notifyUsers(recipients, 'Cell meeting scheduled', title + ' has been scheduled.');
      return json({ cell: updated });
    },
  ],
  'POST /api/cells/:id/attendance': [
    requireAuth(),
    async ({ params, body, user }) => {
      const cell = await getCell(params.id);
      if (!cell || cell.status !== 'approved') return error('Approved cell group not found.', 404);
      const input = body as { meetingAt?: string; presentUserIds?: string[]; notes?: string };
      if (!(await canManage(cell, user!.userId))) return error('Only group leaders and moderators can submit attendance.', 403);
      const presentUserIds = Array.isArray(input.presentUserIds) ? Array.from(new Set(input.presentUserIds.filter(x => cell.memberIds.includes(x)))) : [];
      const meetingAt = input.meetingAt ? new Date(input.meetingAt) : new Date();
      if (Number.isNaN(meetingAt.getTime())) return error('Invalid meeting date.', 400);
      const [id] = await db.add('cell_attendance', [{
        cellId: cell.id, submittedBy: user!.userId, meetingAt: meetingAt.toISOString(),
        presentUserIds, presentCount: presentUserIds.length, memberCount: cell.memberIds.length,
        notes: clean(input.notes, 500), createdAt: Date.now(),
      }]);
      if (!id) return error('Could not save attendance.', 500);
      await logActivity(cell.id, user!.userId, 'attendance_recorded', presentUserIds.length + ' members present');
      await publishCell(cell, 'attendance_recorded', user!.userId);
      return json({ attendanceId: id, presentCount: presentUserIds.length, memberCount: cell.memberIds.length }, 201);
    },
  ],
  'POST /api/cells/:id/growth': [
    requireAuth(),
    async ({ params, body, user }) => {
      const cell = await getCell(params.id);
      if (!cell || cell.status !== 'approved') return error('Approved cell group not found.', 404);
      if (!(await canManage(cell, user!.userId))) return error('Only group leaders and moderators can record growth.', 403);
      const input = body as { memberId?: string; category?: string; note?: string; nextStep?: string };
      const memberId = clean(input.memberId, 100);
      const category = clean(input.category, 60);
      if (!cell.memberIds.includes(memberId) || !category) return error('Select a member and growth category.', 400);
      const [id] = await db.add('cell_growth', [{
        cellId: cell.id, memberId, category, note: clean(input.note, 700),
        nextStep: clean(input.nextStep, 300), recordedBy: user!.userId, createdAt: Date.now(),
      }]);
      if (!id) return error('Could not save growth record.', 500);
      await logActivity(cell.id, user!.userId, 'growth_recorded', 'Recorded a member development update');
      return json({ id }, 201);
    },
  ],
  'POST /api/cells/:id/mentorship': [
    requireAuth(),
    async ({ params, body, user }) => {
      const cell = await getCell(params.id);
      if (!cell || cell.status !== 'approved') return error('Approved cell group not found.', 404);
      if (!(await canManage(cell, user!.userId))) return error('Only group leaders and moderators can manage mentorship.', 403);
      const input = body as { mentorId?: string; menteeId?: string; focus?: string; nextReviewAt?: string };
      const mentorId = clean(input.mentorId, 100);
      const menteeId = clean(input.menteeId, 100);
      if (!cell.memberIds.includes(mentorId) || !cell.memberIds.includes(menteeId) || mentorId === menteeId) return error('Choose two different members of this cell.', 400);
      const [id] = await db.add('cell_mentorship', [{
        cellId: cell.id, mentorId, menteeId, focus: clean(input.focus, 300),
        nextReviewAt: clean(input.nextReviewAt, 40), createdBy: user!.userId, createdAt: Date.now(),
      }]);
      if (!id) return error('Could not save mentorship structure.', 500);
      await logActivity(cell.id, user!.userId, 'mentorship_assigned', 'Created a mentorship pairing');
      return json({ id }, 201);
    },
  ],
  'POST /api/cells/:id/media': [
    requireAuth(),
    async ({ params, body, user }) => {
      const cell = await getCell(params.id);
      if (!cell || cell.status !== 'approved') return error('Approved cell group not found.', 404);
      if (!(await canManage(cell, user!.userId)) && !cell.memberIds.includes(user!.userId)) return error('You do not have access to this group.', 403);
      const input = body as { fileName?: string; contentType?: string; base64?: string };
      const fileName = clean(input.fileName, 100).replace(/[^a-zA-Z0-9._-]/g, '_');
      const contentType = clean(input.contentType, 100);
      const base64 = typeof input.base64 === 'string' ? input.base64 : '';
      if (!fileName || !/^image\/(png|jpeg|webp|gif)$|^video\/(mp4|webm)$|^application\/pdf$/.test(contentType) || !base64 || base64.length > 5_000_000) return error('Upload a supported image, video or PDF under the size limit.', 400);
      const path = 'cell-media/' + cell.id + '/' + Date.now() + '-' + fileName;
      const [saved] = await storage.write([{ path, content: base64, contentType }]);
      if (!saved) return error('Media upload failed.', 500);
      const [signed] = await storage.url([path]);
      const [id] = await db.add('cell_media', [{
        cellId: cell.id, path, fileName, contentType, url: signed?.url || '',
        uploadedBy: user!.userId, createdAt: Date.now(),
      }]);
      if (!id) return error('Media uploaded but its record could not be saved.', 500);
      await logActivity(cell.id, user!.userId, 'media_shared', fileName);
      return json({ id, url: signed?.url || '' }, 201);
    },
  ],
  'POST /api/cells/:id/start-meeting': [
    requireAuth(),
    async ({ params, user }) => {
      const cell = await getCell(params.id);
      if (!cell || cell.status !== 'approved') return error('Approved cell group not found.', 404);
      if (!(await canManage(cell, user!.userId))) return error('Only group leaders and moderators can start this meeting.', 403);
      const recipients = [...cell.memberIds, cell.leaderId, ...cell.moderatorIds].filter(id => id !== user!.userId);
      await notifyUsers(recipients, 'Cell meeting has started', cell.name + ' is now meeting.');
      await logActivity(cell.id, user!.userId, 'meeting_started', 'Started a cell meeting');
      await publishCell(cell, 'meeting_started', user!.userId);
      return json({ started: true, notifiedUsers: recipients.length });
    },
  ],

  'GET /api/cells/:id/members': [
    requireAuth(),
    async ({ params, user }) => {
      const cell = await getCell(params.id);
      if (!cell || (cell.status !== 'approved' && !(await canManage(cell, user!.userId)))) return error('Cell group not found or not available.', 404);
      const { items } = await db.list<{ cellId: string; userId: string; displayName: string; role: string; joinedAt: number }>('cell_members', { limit: 200 });
      return json({ members: items.filter(member => member.cellId === cell.id) });
    },
  ],
  'POST /api/cells/:id/invites': [
    requireAuth(),
    async ({ params, user }) => {
      const cell = await getCell(params.id);
      if (!cell || cell.status !== 'approved') return error('Only approved cell groups can invite members.', 404);
      if (!(await canManage(cell, user!.userId))) return error('Only the group leader or moderators can invite members.', 403);
      try {
        const created = await invites.create({
          resourceType: 'fni_cell_group',
          authMode: 'required',
          actor: user!,
          expiresInSec: 60 * 60 * 24 * 7,
          context: { cellId: cell.id },
        });
        await logActivity(cell.id, user!.userId, 'member_invite_created', 'Created a seven-day member invitation');
        return json({ code: created.code, expiresInDays: 7 }, 201);
      } catch (err) {
        if (isInviteError(err)) return error(err.code, 400);
        throw err;
      }
    },
  ],
  'GET /api/cell-invites/:code': [
    async ({ params }) => {
      try {
        const resolved = await invites.resolve({ code: params.code });
        if (resolved.resourceType !== 'fni_cell_group' || !resolved.context?.cellId) return error('This invitation is not for a cell group.', 400);
        const cell = await getCell(String(resolved.context.cellId));
        if (!cell || cell.status !== 'approved') return error('This cell group is not currently available.', 404);
        return json({ status: resolved.status, cell: { id: cell.id, name: cell.name, description: cell.description } });
      } catch (err) {
        if (isInviteError(err)) return error(err.code, 400);
        throw err;
      }
    },
  ],
  'POST /api/cell-invites/:code/join': [
    requireAuth(),
    async ({ params, user }) => {
      try {
        const joined = await invites.join({ code: params.code, actor: user! });
        if (joined.resourceType !== 'fni_cell_group' || !joined.context?.cellId) return error('This invitation is not for a cell group.', 400);
        const cell = await getCell(String(joined.context.cellId));
        if (!cell || cell.status !== 'approved') return error('This cell group is not currently available.', 404);
        if (cell.memberIds.includes(user!.userId)) return json({ joined: true, alreadyMember: true, cellId: cell.id });
        const memberIds = [...cell.memberIds, user!.userId];
        const [updated] = await db.tx.update('cell_groups', [{ id: cell.id, record: { memberIds, updatedAt: Date.now() } }], { patch: true });
        if (!updated) return error('Could not add you to this cell group.', 500);
        await db.add('cell_members', [{
          cellId: cell.id, userId: user!.userId, displayName: user!.name || 'FNI Member',
          role: 'member', joinedAt: Date.now(),
        }]);
        await logActivity(cell.id, user!.userId, 'member_joined', (user!.name || 'A member') + ' joined using an invitation');
        await publishCell(cell, 'member_joined', user!.userId);
        await notifyUsers([cell.leaderId, ...cell.moderatorIds].filter(id => id !== user!.userId), 'New cell member', (user!.name || 'A member') + ' joined ' + cell.name + '.');
        return json({ joined: true, cellId: cell.id }, 201);
      } catch (err) {
        if (isInviteError(err)) return error(err.code, 400);
        throw err;
      }
    },
  ],
  'GET /api/cells/:id/prayer-rooms': [
    requireAuth(),
    async ({ params, user }) => {
      const cell = await getCell(params.id);
      if (!cell || cell.status !== 'approved' || !cell.memberIds.includes(user!.userId)) return error('You must be a member of this approved cell to view its prayer rooms.', 403);
      const [rooms, requests, support] = await Promise.all([
        db.list<{ id: string; cellId: string; name: string; createdBy: string; createdAt: number }>('cell_prayer_rooms', { limit: 100 }),
        db.list<{ id: string; cellId: string; roomId: string; authorId: string; authorName: string; request: string; createdAt: number }>('cell_prayer_requests', { limit: 200 }),
        db.list<{ requestId: string; userId: string; createdAt: number }>('cell_prayer_support', { limit: 500 }),
      ]);
      return json({
        rooms: rooms.items.filter(room => room.cellId === cell.id),
        requests: requests.items.filter(request => request.cellId === cell.id).map(request => ({
          ...request,
          prayedCount: support.items.filter(item => item.requestId === request.id).length,
          prayedByMe: support.items.some(item => item.requestId === request.id && item.userId === user!.userId),
        })),
      });
    },
  ],
  'POST /api/cells/:id/prayer-rooms': [
    requireAuth(),
    async ({ params, body, user }) => {
      const cell = await getCell(params.id);
      if (!cell || cell.status !== 'approved' || !cell.memberIds.includes(user!.userId)) return error('Only members of an approved cell can create prayer rooms.', 403);
      const input = body as { name?: string };
      const name = clean(input.name, 80);
      if (name.length < 3) return error('Prayer room name must contain at least 3 characters.', 400);
      const [id] = await db.add('cell_prayer_rooms', [{
        cellId: cell.id, name, createdBy: user!.userId, createdAt: Date.now(),
      }]);
      if (!id) return error('Could not create prayer room.', 500);
      await logActivity(cell.id, user!.userId, 'prayer_room_created', name);
      await notifyUsers(cell.memberIds.filter(id => id !== user!.userId), 'New prayer room', name + ' was created in ' + cell.name + '.');
      return json({ id, name }, 201);
    },
  ],
  'POST /api/cells/:id/prayer-rooms/:roomId/requests': [
    requireAuth(),
    async ({ params, body, user }) => {
      const cell = await getCell(params.id);
      if (!cell || cell.status !== 'approved' || !cell.memberIds.includes(user!.userId)) return error('Only members of an approved cell can post prayer requests.', 403);
      const { items } = await db.list<{ id: string; cellId: string }>('cell_prayer_rooms', { limit: 100 });
      if (!items.some(room => room.id === params.roomId && room.cellId === cell.id)) return error('Prayer room not found.', 404);
      const input = body as { request?: string };
      const request = clean(input.request, 1000);
      if (request.length < 5) return error('Prayer request must contain at least 5 characters.', 400);
      const [id] = await db.add('cell_prayer_requests', [{
        cellId: cell.id, roomId: params.roomId, authorId: user!.userId,
        authorName: user!.name || 'FNI Member', request, createdAt: Date.now(),
      }]);
      if (!id) return error('Could not save prayer request.', 500);
      await logActivity(cell.id, user!.userId, 'prayer_request_added', 'Added a prayer request to ' + params.roomId);
      await notifyUsers(cell.memberIds.filter(memberId => memberId !== user!.userId), 'Prayer request shared', (user!.name || 'A member') + ' shared a request in ' + cell.name + '.');
      return json({ id }, 201);
    },
  ],
  'POST /api/cells/:id/prayer-requests/:requestId/pray': [
    requireAuth(),
    async ({ params, user }) => {
      const cell = await getCell(params.id);
      if (!cell || cell.status !== 'approved' || !cell.memberIds.includes(user!.userId)) return error('Only members of an approved cell can respond to prayer requests.', 403);
      const [request] = await db.get<{ id: string; cellId: string }>('cell_prayer_requests', [params.requestId]);
      if (!request || request.cellId !== cell.id) return error('Prayer request not found.', 404);
      const { items } = await db.list<{ requestId: string; userId: string }>('cell_prayer_support', { limit: 500 });
      if (items.some(item => item.requestId === request.id && item.userId === user!.userId)) return json({ prayed: true, alreadyMarked: true });
      await db.add('cell_prayer_support', [{ requestId: request.id, userId: user!.userId, createdAt: Date.now() }]);
      return json({ prayed: true }, 201);
    },
  ],
});