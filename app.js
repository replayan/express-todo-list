const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const app = express();

// let items = ["Buy Food", "Cook Food", "Eat Food"];
// let workItems = [];

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/testDB");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  let day = date.getDate();
  res.render("list", { listTitle: day, newListItems: items });
});

app.post("/", (req, res) => {
  const item = req.body.newItem;

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
