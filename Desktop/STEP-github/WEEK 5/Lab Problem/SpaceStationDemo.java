import java.util.*;

final class SecurityClearance {
    private final String clearanceId,level;
    private final String[] authorizedSections;
    private final long expirationDate;
    public SecurityClearance(String id,String level,String[] sections,long exp) {
        if(id==null||level==null||sections==null||exp<=0) throw new IllegalArgumentException();
        this.clearanceId=id;
        this.level=level;
        this.authorizedSections=Arrays.copyOf(sections,sections.length);
        this.expirationDate=exp;
    }
    public String getClearanceId(){return clearanceId;}
    public String getLevel(){return level;}
    public String[] getAuthorizedSections(){return Arrays.copyOf(authorizedSections,authorizedSections.length);}
    public long getExpirationDate(){return expirationDate;}
    public final boolean canAccess(String s){return Arrays.asList(authorizedSections).contains(s);}
    public final boolean isExpired(){return System.currentTimeMillis()>expirationDate;}
    public final int getAccessHash(){return Objects.hash(level,Arrays.toString(authorizedSections));}
}

final class CrewRank {
    private final String rankName;
    private final int level;
    private final String[] permissions;
    private CrewRank(String r,int l,String[] p){rankName=r;level=l;permissions=Arrays.copyOf(p,p.length);}
    public static CrewRank createCadet(){return new CrewRank("Cadet",1,new String[]{"train"});}
    public static CrewRank createOfficer(){return new CrewRank("Officer",2,new String[]{"command"});}
    public static CrewRank createCommander(){return new CrewRank("Commander",3,new String[]{"lead"});}
    public static CrewRank createCaptain(){return new CrewRank("Captain",4,new String[]{"navigate"});}
    public static CrewRank createAdmiral(){return new CrewRank("Admiral",5,new String[]{"all"});}
    public String getRankName(){return rankName;}
    public int getLevel(){return level;}
    public String[] getPermissions(){return Arrays.copyOf(permissions,permissions.length);}
}

class SpaceCrew {
    private final String crewId,homeplanet;
    private final SecurityClearance clearance;
    private final CrewRank initialRank;
    private CrewRank currentRank;
    private int missionCount;
    private double spaceHours;
    public static final String STATION_NAME="Stellar Odyssey";
    public static final int MAX_CREW_CAPACITY=50;
    public SpaceCrew(String id,String planet,SecurityClearance c,CrewRank r){
        crewId=id;homeplanet=planet;clearance=c;initialRank=r;currentRank=r;
    }
    public String getCrewId(){return crewId;}
    public String getHomeplanet(){return homeplanet;}
    public SecurityClearance getClearance(){return clearance;}
    public CrewRank getInitialRank(){return initialRank;}
    public CrewRank getCurrentRank(){return currentRank;}
    public void setCurrentRank(CrewRank r){currentRank=r;}
    public int getMissionCount(){return missionCount;}
    public void setMissionCount(int c){if(c>=0)missionCount=c;}
    public double getSpaceHours(){return spaceHours;}
    public void setSpaceHours(double h){if(h>=0)spaceHours=h;}
    private boolean canAccessSection(String s){return clearance.canAccess(s);}
    public final String getCrewIdentification(){return crewId+"-"+initialRank.getRankName();}
    public final boolean canBePromoted(){return currentRank.getLevel()<5;}
    public final int calculateSecurityRating(){return clearance.getAccessHash()+currentRank.getLevel();}
}

public class SpaceStationDemo {
    public static void main(String[] args) {
        SecurityClearance sc=new SecurityClearance("C1","High",new String[]{"Bridge","Lab"},System.currentTimeMillis()+100000);
        CrewRank r=CrewRank.createOfficer();
        SpaceCrew crew=new SpaceCrew("CR123","Earth",sc,r);
        crew.setMissionCount(5);
        crew.setSpaceHours(120.5);
        System.out.println(crew.getCrewIdentification());
        System.out.println(crew.calculateSecurityRating());
    }
}
