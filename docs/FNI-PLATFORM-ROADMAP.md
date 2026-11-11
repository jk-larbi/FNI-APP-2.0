# FNI 2.0 — Product Roadmap and Acceptance Requirements

This document records requested capabilities that are not represented as completed features in the imported source snapshot. These requirements must be implemented, tested and deployed before being described as live.

## 1. Man of God / Super Admin portal

- Provide a distinct Man of God sign-in and registration/activation route, separate from ordinary member registration.
- Ordinary users must never be able to self-assign Super Admin.
- Initial Super Admin identity and activation must be explicitly authorised by the project owner.
- Give the Man of God global oversight of cell groups, leaders, moderators, members, meetings, attendance, prayer rooms, member development, mentorship, media, notifications and activity history.
- Display real database totals and genuine empty states only. Never seed placeholder counts or sample people/groups.
- Support review and approval/rejection of new cell-group requests, with recorded decisions and notifications.

## 2. Delegated administration and granular permissions

The Man of God can appoint trusted administrators/moderators and assign individual permissions, Telegram-style. Permissions must be enforced by backend authorization on every protected operation, not only by hiding frontend controls.

Permission examples:
- Manage cell groups and approve/reject group requests
- Manage members and appoint/remove cell moderators
- Schedule, host, start and end meetings
- Send church-wide announcements
- Manage prayer rooms and requests
- View attendance and reports
- View member spiritual-growth and mentorship records
- Manage shared media
- View audit/activity logs
- Manage delegated administrators

The Man of God retains ultimate authority. Delegated admins cannot grant themselves permissions, appoint a Super Admin or override the Man of God's authority. Role changes and revocations take effect immediately. Record grants, changes, revocations and sensitive actions in an audit log.

## 3. Church-wide meetings

- Man of God and explicitly authorised meeting hosts can create meetings with title, description, type, date and start time.
- Meeting lifecycle: Scheduled, Live, Ended, Cancelled.
- Hosts can start/end, cancel and reschedule meetings subject to permissions.
- Notify registered members about relevant meeting events; support in-app notification history and browser push where permission is granted.
- Preserve meeting history, host identity and actual start/end timestamps.
- Do not present a static meeting screen as a working audio/video call. Integrate a genuine conferencing provider before advertising live audio/video.

## 4. Accurate live attendance

For meetings delivered through a real conferencing provider, record:
- Actual participant identity
- Exact join and leave timestamps
- Multiple join/leave sessions (rejoins)
- Total connected duration per member
- Live participant list/count
- Meeting-level attendance reports and export

Attendance must be driven by trusted provider presence events/webhooks. Do not infer attendance from opening the app, viewing a meeting page or client-side timers. Clearly distinguish unavailable attendance data from zero attendance.

## 5. Church-wide announcements and notifications

- Authorised users can send a titled message to all registered members.
- Keep a persistent announcement/notification history with sender, creation time and delivery status where available.
- Support in-app notifications and web push where users have granted permission.
- Do not claim a push notification was delivered merely because a send request was accepted.

## 6. Cell group system

Continue the existing cell-group foundations:
- Create groups with name and description; submit for approval.
- Manage leaders and moderators with server-enforced permissions.
- Schedule meetings and notify group members/leaders.
- Member invitations with expiry and authenticated joining.
- Shared media, prayer rooms and prayer requests.
- Record prayer support, attendance, growth updates and mentorship pairings.
- Notify the Man of God of new group submissions and log relevant actions once the authorised Super Admin identity and approval workflow are configured.
- Provide genuine group analytics and growth tracking from persisted records.

## 7. Security and privacy

- Enforce every role and permission on the backend.
- Validate ownership and membership for all group and meeting resources.
- Protect member attendance, prayer and spiritual-growth records from unauthorised access.
- Keep a tamper-resistant or append-only audit trail for privileged changes.
- Avoid hardcoded privileged account emails, demo data, fake counts or mock notifications.
- Use secure secrets/configuration; never commit credentials or service-role keys.

## 8. Delivery and acceptance

A feature is complete only after:
1. Backend implementation and authorization checks are in place.
2. UI states and error/empty states are implemented.
3. Database persistence is verified.
4. Two or more real accounts have tested the relevant roles.
5. Mobile and desktop flows are checked.
6. Notification/presence integrations are tested against their actual providers.
7. Deployment and post-deployment health checks succeed.

## 9. Hosting constraint

The app depends on backend routes, authentication, database, storage, notifications and realtime subscriptions. GitHub is the source repository, not the runtime host. GitHub Pages alone cannot run these backend services. Deploy the complete application to a backend-capable host and keep its secrets out of Git.
