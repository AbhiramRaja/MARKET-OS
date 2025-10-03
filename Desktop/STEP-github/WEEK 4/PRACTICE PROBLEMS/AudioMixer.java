public class AudioMixer {
<<<<<<< HEAD
   private String mixerModel;
=======
    private String mixerModel;
>>>>>>> 2209caddce798b08f99fdae7b3126da9fd0a1368
    private int numberOfChannels;
    private boolean hasBluetoothConnectivity;
    private double maxVolumeDecibels;
    private String[] connectedDevices;
    private int deviceCount;

    // No-argument constructor
    public AudioMixer() {
        this("StandardMix-8", 8, false, 120.0); // Chaining to the main constructor
    }

    // Two-parameter constructor
    public AudioMixer(String mixerModel, int numberOfChannels) {
        this(mixerModel, numberOfChannels, false, 120.0); // Chaining to the main constructor
    }

    // Three-parameter constructor
    public AudioMixer(String mixerModel, int numberOfChannels, boolean hasBluetoothConnectivity) {
        this(mixerModel, numberOfChannels, hasBluetoothConnectivity, 120.0); // Chaining to the main constructor
    }

    // Main constructor
    public AudioMixer(String mixerModel, int numberOfChannels, boolean hasBluetoothConnectivity, double maxVolumeDecibels) {
        this.mixerModel = mixerModel;
        this.numberOfChannels = numberOfChannels;
        this.hasBluetoothConnectivity = hasBluetoothConnectivity;
        this.maxVolumeDecibels = maxVolumeDecibels;
        this.connectedDevices = new String[numberOfChannels];
        this.deviceCount = 0;
        System.out.println("AudioMixer constructor executed with model: " + mixerModel);
    }

    // Connect device
    public void connectDevice(String deviceName) {
        if (deviceCount < connectedDevices.length) {
            connectedDevices[deviceCount] = deviceName;
            deviceCount++;
            System.out.println("Connected: " + deviceName);
        } else {
            System.out.println("All channels occupied!");
        }
    }

    // Display mixer status
    public void displayMixerStatus() {
        System.out.println("\n=== " + mixerModel + " STATUS ===");
        System.out.println("Channels: " + numberOfChannels);
        System.out.println("Bluetooth: " + (hasBluetoothConnectivity ? "Enabled" : "Disabled"));
        System.out.println("Max Volume: " + maxVolumeDecibels + " dB");
        System.out.println("Connected Devices: " + deviceCount + "/" + numberOfChannels);
        for (int i = 0; i < deviceCount; i++) {
            System.out.println(" Channel " + (i + 1) + ": " + connectedDevices[i]);
        }
    }

    public static void main(String[] args) {
        // Create mixer using no-argument constructor
        AudioMixer mixer1 = new AudioMixer();
        // Create mixer using two-parameter constructor
        AudioMixer mixer2 = new AudioMixer("DeluxeMix-16", 16);
        // Create mixer using three-parameter constructor
        AudioMixer mixer3 = new AudioMixer("ProMix-12", 12, true);
        // Create mixer using full constructor
        AudioMixer mixer4 = new AudioMixer("StudioMix-24", 24, true, 130.0);

        // Connect devices to each mixer
        mixer1.connectDevice("Microphone");
        mixer2.connectDevice("Guitar");
        mixer3.connectDevice("Drum Set");
        mixer4.connectDevice("Keyboard");

        // Display status of all mixers
        mixer1.displayMixerStatus();
        mixer2.displayMixerStatus();
        mixer3.displayMixerStatus();
        mixer4.displayMixerStatus();
<<<<<<< HEAD
    } 
=======
    }
>>>>>>> 2209caddce798b08f99fdae7b3126da9fd0a1368
}
