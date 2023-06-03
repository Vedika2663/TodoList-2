
const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require('mongoose');
const _ = require('lodash');

const date = require(__dirname + "/date.js");
const day = date.getDate();

mongoose.connect("mongodb+srv://vedikachowdhary2003:t4fdMSk3taKyQy6R@cluster0.ko87hig.mongodb.net/todolist");

const itemSchema = new mongoose.Schema({
  name: String,
}
);
const Item=mongoose.model("Item",itemSchema);
const item1=new Item({
  name:"Welcome to ypur todolist"
});
const item2=new Item({
  name:"Hit + to add a new item"
});
const item3=new Item({
  name:"<--- Hit to del a item"
});

const defaultItems=[item1,item2,item3];
//Item.insertMany(defaultItems);

const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res) {

Item.find().then((data)=>{
          res.render("list", {listTitle: day, newListItems: data});
  });

});

app.post("/", function(req, res){
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

  if (listName===day){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then(function(data){
      data.items.push(item);
      data.save();
      res.redirect("/"+listName);
    })
  }

 
});
app.post("/delete",function(req,res){
  const check= req.body.check;
  const listName=req.body.listName;
  if(listName===day){
    Item.findByIdAndRemove(check).then((err)=>{
      if(err){
          console.log(err);
      }else{
          console.log("success");
      }
      res.redirect("/");
      
  })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:check}}}).then((err)=>{
    if(err){
      console.log(err);
    }else{
      console.log("success");
    }
    res.redirect("/"+listName);
  })
}
});

app.get("/:topic", function(req,res){
  const title=_.capitalize(req.params.topic);

  List.findOne({name:title}).then(function(data){
      if (!data) {
        const list=new List({
          name:title,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+title);
          //res.render("list", {listTitle: data.name, newListItems: data.items});

      } else{
          res.render("list", {listTitle: data.name, newListItems: data.items});
      }
      //res.redirect("/"+title);
    }
  )
});

app.listen(process.env.PORT ||3000, function() {
  console.log("Server started on port 3000");
});
