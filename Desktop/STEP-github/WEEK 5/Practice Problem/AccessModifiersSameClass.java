
public class AccessModifiersSameClass {
    private int privateVar = 10;
    int defaultVar = 20;
    protected int protectedVar = 30;
    public int publicVar = 40;

    private void privateMethod() {
        System.out.println("Private: " + privateVar);
    }
    void defaultMethod() {
        System.out.println("Default: " + defaultVar);
    }
    protected void protectedMethod() {
        System.out.println("Protected: " + protectedVar);
    }
    public void publicMethod() {
        System.out.println("Public: " + publicVar);
    }

    public static void main(String[] args) {
        AccessModifiersSameClass obj = new AccessModifiersSameClass();
        obj.privateMethod();
        obj.defaultMethod();
        obj.protectedMethod();
        obj.publicMethod();
    }
}
