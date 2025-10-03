package lab_problem;

public class InstrumentDemo {
    public static void main(String[] args) {
        Instrument[] arr = { new Piano("Piano", "Wood", 88), new Guitar("Guitar", "Wood", 6), new Drum("Drum", "Metal", "Bass") };
        for (Instrument i : arr) {
            i.play();
        }
    }
}

class Instrument {
    protected String name;
    protected String material;
    public Instrument(String name, String material) {
        this.name = name;
        this.material = material;
    }
    public void play() {
        System.out.println(name + " is playing");
    }
}

class Piano extends Instrument {
    private int keys;
    public Piano(String name, String material, int keys) {
        super(name, material);
        this.keys = keys;
    }
}

class Guitar extends Instrument {
    private int strings;
    public Guitar(String name, String material, int strings) {
        super(name, material);
        this.strings = strings;
    }
}

class Drum extends Instrument {
    private String type;
    public Drum(String name, String material, String type) {
        super(name, material);
        this.type = type;
    }
}
