public class GameController {
    private String controllerBrand;
    private String connectionType;
    private boolean hasVibration;
    private int batteryLevel;
    private double sensitivity;

    // Default constructor
    public GameController() {
        this.controllerBrand = "GenericPad";
        this.connectionType = "USB";
        this.hasVibration = true;
        this.batteryLevel = 100;
        this.sensitivity = 1.0;
    }

    // Parameterized constructor for custom configuration
    public GameController(String controllerBrand, String connectionType, boolean hasVibration, int batteryLevel, double sensitivity) {
        this.controllerBrand = controllerBrand;
        this.connectionType = connectionType;
        this.hasVibration = hasVibration;
        // Ensure valid battery level
        this.batteryLevel = (batteryLevel >= 0 && batteryLevel <= 100) ? batteryLevel : 100;
        // Ensure valid sensitivity
        this.sensitivity = (sensitivity >= 0.1 && sensitivity <= 3.0) ? sensitivity : 1.0;
    }

    // Two-parameter convenience constructor
    public GameController(String brand, String connectionType) {
        this(brand, connectionType, true, 100, 1.0);
    }

    // Calibrate controller
    public void calibrateController() {
        System.out.println("Calibrating " + controllerBrand + " controller...");
    }

    // Display configuration
    public void displayConfiguration() {
        System.out.println("Controller Brand: " + controllerBrand);
        System.out.println("Connection Type: " + connectionType);
        System.out.println("Vibration: " + (hasVibration ? "Enabled" : "Disabled"));
        System.out.println("Battery Level: " + batteryLevel + "%");
        System.out.println("Sensitivity: " + sensitivity);
    }

    // Test vibration
    public void testVibration() {
        if (hasVibration) {
            System.out.println("*BUZZ* Vibration test successful!");
        } else {
            System.out.println("Vibration disabled on this controller.");
        }
    }

    public static void main(String[] args) {
        // Create controller with default constructor
        GameController controller1 = new GameController();
        // Create controller with full parameterized constructor
        GameController controller2 = new GameController("XtremePad", "Bluetooth", true, 80, 2.5);
        // Create controller with convenience constructor
        GameController controller3 = new GameController("TurboPad", "Wireless");

        // Test all methods on each controller
        controller1.displayConfiguration();
        controller1.testVibration();
        controller1.calibrateController();

        System.out.println();

        controller2.displayConfiguration();
        controller2.testVibration();
        controller2.calibrateController();

        System.out.println();

        controller3.displayConfiguration();
        controller3.testVibration();
        controller3.calibrateController();
    }
}
