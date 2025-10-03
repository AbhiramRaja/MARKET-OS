class LibraryUser {
    void entryLog() { System.out.println("User entry logged."); }
}
class Student extends LibraryUser {
    void borrowBook() { System.out.println("Student borrows a book."); }
    void accessComputer() { System.out.println("Student accesses computer."); }
}
class Faculty extends LibraryUser {
    void reserveBook() { System.out.println("Faculty reserves a book."); }
    void accessResearch() { System.out.println("Faculty accesses research database."); }
}
class Guest extends LibraryUser {
    void browseBooks() { System.out.println("Guest browses books."); }
}
class UniversityLibrarySystem {
    public static void main(String[] args) {
        LibraryUser u1 = new Student();
        LibraryUser u2 = new Faculty();
        LibraryUser u3 = new Guest();
        u1.entryLog();
        u2.entryLog();
        u3.entryLog();
    }
}
