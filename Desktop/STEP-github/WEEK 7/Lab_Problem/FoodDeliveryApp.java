class FoodDelivery {
    void calculate(int distance) {
        System.out.println("Basic Delivery: " + (distance * 10));
    }
    void calculate(int distance, int priorityFee) {
        System.out.println("Premium Delivery: " + (distance * 10 + priorityFee));
    }
    void calculate(int distance, int orders, double discountPerOrder) {
        double total = distance * 10 - orders * discountPerOrder;
        System.out.println("Group Delivery: " + total);
    }
    void calculate(int distance, double discountPercent, double totalAmount) {
        double cost = distance * 10;
        if (totalAmount > 500) cost = 0;
        else cost = cost - (cost * discountPercent / 100);
        System.out.println("Festival Delivery: " + cost);
    }
    public static void main(String[] args) {
        FoodDelivery f = new FoodDelivery();
        f.calculate(5);
        f.calculate(5, 20);
        f.calculate(5, 3, 5);
        f.calculate(5, 10, 600);
    }
}
