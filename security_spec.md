# Security Specification for CampusAI.ng

## Data Invariants
1. A user can only read and write their own profile (`/users/{userId}`).
2. News (`/news`) can only be written by admins. Anyone can read.
3. Comments (`/comments`) can be created by any signed-in user, but only modified/deleted by the author or an admin.
4. Billboard ads (`/billboard`) can be submitted (`pending`) by users, but only approved (`active`) by admins.
5. Global settings (`/settings`) are read-only for public, write-only for admins.
6. Feedback is write-only for everyone, read-only for admins.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to update another user's profile with a malicious UID.
2. **Shadow Update**: Attempt to inject `is_premium: true` into a standard user profile.
3. **Escalation**: Attempt to set `role: 'Admin'` via the client SDK.
4. **State Shortcutting**: Attempt to post a billboard ad directly with `status: 'active'`.
5. **Orphaned Writes**: Attempt to post a comment to a non-existent news item.
6. **Denial of Wallet**: Attempt to inject a 1MB string into a feedback message.
7. **Recursive Cost Attack**: Attempt to query all user profiles without a filter.
8. **PII Leak**: Attempt to read the `private` profile data of another user.
9. **Timestamp Spoof**: Attempt to manually set `createdAt` to a future date.
10. **Admin Portal Breach**: Attempt to write to `/settings/global` as a non-admin.
11. **Subscriber Hijack**: Attempt to overwrite another user's email in `/subscribers`.
12. **Chat Log Tamper**: Attempt to delete another user's chat history.

## Test Runner (Draft)
A separate test suite will be generated to verify these payloads are blocked.
