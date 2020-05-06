/*
  This file contains the structure of the tree and nodes. It also contains functions to recursivly
  build the tree and export it to Treant library.
*/

globalIDcount = 0;
class Node {
    constructor(courseCode){
        this.courseCode = courseCode;
        this.courseName = null;
        this.prerequisites = [];
        this.courseURL = "https://www.kth.se/student/kurser/kurs/" + courseCode;
        this.parentNode = null;
        this._json_id = null;
        this.period = null;
        this.hp = null;
        this.equivalent = [];
    }

    setName(name) {
      this.courseName = name;
    }

    // formats singular node to array format for Treant.js
    // format according to chart simple_chart_config, see main.js and treant docs
    formatNode() {

      if (this.parentNode == null) {
        var arr = {
          _json_id: this._json_id,
          text: { code: this.courseCode, name:this.courseName.replace(" ", " "), hp:this.hp, period:this.period }
        };

        return arr;
      } else {

        var arr = {
          _json_id: this._json_id,
          parent: this.parentNode,
          text: { code: this.courseCode, name:this.courseName.replace(" ", " "), hp:this.hp, period:this.period }
        };

        return arr;
      }
    }


    // BFS to assing _json_id
    //queue is empty on first call
    //no children and no parent means single node, then the recursive step is skipped
    assignIdentifiers(queue) {

      if(this.prerequisites.length == 0 && this.parentNode == null){
        this._json_id = globalIDcount++;
      } else {
        this.prerequisites.forEach(element => {
          queue.push(element);
        });
        this._json_id = globalIDcount++;

        var nextNode = queue.shift();

        if (queue.length > 0 || nextNode.prerequisites.length > 0) {
          nextNode.assignIdentifiers(queue);
        } else {
          nextNode._json_id = globalIDcount;
        }
      }
    }

    // converts all nodes to treant array format and return array with all converted nodes
    exportTree() {

      // add current node to array
      var arr = [this.formatNode()];
      for (var i = 0; i < this.prerequisites.length; i++) {
        arr = arr.concat(this.prerequisites[i].exportTree());
      }

      return arr;
    }

    // input course code
    // expected output is string array of required courses course codes. empty array if none exist
    jsonToArray(){
      var courseCode = this.courseCode;
      var resArr = lookup(courseCode);

      return resArr;
    }

    // adds child node to parent node prerequisites array
    addChild(node){
        this.prerequisites.push(node);
    }

    // adds the couse hp to node
    addHp(hp){
      this.hp = hp
    }
    // adds the periodes in an array the course is given in
    addPeriod(period){
      this.period = period
    }

    // recursively goes through all prerequisites according to json files.
    // fully constructs tree object for later export
    buildTree() {

      // console.log(this.courseCode);
      var lookup = this.jsonToArray();
      var reqArr = lookup[1];
      this.setName(lookup[0]);
      this.addHp(lookup[3]);
      this.addPeriod(lookup[4]);

      // console.log("lookup");
      // console.log(lookup);
      //
      // console.log("reqArr:");
      // console.log(reqArr);
      // console.log("original reqArr");
      // console.log(reqArr);

      for (var i = 0; i < reqArr.length; i++) {
        // console.log("reqArr: "+ i);
        // console.log(reqArr[i]);
        // console.log("loop reqArr");
        // console.log(reqArr);

        console.log("into if");
        console.log(reqArr[i]);
        document.getElementById("loadingText").innerHTML = "Loading " + reqArr[i];

        if (typeof reqArr[i] == "object" & reqArr[i].length > 0) {
          // console.log("is an array");
          // console.log(reqArr[i]);

          var temp = new Node(reqArr[i].shift());



          // make lookup for all equivalents to provide additional info in node objects
          // atm additional info kept for later use?
          // TODO: the code below should be the one running. Error has a "ghost element" in equivalent array
          // reqArr[i].forEach(element => {
          //
          //   temp.equivalent.push(new Node(element).buildTree());
          // });

          // TODO: change row below to code above
          temp.equivalent = reqArr[i];

          temp.parentNode = this;

          this.addChild(temp);
          temp.buildTree();

        } else if (typeof reqArr[i] == "string") {
          // console.log("is string");
          // console.log(reqArr[i]);

          var temp = new Node(reqArr[i]);
          temp.parentNode = this;
          this.addChild(temp);

          temp.buildTree();
        }
      }
      return this;
    }

}
// Node creation
function nodifyLookupMAIN(courseCode) {
  return new Node(courseCode);
}
