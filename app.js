// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

// Connect to the database
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
}

// Create an Express application
const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");

// Use body-parser to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Define the Mongoose schema for to-do items
const itemsSchema = new mongoose.Schema({
  name: String,
});

// Create a Mongoose model based on the schema
const Item = mongoose.model("Item", itemsSchema);

// Define the default to-do items
const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an iitem.",
});

// Store the default items in an array
const defaultItems = [item1, item2, item3];

// Define the Mongoose schema for to-do lists
const listSchema = {
  name: String,
  items: [itemsSchema],
};

// Create a Mongoose model based on the schema
const List = mongoose.model("List", listSchema);

// Define an array to store work items (unused in this version of the app)
const workItems = [];

// Handle GET requests to the root path
app.get("/", function (req, res) {
  // Find all items in the Item collection
  Item.find({})
    .then((foundItems) => {
      // If there are no items in the collection, insert the default items
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(function (docs) {
            // Handle success
            console.log("Insertion successful");
          })
          .catch(function (error) {
            // Handle error
            console.log("Insertion failed", error);
          });
        // Redirect to the root path to display the items
        res.redirect("/");
      } else {
        // Render the "list" template with the found items
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
// Define a route for handling POST requests to the home page ("/").
// The request body contains a new item to be added to a list.
app.post("/", function (req, res) {
  // Extract the name of the new item from the request body.
  const itemName = req.body.newItem;

  // Extract the name of the list where the new item will be added from the request body.
  const listName = req.body.list;

  // Print the name of the list to the console for debugging purposes.
  console.log("the list name is " + listName);

  // Create a new Item object with the name of the new item.
  const newItem = new Item({
    name: itemName,
  });

  // If the list name is "Today", add the new item to the database and redirect to the home page.
  // Otherwise, find the corresponding list in the database and add the new item to it.
  if (listName === "Today") {
    newItem
      .save()
      .then(() => {
        console.log("New item added to database: " + itemName);
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      if (!foundList) {
        console.log(`List ${listName} not found.`);
        console.log("the list name is: " + listName);
      }
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// Define a route for handling POST requests to the "/delete" URL.
// The request body contains the ID of the item to be deleted from a list.
app.post("/delete", function (req, res) {
  // Extract the ID of the item to be deleted from the request body.
  const checkedItemId = req.body.checkbox;

  // Extract the name of the list where the item to be deleted belongs from the request body.
  const listName = req.body.list;

  // Print the name of the list to the console for debugging purposes.
  console.log("the list name is: " + listName);

  // If the list name is "Today", remove the item from the database and redirect to the home page.
  // Otherwise, find the corresponding list in the database and remove the item from it.
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(() => {
        console.log("We have removed the item with id: " + checkedItemId);
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        if (foundList) {
          foundList.items.pull({ _id: checkedItemId });
          return foundList.save();
        }
      })
      .then(() => {
        console.log(
          "We have removed the item with id: " +
            checkedItemId +
            " from " +
            listName +
            " list"
        );
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
// Route for handling requests to a custom list page
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  // Check if a list with the given name exists in the database
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        // If the list doesn't exist, create a new one with default items and save it to the database
        console.log(customListName + " not found, creating new list...");
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list
          .save()
          .then(() => {
            console.log("New list created and saved to the database.");
            res.redirect("/" + customListName); // Redirect the user to the new list's page
          })
          .catch((err) => {
            console.log("Error saving new list to the database:", err);
          });
      } else {
        // If the list exists, render its items to the list view
        console.log("List already exists.");
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.log("Error finding list:", err);
    });
});

// Start the server on port 3000 and log a message to the console
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
