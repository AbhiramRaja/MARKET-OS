public class SmartDevice {
    private String deviceName;
    private String location;
    private boolean isOnline;
    private double powerConsumption;
    private String[] connectedDevices;
    private int connectionCount;

    // Constructor with parameter names matching field names
    public SmartDevice(String deviceName, String location, boolean isOnline, double powerConsumption) {
        this.deviceName = deviceName;  // 'this' to distinguish field from parameter
        this.location = location;
        this.isOnline = isOnline;
        this.powerConsumption = powerConsumption;
        this.connectedDevices = new String[5]; // Initialize connected devices array with size 5
        this.connectionCount = 0;
    }

    // Method using 'this' for parameter disambiguation
    public void updateLocation(String location) {
        this.location = location;  // Use 'this' to assign value to the field
        System.out.println(this.deviceName + " moved to " + this.location);
    }

    // Method returning 'this' for method chaining
    public SmartDevice setOnline(boolean isOnline) {
        this.isOnline = isOnline;
        return this;  // Enable method chaining
    }

    public SmartDevice connectToDevice(String deviceName) {
        if (this.connectionCount < this.connectedDevices.length) {
            this.connectedDevices[this.connectionCount] = deviceName;
            this.connectionCount++;
            System.out.println(this.deviceName + " connected to " + deviceName);
        }
        return this;  // Enable method chaining
    }

    // Display device info
    public void displayDeviceInfo() {
        System.out.println("\n=== " + this.deviceName + " INFO ===");
        System.out.println("Location: " + this.location);
        System.out.println("Status: " + (this.isOnline ? "Online" : "Offline"));
        System.out.println("Power Consumption: " + this.powerConsumption + "W");
        System.out.println("Connections: " + this.connectionCount);
        for (int i = 0; i < this.connectionCount; i++) {
            System.out.println(" -> " + this.connectedDevices[i]);
        }
    }

    // Method that calls other methods using 'this'
    public void performInitialSetup() {
        this.setOnline(true);  // Using this to call other methods
        System.out.println(this.deviceName + " initial setup completed");
    }

    public static void main(String[] args) {
        System.out.println("=== SMART HOME DEVICE NETWORK ===");

        // Create devices with parameter names matching field names
        SmartDevice device1 = new SmartDevice("Living Room Light", "Living Room", false, 15.5);
        SmartDevice device2 = new SmartDevice("Kitchen Thermostat", "Kitchen", true, 8.0);

        // Test method chaining
        device1.setOnline(true).connectToDevice("Smart Hub").connectToDevice("Voice Assistant");
        device2.setOnline(true).connectToDevice("Smart Hub");

        // Display device information
        device1.displayDeviceInfo();
        device2.displayDeviceInfo();

        // Show parameter disambiguation scenarios
        device1.updateLocation("Hallway");
        device2.updateLocation("Garage");

        // Perform initial setup for both devices
        device1.performInitialSetup();
        device2.performInitialSetup();
    }
}
