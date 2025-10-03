public class AccessModifiersNonSubClassDifferentFile {
    public static void main(String[] args) {
        AccessModifiersSameClass obj = new AccessModifiersSameClass();

        // obj.privateMethod();  
        // obj.defaultMethod();  
        // obj.protectedMethod();
        obj.publicMethod();      
    }
}
