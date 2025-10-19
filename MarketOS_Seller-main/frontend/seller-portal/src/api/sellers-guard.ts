// Temporary guard to avoid /me 404 spam during dev.
// Replace with real implementation once SellerProfile wiring is merged.
export async function getMySellerSafe() {
  return null; // No call -> no 404
}
