"use strict";

var Promise = require("bluebird");
var db = require("./db");
var db_util = require("./db-util")

module.exports={

	getTagIdsFor:function(MovieId){
		return db("tag_movie").pluck("tag_id").where("movie_id", MovieId).then();
	},

	getActorIdsFor:function(MovieId){
		return db("actor_movie").pluck("person_id").where("movie_id", MovieId).then();
	},
	listTags:function(){
		return db.select("id", "name as text").from("tag").then();
	},
 
	listRatings:function(){
		return db.select("id", "name as text").from("rating").then();
	},

	getMovie : function(MovieId){
		return db("movie as m")
				.join("person as p", "p.id", "m.director_id")
				.select("m.*", "p.name")
				.where("m.id", MovieId)
				.first().then()
	},

	listTagsFor:function(MovieId){
		return db("tag as t")
				.select("id", "name as text")
				.joinRaw("JOIN tag_movie tm ON tm.tag_id = t.id AND tm.movie_id=?", MovieId)
				.then();
	},

	listActorsFor:function(MovieId){
		return db("person as p")
				.select(db.raw("p.id, p.firstname || ' ' || p.lastname as text"))
				.joinRaw("JOIN actor_movie am ON am.person_id = p.id AND am.movie_id=?", MovieId)
				.then();
	},

	getEditInfo:function(MovieId){
		var pMovie = this.getMovie(MovieId),
			pActors = this.listActorsFor(MovieId),
			pTags = this.listTagsFor(MovieId);

		return Promise.all([pMovie, pActors, pTags]).then(function(rslt){
			var movie = rslt[0];
			movie.actors = rslt[1];
			movie.tags = rslt[2];

			return movie;
		})
	},

	listMovies:function(qf){
		var result = {},
			sort = qf.sort,
			pgSize = Math.min(qf.pgSize, 10),
			offset = (qf.pgNum-1)*pgSize;

		return db("movie").count("* as total").then(function(rows){
			result.total = rows[0].total;
		})
		.then(function(){
			return db("movie as m")
					.select("m.id", "m.title", "m.lastplaydt", "m.score", "m.runtime",
							"m.releaseyr", "r.name as rating")
					.join("rating as r", "r.id", "m.rating_id")
					.limit(pgSize).offset(offset)
					//.orderBy(sort.column, sort.direction)
					.then();
		})
		.then(function(rows){
			result.pgSize = pgSize
			result.items = rows
			return result;
		});
	},

	deleteMovie:function(MovieId){
		return db("movie").where("id", MovieId).del().then();
	},

	add:function(movie){
		var actors = movie.actors,
			tags = movie.tags;
		delete movie.tags;
		delete movie.actors;
		delete movie.id;

		return db.transaction(function(trx){
			return trx
				.insert(movie, "id").into("movie")
				.then(function(ids){
					movie.id = ids[0];
					actors = db_util.idToMMObjArr("person_id", actors, "movie_id", ids[0]);
					tags = db_util.idToMMObjArr("tag_id", tags, "movie_id", ids[0]);
					return trx.insert(actors).into("actor_movie");
				})
				.then(function(){
					return trx.insert(tags).into("tag_movie");
				})
				.then(function(){
					return movie.id;
				})
		})
	},

	updateMovie:function(movie){
		var pActors= movie.actors,
			pTags = movie.tags,
			id = movie.id;
		delete movie.actors;
		delete movie.id;
		delete movie.tags;

		var actorDelta, tagDelta;

		return Promise.all([this.getActorIdsFor(id), this.getTagIdsFor(id)]).then(function(rslts){
			actorDelta = db_util.getMMDelta(pActors, rslts[0], "person_id", "movie_id", id);
			tagDelta = db_util.getMMDelta(pTags, rslts[0], "tag_id", "movie_id", id);
		})
		.then(function(){
			return db.transaction(function(trx){
				return Promise.all([
						trx("movie").where("id", id).update(movie),
						trx("tag_movie").whereIn("tag_id", tagDelta.del).andWhere("movie_id", id).del(),
						trx("actor_movie").whereIn("tag_id", actorDelta.del).andWhere("movie_id", id).del(),
						trx.insert(actorDelta.add).into("actor_movie"),
						trx("tag_movie").insert(tagDelta.add)
					]);
			})
		})
	}
}