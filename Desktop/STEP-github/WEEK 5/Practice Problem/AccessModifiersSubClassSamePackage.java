public class AccessModifiersSubClassSamePackage extends AccessModifiersSameClass {
    public static void main(String[] args) {
        AccessModifiersSubClassSamePackage obj = new AccessModifiersSubClassSamePackage();

        // obj.privateMethod(); // ❌ not accessible
        obj.defaultMethod();    // ✅ accessible
        obj.protectedMethod();  // ✅ accessible
        obj.publicMethod();     // ✅ accessible
    }
}
