class Artwork {
    protected String title;
    public Artwork(String title) {
        this.title = title;
    }
    public void display() {
        System.out.println("Artwork: " + title);
    }
}
class Painting extends Artwork {
    public Painting(String title) {
        super(title);
    }
    public void showPalette() {
        System.out.println(title + " has a vibrant color palette");
    }
}
class Sculpture extends Artwork {
    public Sculpture(String title) {
        super(title);
    }
    public void showMaterial() {
        System.out.println(title + " is made of marble");
    }
}
class DigitalArt extends Artwork {
    public DigitalArt(String title) {
        super(title);
    }
    public void showResolution() {
        System.out.println(title + " has 4K resolution");
    }
}
class Photography extends Artwork {
    public Photography(String title) {
        super(title);
    }
    public void showCameraSettings() {
        System.out.println(title + " shot with ISO 100 and f/1.8");
    }
}
public class ArtGallery {
    public static void main(String[] args) {
        Artwork a = new Painting("Mona Lisa");
        a.display();
        if (a instanceof Painting) ((Painting) a).showPalette();
    }
}
