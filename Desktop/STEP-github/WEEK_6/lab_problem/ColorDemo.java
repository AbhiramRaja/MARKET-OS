package lab_problem;

public class ColorDemo {
    public static void main(String[] args) {
        RedColor r = new RedColor("Red", 90, "Dark Red");
    }
}

class Color {
    protected String name;
    public Color(String name) {
        this.name = name;
        System.out.println("Color: " + name);
    }
}

class PrimaryColor extends Color {
    protected int intensity;
    public PrimaryColor(String name, int intensity) {
        super(name);
        this.intensity = intensity;
        System.out.println("PrimaryColor intensity: " + intensity);
    }
}

class RedColor extends PrimaryColor {
    protected String shade;
    public RedColor(String name, int intensity, String shade) {
        super(name, intensity);
        this.shade = shade;
        System.out.println("RedColor shade: " + shade);
    }
}
