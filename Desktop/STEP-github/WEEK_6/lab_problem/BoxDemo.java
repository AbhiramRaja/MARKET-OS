package lab_problem;

public class BoxDemo {
    public static void main(String[] args) {
        GiftBox g = new GiftBox();
        g.pack();
        g.unpack();
    }
}

class Box {
    public void pack() {
        System.out.println("Box packed");
    }
    public void unpack() {
        System.out.println("Box unpacked");
    }
}

class GiftBox extends Box {
    @Override
    public void pack() {
        super.pack();
        System.out.println("Gift wrap added");
    }
    @Override
    public void unpack() {
        super.unpack();
        System.out.println("Gift revealed");
    }
}
