class Tool {
    private String privateField = "Private";
    protected String protectedField = "Protected";
    public String publicField = "Public";
    public String getPrivateField() {
        return privateField;
    }
}

class Hammer extends Tool {
    public void testAccess() {
        System.out.println(protectedField);
        System.out.println(publicField);
        System.out.println(getPrivateField());
    }
    public static void main(String[] args) {
        Hammer h = new Hammer();
        h.testAccess();
    }
}
