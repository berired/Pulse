# Messaging Security Feature Implementation - Message Request System

## Overview
This implementation adds a Facebook Messenger-like message request system to Pulse, requiring users to accept/decline messages from non-mutual users before full communication is established.

## Key Features
✅ Send message requests to non-following users
✅ Accept/Decline individual message requests (Direct Messages)
✅ Group chat invites with Accept/Delete buttons
✅ Real-time notifications via Pusher
✅ RLS-secured database operations
✅ Mobile-responsive UI matching reference design

## Database Changes

### New Tables
1. **direct_message_requests**
   - Tracks pending, accepted, or declined DM requests
   - Unique constraint on (sender_id, receiver_id)
   - Indexes for efficient filtering

2. **cohort_member_requests**
   - Tracks group chat invitations
   - Auto-adds user to cohort_members on accept
   - Unique constraint on (cohort_id, user_id)

### Modified Tables
- **direct_messages**: Added `status`, `is_request`, `responded_at` columns

## API Endpoints

### Direct Message Requests
```
POST   /api/messages/:userId/request
GET    /api/messages/requests/pending
PATCH  /api/messages/requests/:requestId/respond
```

### Group Chat Invites
```
POST   /api/messages/:userId/group-invite
GET    /api/messages/group-invites/pending
PATCH  /api/messages/group-invites/:inviteId/respond
```

## Frontend Components

### Component Hierarchy
```
Messaging.jsx
├── MessageRequestsList
│   ├── MessageRequestNotice (multiple)
│   └── Handles accept/decline logic
├── GroupInvitesList
│   ├── GroupInviteNotice (multiple)
│   └── Handles accept/decline logic
└── DirectMessageThread
    ├── Shows message request notice (if pending)
    └── Conditionally shows message input
```

## Implementation Files

### Backend
- `backend/migrations/008_message_request_system.sql` - Database schema
- `backend/controllers/messagesController.js` - New handlers (+150+ lines)
- `backend/routes/messages.js` - New routes

### Frontend
- `src/components/MessageRequestNotice.jsx` - DM request UI
- `src/components/MessageRequestNotice.css` - Styling
- `src/components/MessageRequestsList.jsx` - List manager
- `src/components/MessageRequestsList.css` - Styling
- `src/components/GroupInviteNotice.jsx` - Group invite UI
- `src/components/GroupInviteNotice.css` - Styling
- `src/components/GroupInvitesList.jsx` - List manager
- `src/components/GroupInvitesList.css` - Styling
- `src/components/DirectMessageThread.jsx` - Updated to handle requests
- `src/components/DirectMessageThread.css` - Updated with new styles
- `src/pages/Messaging.jsx` - Integrated request lists

## Usage Workflows

### Scenario 1: User A (Follower) → User B (Not Follower)
1. User A clicks "Start Conversation" and selects User B
2. Message sent as **pending request**
3. User B receives message request notification in Messaging page
4. User B clicks Accept button → conversation opens normally
5. Both users can now message freely

### Scenario 2: Group Chat Invitation
1. Group member User A invites User B (non-member)
2. User B sees pending group invite with Accept/Delete buttons
3. User B clicks Accept → automatically added to group
4. User B can now see group messages and participate

### Scenario 3: Declining Request
1. User receives message/group request
2. User clicks Delete button
3. Request is marked as declined
4. User cannot see messages from that sender (unless re-invited)

## Visual Design Features

### Message Request Notice
- User avatar (56x56px with border)
- Username and bio
- "Wants to send you a message" label
- Accept button (green, with checkmark icon)
- Delete button (red, with trash icon)
- Card-based layout with gradient background

### Group Invite Notice
- Group icon (emoji-based)
- Group name and description
- Inviter avatar and name
- "Invited you to join" text
- Accept/Delete buttons (same styling as DM requests)
- Additional "Group Invite" badge

## Security Considerations

1. **RLS Policies**: All request tables have strict RLS
   - Users can only see their own requests
   - Only receivers can respond to DM requests
   - Only invitees can respond to group invites

2. **Validation**:
   - Duplicate prevention via unique constraints
   - Receiver existence checks
   - Permission verification before operations

3. **One-time Response**: Requests can only be responded to once

## Real-time Updates

- Pusher channels for instant notifications:
  - `message-requests-{userId}` - New DM requests
  - `group-invites-{userId}` - New group invites
  - Events trigger UI refreshes automatically

## Testing Checklist

- [ ] Create two test users (non-followers)
- [ ] Test sending message request → should show pending notice
- [ ] Test accepting request → should open conversation
- [ ] Test declining request → should remove notice
- [ ] Test group invite with non-member
- [ ] Test accepting group invite → verify in cohort_members table
- [ ] Test declining group invite → verify request deleted
- [ ] Test mobile responsiveness
- [ ] Test real-time updates with Pusher
- [ ] Verify RLS policies prevent unauthorized access

## Migration Guide

### Run Migration
```bash
# Apply the new migration
psql -h {host} -U {user} -d {database} < backend/migrations/008_message_request_system.sql
```

### Environment Setup
No new environment variables needed. Uses existing Supabase and Pusher configs.

### Testing in Development
1. Run backend: `npm run dev` in `/backend`
2. Run frontend: `npm run dev` in root
3. Create test users via signup
4. Test workflows using the messaging interface

## Future Enhancements

- Add message request notification badge counter
- Implement request expiration (auto-decline after 30 days)
- Add block functionality alongside decline
- Show request history/audit trail
- Batch accept multiple requests
- Request templates/quick replies
