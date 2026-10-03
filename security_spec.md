# Security Specification: Financial Statement Analyzer

## 1. Data Invariants
1. A user can only read, create, and modify their own `/users/{userId}` profile document (`request.auth.uid == userId`).
2. A user can only access and write their own subcollection documents under `/users/{userId}/*` (Analyses, Preferences).
3. Cross-user reading and cross-user writing are strictly forbidden.
4. Anonymous write access is disabled; verified authentication is required.
5. All document IDs must conform to `^[a-zA-Z0-9_\-]+$` and be under 128 characters.
6. The default rule denies all paths unless explicitly matched.

## 2. The "Dirty Dozen" Payloads (Must be rejected)
1. **Unauthenticated Read**: Anonymous user reading `/users/alice`.
2. **Unauthenticated Write**: Anonymous user creating `/users/alice`.
3. **Cross-User Profile Hijack**: Authenticated user Bob attempting to write `/users/alice`.
4. **Cross-User Profile Read**: Authenticated user Bob attempting to read `/users/alice`.
5. **Cross-User Analysis Creation**: Bob creating `/users/alice/analyses/model1`.
6. **Cross-User Analysis Modification**: Bob modifying `/users/alice/analyses/model1`.
7. **Cross-User Analysis Deletion**: Bob deleting `/users/alice/analyses/model1`.
8. **Shadow Field Injection**: Writing an undeclared property (e.g., `isAdmin: true` or `role: 'superuser'`).
9. **ID Poisoning Attack**: Document ID with 2KB payload or malicious URL chars.
10. **Identity Spoofing**: In `/users/bob/analyses/1`, setting `userId: 'alice'`.
11. **Unbounded String Overflow**: Sending notes with 10MB of text.
12. **Root Catch-All Traversal**: Writing to `/unknown_collection/hack`.
