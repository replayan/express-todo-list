const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/testDB");

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems)
//   .then(function () {
//     console.log("Successfully saved defult items to DB");
//   })
//   .catch(function (err) {
//     console.log(err);
//   });

app.get("/", (req, res) => {
  let day = date.getDate();
  // res.render("list", { listTitle: day, newListItems: items });

  Item.find({})
    .then((foundItem) => {
      if (foundItem.length === 0) {
        return Item.insertMany(defaultItems);
      } else {
        return foundItem;
      }
    })
    .then(function (foundItems) {
      res.render("list", { listTitle: day, newListItems: foundItems });
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  // const item to be added to the DB
  const item = new Item({
    name: itemName,
  });
  item.save();

  res.redirect("/");

  // to be added to the DB
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", (req, res) => {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

const port = 3000;
app.listen(port, () => console.log(`Server started on port ${port}`));
