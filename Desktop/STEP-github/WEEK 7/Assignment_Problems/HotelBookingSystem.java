public class HotelBookingSystem {
    public void book(String roomType, int nights) {
        double price = nights * 100;
        System.out.println("Standard booking: " + roomType + " for " + nights + " nights. Total: $" + price);
    }
    public void book(String roomType, int nights, double seasonalMultiplier) {
        double base = nights * 100;
        double total = base * seasonalMultiplier;
        System.out.println("Seasonal booking: " + roomType + " for " + nights + " nights. Multiplier: " + seasonalMultiplier + " Total: $" + total);
    }
    public void book(String roomType, int nights, double discount, boolean mealPackage) {
        double base = nights * 100;
        double discountAmount = base * discount;
        double mealCost = mealPackage ? 50 * nights : 0;
        double total = base - discountAmount + mealCost;
        System.out.println("Corporate booking: " + roomType + " for " + nights + " nights. Discount: $" + discountAmount + " Meals: $" + mealCost + " Total: $" + total);
    }
    public void book(String roomType, int nights, int guests, double decorationFee, double cateringCost) {
        double base = nights * 200;
        double total = base + decorationFee + cateringCost * guests;
        System.out.println("Wedding booking: " + roomType + " for " + nights + " nights with " + guests + " guests. Total: $" + total);
    }
    public static void main(String[] args) {
        HotelBookingSystem h = new HotelBookingSystem();
        h.book("Deluxe", 3);
        h.book("Suite", 2, 1.5);
        h.book("Executive", 5, 0.2, true);
        h.book("Banquet Hall", 1, 100, 500, 30);
    }
}
