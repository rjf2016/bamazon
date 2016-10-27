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
			console.log(" 1. View Products for Sale");
			console.log(" 2. View Low Inventory");
			console.log(" 3. Add to Inventory");
			console.log(" 4. Add New Product");
			console.log(" 5. Exit Program");
			console.log(" ");
			console.log("=".repeat(40));
			
			
		 	// Start the prompt 
		   prompt.start();
		 
		 
		  	prompt.get({
		    properties: {
		      choiceID: {
		        description: "Please make a choice (1-5)",
		        message: "Valid choices are 1-5",
		        required: true,
		        conform: function (value) {
		       		 if(!(parseInt(value, 10)))  //make sure it's a number
		       		 	return false;

		       		 if(value<1 || value>5)  	//make sure it's between 1-4
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

	// ----- START: ADD TO INVENTORY ------
	if( choice == 3 ){

			 // Start the prompt 
			  prompt.start();
			 
			 
			  prompt.get({
			    properties: {
			      productID: {
			        description: "Which Item would you like to Add to?",
			        message: "Please select a valid product ID",
			        required: true,
			        conform: function (value) {
			       		 if(!(parseInt(value, 10)))  //make sure it's a number
			       		 	return false;

			       		 if(value<1)  	//make sure it's between 1-10
			       			 return false;
			       		        		 
			       		 return true;  // otherwise, it's valid, return true
						}
			      }
			    }
			  }, function (err, result) {
			     //console.log("You said your Item is: " + result.productID);
			     productid = result.productID;

						prompt.get({
						    properties: {
						      quantity: {
						        description: "Please enter a quantity to add",
						        message: "Please enter a valid quanity",
						        required: true,
						        conform: function (value) {
						       		 if(!(parseInt(value, 10)))  //make sure it's a number
						       		 	return false;

						       		 if(value<1)  	//make sure quantity is greater than 0.  should probably check a high value too!
						       			 return false;
						       		        		 
						       		 return true;  // otherwise, it's valid, return true
									}
						      }
						    }
						  }, function (err, result) {
						     quantity = result.quantity;
						     updateOrder(productid, quantity, promptCallback);
						  });

			  });

	}
	// ------- END: ADD TO INVENTORY


		// ----- START: ADD PRODUCT ------
	if( choice == 4 ){

			   prompt.start();
			 
			   prompt.get([{
					    name: 'productname',
					    description: 'Enter a Product Name',
					    type: 'string',
					    required: true
					  }, {
					    name: 'deptname',
					    description: 'Enter a Department Name',
					    type: 'string',
					    required: true,
					    
					  }, {
					    name: 'price',
					    description: 'Set the Price',
					    type: 'string',
					    required: true,
					    
					  }, {
					    name: 'quantity',
					    description: 'Set the Quantity',
					    type: 'string',
					    required: true,
					  }], function(err, results) {
					    
					    	insertProduct(results.productname, results.deptname, results.price, results.quantity, promptCallback);
				    
					  });

				}
				// ------- END: ADD PRODUCT
}


function updateOrder(productID, quantity, promptCallback) {
	connection.query('UPDATE products SET StockQuantity = StockQuantity + ' + String(quantity) + ' WHERE ItemID = ' + String(productID), function(err, rows, fields) {
			if (err) throw err;
			promptCallback(null, 1);
	  });
}

function insertProduct(productName, deptName, price, quantity, promptCallback) {
	var str = "";

	str = "INSERT INTO products (ProductName, DepartmentName, StockQuantity, Price) VALUES (";
	str = str + "'" + productName + "',";
	str = str + "'" + deptName + "',";
	str = str + quantity + ",";
	str = str + price + ")";


	connection.query(str, function(err, rows, fields) {
			if (err) throw err;
	  
			promptCallback(null, 1);  // Passing in a 1 so the VIEW ALL PRODUCTS gets called automatically
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

  	if(data==5){
  		connection.end();
  		process.exit();
  	}
  	
	process.stdout.write('\033c');  //clear console. Looks neater than scrolling!
  	
	if(data==1)
		viewProductsForSale();
	if(data==2)
		viewLowInventory();
	if(data==3)
	    viewInventory(3);
	if(data==4)
	   viewInventory(4);

	// Note: At this point, the lines above put data on the screen (i.e. all products)
	//       Next, we will return from here to PromptUser where the MENU will be appended
	//		 underneath 
}


//------------------------------------------------------------------------------
// Displays Products and Quantity in Inventory
//------------------------------------------------------------------------------
function viewInventory(menuItemSelected) {

  connection.query('SELECT ItemID, ProductName, StockQuantity FROM products', function(err, rows, fields) {
  
  if (err) throw err;
 
	for (var i = 0; i < rows.length; i++) {
		if(i==0) { //for the first row only, show column headers (Id, Product Name, Cost)
		   console.log("ID  " + rightpad("Product", ' ', 45) + "   " + leftpad("Quantity", 10, ' '));	
		   console.log("=".repeat(75));
		 }
    	
    	var str = String(rows[i].ItemID + " ").slice(0,2);  //aligns the ID by padding " " so 1 and 10 are same string size
    	console.log(str + "  " + rightpad(rows[i].ProductName, ' ', 45) + "   " + leftpad(rows[i].StockQuantity, 10, ' '));
	}

	console.log("");  //add a space.  Looks cleaner on the screen

   //Find the correct question menu to show under all the products
	promptUser(promptCallback, menuItemSelected);  //menuItemSelected is either 3 (add inventory) or 4 (add new product)
});
}

//------------------------------------------------------------------------------
// Displays everything in the products table
//------------------------------------------------------------------------------
function viewProductsForSale() {

  connection.query('SELECT ItemID, ProductName, FORMAT(Price, 2) AS Price, StockQuantity FROM products', function(err, rows, fields) {
  
  if (err) throw err;
 
	for (var i = 0; i < rows.length; i++) {
		
		if(i==0) { //for the first row only, show column headers (Id, Product Name, Cost)
		   console.log("ID  " + rightpad("Product", ' ', 45) + "  $" + leftpad("Price", 10, ' ') + "   " + leftpad("Quantity", 10, ' '));	
		   console.log("=".repeat(75));
		 }
    	
    	var str = String(rows[i].ItemID + " ").slice(0,2);  //aligns the ID by padding " " so 1 and 10 are same string size
    	console.log(str + "  " + rightpad(rows[i].ProductName, ' ', 45) + "  $" + leftpad(rows[i].Price, 10, ' ') + "   " + leftpad(rows[i].StockQuantity, 10, ' '));
	}

	console.log("");  //add a space.  Looks cleaner on the screen

	promptUser(promptCallback, null);
});
}

//------------------------------------------------------------------------------
// Displays only products where Quantity < 5 (low inventory)
//------------------------------------------------------------------------------
function viewLowInventory(){

  connection.query('SELECT ItemID, ProductName, FORMAT(Price, 2) AS Price, StockQuantity FROM products WHERE StockQuantity < 5', function(err, rows, fields) {
  
  if (err) throw err;
 
	for (var i = 0; i < rows.length; i++) {
		
		if(i==0) { //for the first row only, show column headers (Id, Product Name, Cost)
		   console.log("ID  " + rightpad("Product", ' ', 45) + "  $" + leftpad("Price", 10, ' ') + "   " + leftpad("Quantity", 10, ' '));	
		   console.log("=".repeat(75));
		 }
    	
    	var str = String(rows[i].ItemID + " ").slice(0,2);  //aligns the ID by padding " " so 1 and 10 are same string size
    	console.log(str + "  " + rightpad(rows[i].ProductName, ' ', 45) + "  $" + leftpad(rows[i].Price, 10, ' ') + "   " + leftpad(rows[i].StockQuantity, 10, ' '));
	}

	if(rows.length==0){  // no results means ALL inventory is fully stocked
		console.log("");
		console.log("There are no low inventory levels at this time");
		console.log("");
	}
	
	console.log("");  //add a space.  Looks cleaner on the screen

	promptUser(promptCallback, null);
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