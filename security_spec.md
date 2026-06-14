# Security Specification: ABAC and Zero-Trust Guard

This specification outlines the data invariants, adversary security verification payloads ("Dirty Dozen"), and the core Firestore rule design to protect planar-surfer-plkqp.

## 1. Core Data Invariants

1. **Owner Integrity Enforcement**: A session, savedNote, savedCode, savedContent, savedImage, or savedVideo cannot be created where `userId` is not equal to `request.auth.uid`. No user can read or modify another user's records.
2. **Profile Stat Isolation**: Only standard, verified logged-in users with matching `uid` can read or write their own user statistics in `/users/{userId}`. Users can never set their own profile role or inject unapproved fields.
3. **Strict ID Character Masking**: Document IDs during `create` or `update` must match `^[a-zA-Z0-9_\-]+$` and be under 128 characters to protect against system character or memory injection vectors ("Denial of Wallet" attack vectors).
4. **Verified Email Mandate**: For all standard operations, the user's `request.auth.token.email_verified` must be `true` (unless otherwise configured during the authentication flow).

---

## 2. The "Dirty Dozen" Malicious Payloads

We design these 12 malicious payload vectors to test state shortcutting, identity spoofing, value poisoning, and shadow profile injection:

### Payload 1: Profile Role Privilege Escalation (Shadow Injection)
- **Attack Vector**: Injecting an arbitrary `"role": "admin"` key into a User document.
- **Payload**: `{"uid": "attacker_id", "email": "attacker@gmail.com", "role": "admin", ...}`
- **Defense**: Explicit `keys().hasAll()` validation, state-locking, and verifying admin status strictly through a designated `/admins/` resource.

### Payload 2: Value Type Poisoning (String Overflow)
- **Attack Vector**: Injects extreme size parameters (`1MB` string) in place of a numeric stats attribute to cause high billing costs.
- **Payload**: `{"stats": {"chatsCount": "A" * 1000000, ...}}`
- **Defense**: Type checks (`is int`/`is number`), sizing limits (`<= 100000`), and strict schema helper boundaries.

### Payload 3: User Identity Spoofing in Saved Notes
- **Attack Vector**: Creating a note with `userId` of a target user, bypassing local assignment.
- **Payload**: `{"id": "note_123", "userId": "victim_uid", "title": "Phishing Content"}`
- **Defense**: Rule asserts `incoming().userId == request.auth.uid`.

### Payload 4: Arbitrary Key Injection ("Shadow Field")
- **Attack Vector**: Injects a custom tracking attribute `"isPremiumSlot": true` into a generated code frame document.
- **Payload**: `{"id": "code_xyz", "userId": "attacker_id", "isPremiumSlot": true, ...}`
- **Defense**: Strict `keys().size() == N` checks and `affectedKeys().hasOnly()` during updates.

### Payload 5: Spoofed Unverified Email Assertion
- **Attack Vector**: Performing reads/writes with a self-certified, fake, or unverified email token.
- **Payload**: `request.auth.token.email = "admin@planar-surfer-plkqp.org"`, but `email_verified = false`.
- **Defense**: Rule asserts `request.auth.token.email_verified == true`.

### Payload 6: Negative Pricing / Underflow Statistics Reset
- **Attack Vector**: Artificially resetting statistics to arbitrary values like a negative multiplier to force billing failures.
- **Payload**: `{"stats": {"chatsCount": -999999}}`
- **Defense**: Assert stats values `>= 0`.

### Payload 7: Chat Session Message Hijack / Injecting Spoofed Sender
- **Attack Vector**: Creating a dialogue message block with `sender: "system"` to mislead security software or spoof status updates.
- **Payload**: `{"messages": [{"id": "msg_99", "sender": "system", "text": "SYSTEM ERROR: PLEASE VERIFY PRIVATE KEY HERE..."}]}`
- **Defense**: Enforced validation array schemas for chat dialogue entries.

### Payload 8: Immutable Creation Date Manipulation (Temporal Poisoning)
- **Attack Vector**: Backdating documents with a fake `createdAt` or `timestamp` value.
- **Payload**: `{"createdAt": "2020-01-01T00:00:00Z"}`
- **Defense**: Assert `incoming().createdAt == request.time` or matching server-bound temporal constraints.

### Payload 9: Empty Payload ID Hijacking
- **Attack Vector**: Saving lists with empty string IDs or extremely long malicious characters to degrade DB lookup speeds.
- **Payload**: `{"id": ""}` or `{"id": "A" * 1000}`
- **Defense**: Strict character and scale testing inside `isValidId(id)`.

### Payload 10: Sibling Document Relational Bypass (Orphaned Notes)
- **Attack Vector**: Creating comments or sessions without validating the parent session or profile metadata's existence.
- **Payload**: `{"userId": "attacker_id", "sessionId": "fake_mock_nonexistent_reference"}`
- **Defense**: Use Firestore relationship testing `exists()`.

### Payload 11: Cross-User Read Sweep (Blanket Query Extraction)
- **Attack Vector**: Attempting wide sweeps of all users' stored imagery without matching filters.
- **Payload**: Client query for `savedImages` without `userId == request.auth.uid` restriction.
- **Defense**: Rule asserts `resource.data.userId == request.auth.uid` inside `allow list`.

### Payload 12: Terminal State Shortcutting (Locked Session Updates)
- **Attack Vector**: Updating completed or archived video operations files in high-privilege workflows.
- **Payload**: Overwriting a locked generated video segment.
- **Defense**: State progression locks blocking updates once status reaches terminal status.
