# Security Specification: Shared Visitor Comments (`/reviews` & `/reviewProofs`)

## 1. Data Invariants
1. Every document in `/reviews/{reviewId}` must have `nama`, `asal`, `destinasi`, `rating` (int 1..5), `tanggal`, `komentar` (5..1000 chars), `rekomendasi` (bool), `helpfulCount` (int >= 0), `editTokenHash` (64-char SHA-256 lowercase hex), and server-generated `createdAt == request.time`.
2. `editTokenHash` and `createdAt` are immutable after creation.
3. Unauthenticated visitors can read public reviews (`allow get`, `allow list`) and create new reviews (`allow create` with `helpfulCount == 0` and valid schema), plus increment `helpfulCount` by exact `+1`.
4. Updating review content (`nama`, `asal`, `destinasi`, `rating`, `komentar`, `rekomendasi`, `editedAt`, `updatedAt`) or deleting a review (`allow delete`) is **strictly blocked** unless the caller atomically writes a matching plaintext `token` to `/reviewProofs/{reviewId}` whose `hashing.sha256(token.toUtf8()).toHexString().lower()` equals `resource.data.editTokenHash`.
5. `/reviewProofs/{reviewId}` has `allow read: if false;` so secret author tokens written during edit/delete can never be read by any client.

## 2. Adversarial ("Dirty Dozen") Payloads Verified Blocked
1. **Shadow/Ghost Field on Create**: `{ ..., isAdmin: true }` -> `PERMISSION_DENIED` (`hasOnly` check).
2. **Oversized ID Poisoning**: `/reviews/<130 chars>` or invalid symbols -> `PERMISSION_DENIED` (`isValidId`).
3. **Blank/Oversized `komentar`**: `komentar` < 5 chars or > 1000 chars -> `PERMISSION_DENIED`.
4. **Out-of-range `rating`**: `rating: 99` or `rating: 0` or `"5"` -> `PERMISSION_DENIED`.
5. **Pre-inflated `helpfulCount` on Create**: `helpfulCount: 500` -> `PERMISSION_DENIED` (`== 0` enforced).
6. **Spoofed `createdAt` on Create**: Client timestamp instead of `request.time` -> `PERMISSION_DENIED`.
7. **Unauthorized Edit without `/reviewProofs` batch write**: `update` changing `komentar` without proof -> `PERMISSION_DENIED`.
8. **Wrong Token Proof on Edit**: `/reviewProofs/{id}` written with wrong `token` -> `PERMISSION_DENIED`.
9. **Unauthorized Delete without `/reviewProofs` batch write**: `deleteDoc` alone -> `PERMISSION_DENIED`.
10. **Mutating `editTokenHash` on Update**: Attempting to replace `editTokenHash` -> `PERMISSION_DENIED`.
11. **Arbitrary `helpfulCount` Jump**: Updating `helpfulCount` from `2` to `100` -> `PERMISSION_DENIED` (only `existing().helpfulCount + 1` allowed).
12. **Reading Secret Proof Collection**: `getDoc` or `getDocs` on `/reviewProofs` -> `PERMISSION_DENIED` (`allow read: if false`).
