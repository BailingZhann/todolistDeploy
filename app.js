//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); //import mongoose
const _ = require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//set up connection with mongoose server
mongoose.connect("mongodb+srv://admin-bailing:ImgOvwuidIvekQCC@cluster0.a9ifcog.mongodb.net/todolistDB", {useNewUrlParser: true});

//create a new schema named todoitems
const itemsSchema = {
  name: {
    type: String,
    required: [true, "Missing content here!"]
  }
};

//list schema for different list
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//create a new collection/model
const Item = mongoose.model("item", itemsSchema);

//create three initial documents
const item1 = new Item({
  name: "This is my first post."
});
const item2 = new Item({
  name: "This is my second post."
});
const item3 = new Item({
  name: "This is my third post."
});

const defaultItems = [item1, item2, item3];

//const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

  //const day = date.getDate();
  //read data from db
  Item.find({})
  .then(function(foundItems){
    if (foundItems.length === 0) {
      //use insert many for array to mongoose collection
      Item.insertMany(defaultItems)
      .then(function(){
        console.log("Data inserted!");
      })
      .catch(function(err){
        console.log(err);
      });
  // res.redict after default data inserted
      res.redirect("/");
     } else {
          //render the web if items found
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
  .catch(function(err){
    console.log(err);
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem; //get from input
  const listName = req.body.list; //get from button

  //create a new document in mongoose
  const item = new Item({
  name: itemName
  });

  if (listName === "Today") {
    //from home route
    item.save();
    res.redirect("/");
  } else {
    //from customer route
    List.findOne({name: listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch(function(err){
      console.log(err);
    })
  }
});

//post request for checkbox
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
    .then(function(){
      res.redirect("/");
    })
    .catch(function(err){
      console.log(err);
    })
  } else {
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemId}}})
    .then(function(){
      res.redirect("/" + listName);
    })
    .catch(function(err){
      console.log(err);
    });
  }
});

  

//route params
app.get("/:customerListName", function(req, res){
  const customerListName = _.capitalize(req.params.customerListName);

  List.findOne({name: customerListName})
  .then(function(foundList){
    if (!foundList) {
      //create a new list
      const list = new List({
        name: customerListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customerListName);
    } else {
      //show existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch(function(err){
    console.log(err);
  });
  
  });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
