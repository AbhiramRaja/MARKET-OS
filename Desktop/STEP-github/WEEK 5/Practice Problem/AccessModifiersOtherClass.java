public class AccessModifiersOtherClass {
    public static void main(String[] args) {
        AccessModifiersSameClass obj = new AccessModifiersSameClass();

        // obj.privateMethod(); // ❌ not accessible
        obj.defaultMethod();    // ✅ accessible
        obj.protectedMethod();  // ✅ accessible
        obj.publicMethod();     // ✅ accessible
    }
}
