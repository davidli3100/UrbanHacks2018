
    

    function distFromLine(p1, n) {
        
        
        var m = n.getNr();
        var p1s = new pair(100, 100*m);
        
        
        var l2 = new line(p1,p1s);
        var p2 = n.getIntersection(l2);
        
        
        
        return 
        
    }

    class line {
        constructor(p1, p2) {
            this.p1 = p1
            this.p2 = p2
        }
        // let p1;
        // let p2;

        line(p1, p2){
            this. p1 = p1;
            this. p2 = p2;
        }
       getSlope() {
            if (p1.x == p2.x) {
                //close enough to infinity amirite?
                return Double.MAX_VALUE;
            } else {
                return (p1.y - p2.y) / (p1.x - p2.x);
            }
        }
      getYInt(){
            var m = getSlope();
            return - m * p1.x;
        }
        
        getNr(){
            if(getSlope() == 0){
                return Double.MAX_VALUE;
            }else{
                return -1/getSlope();
            }
        }

       getIntersection(l){
            var m1 = getSlope();
            var m2 = l.getSlope();
            var b1 = getYInt();
            var b2 = getYInt();
            if(m1 == m2) {
                return null;
            }else{
                var mF = m1 - m2;
                var bF = b1 - b2;
                var xF = -bF/mF;
                var yF = m1*xF + bF;
                return new pair(xF, yF);
            }
        }

    }
    class pair {
        constructor(x, y) {
            this.x = x;
            this.y = y
        }
        // var x;
        // var y;
        pair(x, y){
            this.x = x;
            this.y = y;
        }

        toString() {
            return "(" + x + "," + y + ")";
        }
        
       dist(p){
            
            var x, y;
            x = this.x - p.x;
            y = this.y - p.y;
            
            return Math.sqrt(x*x + y*y);
        }


    }
}

let p1,p2,p3,p4;
p1 = new pair(-1,-1);
p2 = new pair(1,1);
p3 = new pair(1,-1);
p4 = new pair(-1,1);
var l1 = new line(p1,p2);
var l2 = new line(p3,p4);
console.log(l1.getIntersection(l2));