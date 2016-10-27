#Homework (10/27): Node.js & MySQL
#Author: Rick Fahey (Rutgers Coding Bootcamp)

### Overview

In this homework assignment, I created a fictional online store called bamazon that is powered by node.js and MySQL.

[Click here to see a working  Customer demo](https://youtu.be/8t88L6Xtd38)

[Click here to see a working Manager demo](https://youtu.be/wi9SQ2i2sgk)

[Click here to see a working Executive demo](https://youtu.be/J7qczcwahQM)

For demo purposes, I consistently display the menu under the results so the user doesn't have to return to the command prompt


### I) Customer View 


 Queries the MySQL products table and displays the following fields:
	* ItemID 
	* ProductName
	* DepartmentName 
	* Price
	* StockQuantity


### II) Manager View 

 Create a new Node application called `BamazonManager.js`. Running this application will:

	Shows the following menu options (actions)
		* View Products for Sale (query products table and shwo ID, Product Name, Price and Quantity)
		* View Low Inventory (query products table and only return quantity < 5)
		* Add to Inventory (another prompt asks user to add items to a particular department)
		* Add New Product (adds a brand new Product to the store)

### III) Executive View 

 Created a new table named Departments with the following fields:
	* DepartmentID
	* DepartmentName
	* OverHeadCosts
	* TotalSales
