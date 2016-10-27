/*---------------------------------------------------
* bamazonManager.js
* RJF
*
* Uses [mysql], [prompt]   
* 
* Show a Menu:
* 		View Products for Sale
*		View Low Inventory
*		Add to Inventory
*		Add New Product
// --------------------------------------------------- */

var prompt = require('prompt');

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'rick',
  password : '***',
  database : 'bamazon'
});
 
connection.connect();

process.stdout.write('\033c');  //clear console. 

//promptUser is a function that shows the current menu items (null to start means no choices were previously made)
promptUser(promptCallback, null);

/*----------------------------------------------------------------------------------------------
promptUser: Prompts the user with "what" (productID) do they want to order and "how much" do they 
		 	do they want (quantity)
	calls : updateOrder
------------------------------------------------------------------------------------------------*/
function promptUser(promptCallback, choice) {
   var choiceid = "";
    
    //------DEFAULT CHOICE (MAIN MENU iS ALWAYS SHOWN WHEN 1,2 ARE SELECTED-----
	if(!choice)
	{
			console.log("=".repeat(40));
			console.log(" ");
			console.log(" 1. View Sales by Department");
			console.log(" 2. Create New Department");
			console.log(" 3. Exit Program");
			console.log(" ");
			console.log("=".repeat(40));
			
			
		 	// Start the prompt 
		   prompt.start();
		 
		 
		  	prompt.get({
		    properties: {
		      choiceID: {
		        description: "Please make a choice (1-3)",
		        message: "Valid choices are 1-3",
		        required: true,
		        conform: function (value) {
		       		 if(!(parseInt(value, 10)))  //make sure it's a number
		       		 	return false;

		       		 if(value<1 || value>3)  	//make sure it's between 1-4
		       			 return false;
		       		        		 
		       		 return true;  // otherwise, it's valid, return true
					}
		      }
		    }
		  }, function (err, result) {
					     choiceid = result.choiceID;
					     promptCallback(null, choiceid);
		  });
	}
	//------END DEFAULT CHOICE -----

	// ----- START: ADD DEPARTMENT ------
	if( choice == 2 ){

			   prompt.start();
			 
			   prompt.get([{
					    name: 'departmentname',
					    description: 'Enter a Department Name',
					    type: 'string',
					    required: true
					  }, {
					    name: 'overheadcost',
					    description: 'What is the overhead cost of this department ($)',
					    type: 'string',
					    required: true,
					    
					  }], function(err, results) {
					    
					    	insertDepartment(results.departmentname, results.overheadcost, promptCallback);
				    
					  });

				}
				// ------- END: ADD DEPARTMENT
}


function insertDepartment(deptName, overheadcost, promptCallback) {
	var str = "";

	str = "INSERT INTO departments (DepartmentName, OverHeadCosts, TotalSales) VALUES (";
	str = str + "'" + deptName + "',";
	str = str + overheadcost + ", 0.00)";  //seed TotalSales with 0.00 since this is a new department


	connection.query(str, function(err, rows, fields) {
			if (err) throw err;
	  
			promptCallback(null, 1);  // Passing in a 1 so viewProductsSalesByDepartment() gets called automatically
	  });
	
}




//------------------------------------------------------------------------------
// promptCallback is a Callback method used by promptUser
//
// Purpose: This method is called BEFORE PromptUser puts the general menu on the
//			screen.  Useful because it will automatically show the results of
//			something you just inserted or updated
//------------------------------------------------------------------------------
function promptCallback(err, data){

	if(err) {
    	console.log(err);
    	return;
  	}

  	if(data==3){
  		connection.end();
  		process.exit();
  	}
  	
	process.stdout.write('\033c');  //clear console. Looks neater than scrolling!
  	
	if(data==1)
		viewProductsSalesByDepartment(null);
	if(data==2)
		viewProductsSalesByDepartment(2);
	

	// Note: At this point, the lines above put data on the screen (i.e. viewProductsSalesByDepartment)
	//       Next, we will return from here to PromptUser where the MENU will be appended
	//		 underneath 
}


//------------------------------------------------------------------------------
// Displays everything in the products table
//------------------------------------------------------------------------------
function viewProductsSalesByDepartment(menuItemSelected) {
  var str="";

 //split str into separate lines to make it easy to read
 str = "SELECT departments.DepartmentID, departments.DepartmentName,";
 str = str + " Format(departments.OverHeadCosts, 0) as OverHeadCosts,";
 str = str + " Format(departments.TotalSales, 0) as TotalSales,";
 str = str + " Format((ifnull(departments.TotalSales,0)-departments.OverHeadCosts),0) as TotalProfit";
 str = str + " FROM departments";
 str = str + " LEFT JOIN";
 str = str + " (SELECT products.DepartmentName FROM products GROUP BY products.DepartmentName) p";
 str = str + " ON (departments.DepartmentName = p.DepartmentName)";
 str = str + " GROUP BY departments.DepartmentName";
 str = str + " ORDER BY departments.DepartmentID";


  connection.query(str, function(err, rows, fields) {
  
  if (err) throw err;

	for (var i = 0; i < rows.length; i++) {
		
		if(i==0) { 
		   console.log("Dept  " + rightpad("Dept", ' ', 25) + "  " + leftpad("Overhead", 10, ' ') + "   " + leftpad("Product", 10, ' ') + "   " + leftpad("Total", 10, ' '));	
		   console.log("ID    " + rightpad("Name", ' ', 25) + "  " + leftpad("Costs", 10, ' ') + "   " + leftpad("Sales", 10, ' ') + "   " + leftpad("Profit", 10, ' '));	
		   console.log("=".repeat(70));
		}
    	
    	var str = String(rows[i].DepartmentID + "   ").slice(0,4);  //aligns the ID by padding " " so 1 and 10 are same string size
    	console.log(str + "  " + rightpad(rows[i].DepartmentName, ' ', 25) + "  " + leftpad(rows[i].OverHeadCosts, 10, ' ') + "   " + leftpad(rows[i].TotalSales, 10, ' ') + "   " + leftpad(rows[i].TotalProfit, 10, ' '));
	}

	console.log("");  //add a space.  Looks cleaner on the screen

	promptUser(promptCallback, menuItemSelected);
});
}


//------------------------------------------------------------------------------
// Two simple functions to help us align values in the console
//------------------------------------------------------------------------------
function leftpad (s, len, ch) {
  s = String(s);
  var i = -1;
  if (!ch && ch !== 0) ch = ' ';
  len = len - s.length;
  while (++i < len) {
    s = ch + s;
  }
  return s;
}
 
// right padding s with c to a total of n chars
function rightpad(s, ch, n) {
  if (! s || ! ch || s.length >= n) {
    return s;
  }
  var max = (n - s.length)/ch.length;
  for (var i = 0; i < max; i++) {
    s += ch;
  }
  return s;
}