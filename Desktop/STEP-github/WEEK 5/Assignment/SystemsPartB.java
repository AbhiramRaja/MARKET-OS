import java.util.*;

class Product {
    private String name;
    private double price;

    Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public String getName() { return name; }
    public double getPrice() { return price; }
}

class Customer {
    private String name;
    private String email;

    Customer(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String getName() { return name; }
    public String getEmail() { return email; }
}

class ShoppingCart {
    private List<Product> products = new ArrayList<>();

    public void addProduct(Product p) { products.add(p); }
    public double getTotalAmount() {
        return products.stream().mapToDouble(Product::getPrice).sum();
    }
}

class ECommerceSystem {
    private List<Product> productCatalog = new ArrayList<>();

    public void addProduct(Product p) { productCatalog.add(p); }
    public List<Product> getProductCatalog() { return productCatalog; }
}

public class SystemsPartB {
    public static void main(String[] args) {
        Product p1 = new Product("Laptop", 50000);
        Product p2 = new Product("Mouse", 500);
        Customer c = new Customer("Alice", "alice@email.com");

        ShoppingCart cart = new ShoppingCart();
        cart.addProduct(p1);
        cart.addProduct(p2);

        ECommerceSystem system = new ECommerceSystem();
        system.addProduct(p1);
        system.addProduct(p2);

        System.out.println("Customer: " + c.getName());
        System.out.println("Cart Total: ₹" + cart.getTotalAmount());
    }
}
