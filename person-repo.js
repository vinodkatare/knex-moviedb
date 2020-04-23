"use strict";

var Promise = require("bluebird");
var db = require("./db");

module.exports={
	listPersons : function(key){
		return db.select("name").from("person").whereRaw("name like '%' || ?|| '%'",key).then();
	},

	addPerson:function(person){
		return db("person").insert(person,"id").then();

	}
}