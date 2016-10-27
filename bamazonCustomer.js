/*---------------------------------------------------
* bamazonCustomer.js
* RJF
*
* Uses [mysql], [prompt]   //installed via NPM
* 
* Displays all available products from DB
* Prompt user to select a product using productID
* Prompt user to select a quantity for the selected product
* Check the quanity against the DB
* If enough exist in inventory, show the user the total
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


//Show all the products in our database table "products"
//showProducts();

/*----------------------------------------------------------------------------------------------
promptUser: Prompts the user with "what" (productID) do they want to order and "how much" do they 
		 	do they want (quantity)
	calls : updateOrder
------------------------------------------------------------------------------------------------*/
function promptUser(promptCallback, choice) {

			  
	if(!choice)
	{
			console.log("=".repeat(40));
			console.log(" ");
			console.log(" 1. Make a Purchase");
			console.log(" 2. Exit Program");
			console.log(" ");
			console.log("=".repeat(40));
			
		 	// Start the prompt 
		   prompt.start();
		 
		  	prompt.get({
		    properties: {
		      choiceID: {
		        description: "Please make a choice",
		        message: "valid choices are 1 or 2",
		        required: true,
		        conform: function (value) {
		       		 if(!(parseInt(value, 10)))  //make sure it's a number
		       		 	return false;

		       		 if(value<1 || value>2)  	//make sure it's between 1-4
		       			 return false;
		       		        		 
		       		 return true;  // otherwise, it's valid, return true
					}
		      }
		    }
		  }, function (err, result) {
					     choiceid = result.choiceID;

						if(choiceid==2){
							connection.end();
  							process.exit();
  						}

					     promptCallback(null, 10);
		  });
	}

	if(choice==1){
			   prompt.start();
			 
			   prompt.get([{
					    name: 'productid',
					    description: 'Which Item would you like to Purchase?',
					    type: 'string',
					    required: true
					  }, {
					    name: 'quantity',
					    description: 'Please enter a quantity',
					    type: 'string',
					    required: true,
					    
					  }], function(err, results) {
					    	updateOrder(results.productid, results.quantity, promptCallback);
			    
					  });

				}
}


function promptCallback(err, data){

	if(err) {
    	console.log(err);
    	return;
  	}

  	if(data==2)
  		process.exit();
  	
	process.stdout.write('\033c');  //clear console. Looks neater than scrolling!
  	
	if(data==10)
		showProducts();
	
	// Note: At this point, the lines above put data on the screen (i.e. all products)
	//       Next, we will return from here to PromptUser where the MENU will be appended
	//		 underneath 
}


/*----------------------------------------------------------------------------------------------
showProducts: 
		Selects records from the products table and displays them on screen
		Finally, call promptUser to ask what products and quanity user wants
------------------------------------------------------------------------------------------------*/

function showProducts() {

  process.stdout.write('\033c');  //clear console. Looks neater than scrolling!

  connection.query('SELECT ItemID, ProductName, FORMAT(Price, 2) AS Price FROM products', function(err, rows, fields) {
  
  if (err) throw err;
 
	for (var i = 0; i < rows.length; i++) {
		
		if(i==0) { //for the first row only, show column headers (Id, Product Name, Cost)
		   console.log("ID  " + rightpad("Product", ' ', 45) + "  $" + leftpad("Price", 10, ' '));	
		   console.log("=".repeat(65));
		 }
    	
    	var str = String(rows[i].ItemID + " ").slice(0,2);  //aligns the ID by padding " " so 1 and 10 are same string size
    	console.log(str + "  " + rightpad(rows[i].ProductName, ' ', 45) + "  $" + leftpad(rows[i].Price, 10, ' '));
	}

	console.log("");  //add a space.  Looks cleaner on the screen

	promptUser(promptCallback, 1);
  
});
}

/*----------------------------------------------------------------------------------------------
updateOrder: Called from promptUser function once user chooses a valid productId and quanity
		1) Query products table for the given product to check if there are enough of them to satisfy
			the customer request
		2) If there are enough in inventory, update the database with the new quanity 
		3) Display the total order details
------------------------------------------------------------------------------------------------*/

function updateOrder(productID, quantity, promptCallback) {
	var totalCost = 0;
	var deptName = "";

  	//First Check if enough quantity
  	connection.query('SELECT StockQuantity, Price, DepartmentName FROM products WHERE ItemID = ' + String(productID), function(err, rows, fields) {
  
		if (err) throw err;
  
  		if(rows[0].StockQuantity < quantity)
  		{
  			console.log(" ");
			console.log("[  Insufficient quantity available!  ]");
			console.log(" ");
			promptUser(promptCallback, null);
			return;
		}
		else{
			totalCost = rows[0].Price * quantity;
			deptName = rows[0].DepartmentName;

			//Next, Reduce the StockQuantity since an order was made
			connection.query('UPDATE products SET StockQuantity = StockQuantity - ' + String(quantity) + ' WHERE ItemID = ' + String(productID), function(err, rows, fields) {
			  
				if (err) throw err;
			  
					console.log("=".repeat(40));
					console.log(" ");
					console.log(" Thanks! Your order was accepted!");
					console.log(" ");
					console.log(" Your order total is: $" + totalCost.toFixed(2));
					console.log(" ");
					console.log("=".repeat(40));


					//Next, update the TotalSales field in the new Departments Table  (TODO: probably should put the two Updates together rather than call separately)
					connection.query("UPDATE departments SET TotalSales = TotalSales + " + totalCost + " WHERE DepartmentName = '" + deptName + "'", function(err, rows, fields) {
			  				if (err) throw err;
			  		});



					promptUser(promptCallback, null);
				});

				
			 
				
		}
	});
}


//Two simple functions to help us align values in the console
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