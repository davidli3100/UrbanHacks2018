
public class aaaa {




    public static void main(String[]args){
        pair p1,p2,p3,p4;
        p1 = new pair(-1,-1);
        p2 = new pair(1,1);
        p3 = new pair(1,-1);
        p4 = new pair(-1,1);
        line l1 = new line(p1,p2);
        line l2 = new line(p3,p4);
        System.out.println(l1.getIntersection(l2));
    }

    public static double distFromLine(pair p1, line n){
        
        
        double m = n.getNr();
        pair p1s = new pair(100, 100*m);
        
        
        line l2 = new line(p1,p1s);
        pair p2 = n.getIntersection(l2);
        
        
        
        return 
        
    }

    static class line{
        pair p1, p2;

        public line(pair p1, pair p2){
            this. p1 = p1;
            this. p2 = p2;
        }
        public double getSlope() {
            if (p1.x == p2.x) {
                //close enough to infinity amirite?
                return Double.MAX_VALUE;
            } else {
                return (p1.y - p2.y) / (p1.x - p2.x);
            }
        }
        public double getYInt(){
            double m = getSlope();
            return - m * p1.x;
        }
        
        public double getNr(){
            if(getSlope() == 0){
                return Double.MAX_VALUE;
            }else{
                return -1/getSlope();
            }
        }

        public pair getIntersection(line l){
            double m1 = getSlope();
            double m2 = l.getSlope();
            double b1 = getYInt();
            double b2 = getYInt();
            if(m1 == m2) {
                return null;
            }else{
                double mF = m1 - m2;
                double bF = b1 - b2;
                double xF = -bF/mF;
                double yF = m1*xF + bF;
                return new pair(xF, yF);
            }
        }

    }
    static class pair{
        double x, y;
        public pair(double x, double y){
            this.x = x;
            this.y = y;
        }

        public String toString(){
            return "(" + x + "," + y + ")";
        }
        
        public double dist(pair p){
            
            double x, y;
            x = this.x - p.x;
            y = this.y - p.y;
            
            return Math.sqrt(x*x + y*y);
        }


    }
}
