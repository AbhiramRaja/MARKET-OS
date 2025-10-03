public class AccessModifiersSubClassDifferentFile extends AccessModifiersSameClass {
    public static void main(String[] args) {
        AccessModifiersSubClassDifferentFile obj = new AccessModifiersSubClassDifferentFile();

        obj.protectedMethod();    
        obj.publicMethod();      
    }
}
